import React, { useState, useEffect, useCallback } from 'react';
import { initializeApp } from 'firebase/app';
import { getAuth, signInAnonymously, signInWithCustomToken, onAuthStateChanged } from 'firebase/auth';
import {
  getFirestore,
  doc,
  setDoc,
  collection,
  onSnapshot,
  query,
  where,
  addDoc,
  serverTimestamp,
  updateDoc
} from 'firebase/firestore';

const appId = typeof __app_id !== 'undefined' ? __app_id : 'default-app-id';
const firebaseConfig = JSON.parse(typeof __firebase_config !== 'undefined' ? __firebase_config : '{}');
const initialAuthToken = typeof __initial_auth_token !== 'undefined' ? __initial_auth_token : null;

const fileToBase64 = (file) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result);
    reader.onerror = (error) => reject(error);
  });
};

// Icon Components
const UsersIcon = () => (
  <svg className="w-8 h-8 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
  </svg>
);

const DocumentIcon = () => (
  <svg className="w-8 h-8 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
  </svg>
);

const TrendingUpIcon = () => (
  <svg className="w-8 h-8 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
  </svg>
);

const UploadIcon = () => (
  <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
  </svg>
);

const ChartIcon = () => (
  <svg className="w-6 h-6 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
  </svg>
);

const ReviewApp = () => {
  const [db, setDb] = useState(null);
  const [auth, setAuth] = useState(null);
  const [userId, setUserId] = useState(null);
  const [isAuthReady, setIsAuthReady] = useState(false);
  const [uploadFile, setUploadFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [uploadMessage, setUploadMessage] = useState('');
  const [reviewItems, setReviewItems] = useState([]);
  const [myUploads, setMyUploads] = useState([]);
  const [reviewComment, setReviewComment] = useState({});
  const [showModal, setShowModal] = useState(false);
  const [modalContent, setModalContent] = useState({ title: '', message: '' });
  const [isDragging, setIsDragging] = useState(false);

  const showCustomModal = (title, message) => {
    setModalContent({ title, message });
    setShowModal(true);
  };

  const getCollectionRef = (collectionName) => {
    if (!db || !userId) return null;
    return collection(db, 'artifacts', appId, 'public', 'data', collectionName);
  };

  useEffect(() => {
    try {
      if (Object.keys(firebaseConfig).length === 0) {
        console.error("Firebase config is missing.");
        return;
      }
      const app = initializeApp(firebaseConfig);
      const firestore = getFirestore(app);
      const fireAuth = getAuth(app);
      setDb(firestore);
      setAuth(fireAuth);
      const authenticate = async () => {
        try {
          if (initialAuthToken) {
            await signInWithCustomToken(fireAuth, initialAuthToken);
          } else {
            await signInAnonymously(fireAuth);
          }
        } catch (error) {
          console.error("Firebase Auth failed:", error);
          showCustomModal("Errore di Autenticazione", "Impossibile accedere ai servizi Firebase.");
        }
      };
      authenticate();
      const unsubscribe = onAuthStateChanged(fireAuth, (user) => {
        if (user) {
          setUserId(user.uid);
          console.log("Authenticated User ID:", user.uid);
        } else {
          console.log("User signed out or anonymous.");
        }
        setIsAuthReady(true);
      });
      return () => unsubscribe();
    } catch (e) {
      console.error("Firebase initialization failed:", e);
      showCustomModal("Errore di Inizializzazione", "Impossibile avviare l'applicazione. Controlla la configurazione Firebase.");
    }
  }, []);

  useEffect(() => {
    if (!isAuthReady || !db) return;
    const itemsRef = getCollectionRef('review_items');
    if (!itemsRef) return;
    const q = query(itemsRef, where('status', '==', 'pending'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const items = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt ? doc.data().createdAt.toDate().toLocaleString('it-IT') : 'N/D'
      }));
      setReviewItems(items);
      console.log(`Fetched ${items.length} items for review.`);
    }, (error) => {
      console.error("Error fetching review items:", error);
    });
    return () => unsubscribe();
  }, [isAuthReady, db, userId]);

  useEffect(() => {
    if (!isAuthReady || !db || !userId) return;
    const itemsRef = getCollectionRef('review_items');
    if (!itemsRef) return;
    const q = query(itemsRef, where('uploaderId', '==', userId));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const items = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt ? doc.data().createdAt.toDate().toLocaleString('it-IT') : 'N/D',
        reviewedAt: doc.data().reviewedAt ? doc.data().reviewedAt.toDate().toLocaleString('it-IT') : 'In attesa'
      }));
      setMyUploads(items);
      console.log(`Fetched ${items.length} uploads for user ${userId}.`);
    }, (error) => {
      console.error("Error fetching user uploads:", error);
    });
    return () => unsubscribe();
  }, [isAuthReady, db, userId]);

  const handleFileUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      setUploadFile(file);
      setUploadMessage(`File "${file.name}" caricato con successo. Processo in coda.`);
    } else {
      setUploadFile(null);
      setUploadMessage('');
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) {
      setUploadFile(file);
      setUploadMessage(`File "${file.name}" caricato con successo. Processo in coda.`);
    }
  };

  const handleUploadSubmit = async () => {
    if (!uploadFile || !db || !userId) {
      showCustomModal("Errore di Caricamento", "Assicurati di aver selezionato un file e di essere autenticato.");
      return;
    }
    setUploading(true);
    try {
      const base64Data = await fileToBase64(uploadFile);
      const itemsRef = getCollectionRef('review_items');
      if (!itemsRef) {
        throw new Error("Riferimento alla collezione non disponibile.");
      }
      await addDoc(itemsRef, {
        fileName: uploadFile.name,
        mimeType: uploadFile.type,
        data: base64Data,
        status: 'pending',
        uploaderId: userId,
        createdAt: serverTimestamp(),
        reviewerId: null,
        reviewComment: null,
        reviewedAt: null,
      });
      showCustomModal("Caricamento Riuscito", `Il file "${uploadFile.name}" è stato caricato per la revisione.`);
      setUploadFile(null);
      setUploadMessage('');
      document.getElementById('file-upload-input').value = '';
    } catch (error) {
      console.error("Upload failed:", error);
      showCustomModal("Errore di Caricamento", `Caricamento non riuscito: ${error.message}`);
    } finally {
      setUploading(false);
    }
  };

  const handleReviewAction = async (itemId, action) => {
    if (!db || !userId) {
      showCustomModal("Errore", "Utente non autenticato.");
      return;
    }
    const comment = reviewComment[itemId] || '';
    if (action === 'rejected' && comment.trim() === '') {
      showCustomModal("Azione Richiesta", "Devi fornire un commento per rifiutare un elemento.");
      return;
    }
    try {
      const itemDocRef = doc(getCollectionRef('review_items'), itemId);
      await updateDoc(itemDocRef, {
        status: action,
        reviewerId: userId,
        reviewComment: comment,
        reviewedAt: serverTimestamp(),
      });
      showCustomModal("Revisione Completata", `Elemento ${itemId} è stato ${action === 'approved' ? 'APPROVATO' : 'RIFIUTATO'}.`);
      setReviewComment(prev => ({ ...prev, [itemId]: '' }));
    } catch (error) {
      console.error(`Error performing review action (${action}):`, error);
      showCustomModal("Errore di Revisione", `Impossibile completare la revisione: ${error.message}`);
    }
  };

  const handleCommentChange = (itemId, value) => {
    setReviewComment(prev => ({ ...prev, [itemId]: value }));
  };

  // Calculate stats
  const totalUploads = myUploads.length;
  const pendingReviews = reviewItems.length;
  const approvedCount = myUploads.filter(item => item.status === 'approved').length;
  const approvalRate = totalUploads > 0 ? ((approvedCount / totalUploads) * 100).toFixed(1) : 0;

  // Stats Card Component
  const StatCard = ({ icon, title, value, subtitle }) => (
    <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm text-gray-500 mb-1">{title}</p>
          <p className="text-3xl font-bold text-gray-900">{value}</p>
          <p className="text-xs text-gray-400 mt-1">{subtitle}</p>
        </div>
        <div className="p-2">
          {icon}
        </div>
      </div>
    </div>
  );

  // Feature Card Component
  const FeatureCard = ({ icon, title, description, children, borderColor = "border-l-emerald-500" }) => (
    <div className={`bg-white rounded-2xl p-6 shadow-sm border border-gray-100 border-l-4 ${borderColor}`}>
      <div className="flex items-center gap-3 mb-4">
        {icon}
        <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
      </div>
      {description && (
        <p className="text-sm text-gray-500 mb-4">{description}</p>
      )}
      {children}
    </div>
  );

  if (!isAuthReady) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-lg text-gray-600">Caricamento...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl shadow-xl p-6 w-full max-w-md mx-4">
            <h3 className="text-xl font-bold mb-3 text-gray-900">{modalContent.title}</h3>
            <p className="text-gray-600 mb-6">{modalContent.message}</p>
            <button
              onClick={() => setShowModal(false)}
              className="w-full py-3 bg-emerald-500 text-white font-semibold rounded-xl hover:bg-emerald-600 transition-colors"
            >
              Chiudi
            </button>
          </div>
        </div>
      )}

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Section */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <StatCard
            icon={<UsersIcon />}
            title="File Totali Caricati"
            value={totalUploads}
            subtitle="File caricati dall'utente"
          />
          <StatCard
            icon={<DocumentIcon />}
            title="In Attesa di Revisione"
            value={pendingReviews}
            subtitle="File da processare"
          />
          <StatCard
            icon={<TrendingUpIcon />}
            title="Tasso di Approvazione"
            value={`${approvalRate}%`}
            subtitle="Percentuale file approvati"
          />
        </div>

        {/* Feature Cards Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Upload Card */}
          <FeatureCard
            icon={<DocumentIcon />}
            title="Carica File per Revisione"
            description="Qui puoi caricare i tuoi file per la revisione. Supportiamo PDF, DOCX, immagini e altri formati."
          >
            <div
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              className={`border-2 border-dashed rounded-xl p-8 text-center transition-colors cursor-pointer ${
                isDragging ? 'border-emerald-500 bg-emerald-50' : 'border-gray-200 hover:border-emerald-300'
              }`}
            >
              <input
                id="file-upload-input"
                type="file"
                className="hidden"
                onChange={handleFileUpload}
              />
              <label htmlFor="file-upload-input" className="cursor-pointer">
                <UploadIcon />
                <p className="mt-2 text-sm text-gray-600">
                  Trascina qui le immagini o clicca per selezionare
                </p>
                <p className="text-xs text-gray-400 mt-1">
                  Supportati: JPG, PNG, PDF, DOCX
                </p>
              </label>
            </div>

            {uploadMessage && (
              <p className="text-sm text-emerald-600 mt-3 text-center">
                {uploadMessage}
              </p>
            )}

            <button
              onClick={handleUploadSubmit}
              disabled={uploading || !uploadFile}
              className={`mt-4 w-full py-3 rounded-xl font-semibold text-white transition-colors ${
                uploading || !uploadFile
                  ? 'bg-gray-300 cursor-not-allowed'
                  : 'bg-emerald-500 hover:bg-emerald-600'
              }`}
            >
              {uploading ? 'Caricamento...' : `Processa ${pendingReviews} Ordini in Coda`}
            </button>
          </FeatureCard>

          {/* Review Card */}
          <FeatureCard
            icon={<ChartIcon />}
            title="Vista Revisore"
            description="Elementi in attesa di revisione. Approva o rifiuta i file caricati."
          >
            {reviewItems.length === 0 ? (
              <div className="text-center py-8">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <p className="text-gray-500 text-sm">Nessun elemento in attesa</p>
              </div>
            ) : (
              <div className="space-y-4 max-h-80 overflow-y-auto">
                {reviewItems.slice(0, 3).map((item) => (
                  <div key={item.id} className="p-4 bg-gray-50 rounded-xl">
                    <p className="font-medium text-gray-900 text-sm truncate">{item.fileName}</p>
                    <p className="text-xs text-gray-500 mt-1">{item.createdAt}</p>
                    <textarea
                      value={reviewComment[item.id] || ''}
                      onChange={(e) => handleCommentChange(item.id, e.target.value)}
                      placeholder="Commento (obbligatorio per rifiuto)"
                      rows="2"
                      className="w-full mt-2 p-2 text-sm border border-gray-200 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                    />
                    <div className="flex gap-2 mt-2">
                      <button
                        onClick={() => handleReviewAction(item.id, 'approved')}
                        className="flex-1 py-2 bg-emerald-500 text-white text-sm font-medium rounded-lg hover:bg-emerald-600 transition-colors"
                      >
                        Approva
                      </button>
                      <button
                        onClick={() => handleReviewAction(item.id, 'rejected')}
                        className="flex-1 py-2 bg-red-500 text-white text-sm font-medium rounded-lg hover:bg-red-600 transition-colors"
                      >
                        Rifiuta
                      </button>
                    </div>
                  </div>
                ))}
                {reviewItems.length > 3 && (
                  <p className="text-center text-sm text-gray-500">
                    +{reviewItems.length - 3} altri elementi
                  </p>
                )}
              </div>
            )}
          </FeatureCard>

          {/* My Uploads Card */}
          <FeatureCard
            icon={<TrendingUpIcon />}
            title="I Miei Caricamenti"
            description="Visualizza lo stato dei tuoi file caricati e i feedback ricevuti."
          >
            {myUploads.length === 0 ? (
              <div className="text-center py-8">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                  </svg>
                </div>
                <p className="text-gray-500 text-sm">Nessun caricamento</p>
              </div>
            ) : (
              <div className="space-y-3 max-h-80 overflow-y-auto">
                {myUploads.slice(0, 5).map((item) => {
                  let statusColor = 'bg-gray-100 text-gray-600';
                  let statusText = 'In Attesa';
                  if (item.status === 'approved') {
                    statusColor = 'bg-emerald-100 text-emerald-700';
                    statusText = 'Approvato';
                  }
                  if (item.status === 'rejected') {
                    statusColor = 'bg-red-100 text-red-700';
                    statusText = 'Rifiutato';
                  }
                  return (
                    <div key={item.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 truncate">{item.fileName}</p>
                        <p className="text-xs text-gray-500">{item.createdAt}</p>
                      </div>
                      <span className={`ml-2 px-2 py-1 text-xs font-medium rounded-full ${statusColor}`}>
                        {statusText}
                      </span>
                    </div>
                  );
                })}
                {myUploads.length > 5 && (
                  <p className="text-center text-sm text-gray-500">
                    +{myUploads.length - 5} altri file
                  </p>
                )}
              </div>
            )}

            <button className="mt-4 w-full py-3 bg-white border-2 border-emerald-500 text-emerald-600 font-semibold rounded-xl hover:bg-emerald-50 transition-colors">
              Visualizza Tutti i File
            </button>
          </FeatureCard>
        </div>

        {/* Footer */}
        <div className="mt-8 text-center text-xs text-gray-400">
          ID Utente: {userId || 'N/D'}
        </div>
      </div>
    </div>
  );
};

export default ReviewApp;
