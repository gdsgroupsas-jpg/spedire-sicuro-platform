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
  const [activeTab, setActiveTab] = useState('upload');
  const [reviewComment, setReviewComment] = useState({});
  const [showModal, setShowModal] = useState(false);
  const [modalContent, setModalContent] = useState({ title: '', message: '' });

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
      setUploadMessage(`File selezionato: ${file.name}`);
    } else {
      setUploadFile(null);
      setUploadMessage('Nessun file selezionato.');
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
      setUploadMessage('Nessun file selezionato.');
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
      showCustomModal("Revisione Completata", `Elemento ${itemId} è stato **${action === 'approved' ? 'APPROVATO' : 'RIFIUTATO'}**.`);
      setReviewComment(prev => ({ ...prev, [itemId]: '' }));
    } catch (error) {
      console.error(`Error performing review action (${action}):`, error);
      showCustomModal("Errore di Revisione", `Impossibile completare la revisione: ${error.message}`);
    }
  };
  
  const handleCommentChange = (itemId, value) => {
    setReviewComment(prev => ({ ...prev, [itemId]: value }));
  };

  const UploadView = () => (
    <div className="p-6 bg-white rounded-xl shadow-lg w-full max-w-lg mx-auto">
      <h2 className="text-2xl font-bold mb-4 text-gray-800">Carica un File per la Revisione</h2>
      <div className="space-y-4">
        <label className="block text-sm font-medium text-gray-700">
          Seleziona il tuo File
        </label>
        <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md">
          <div className="space-y-1 text-center">
            <svg className="mx-auto h-12 w-12 text-gray-400" stroke="currentColor" fill="none" viewBox="0 0 48 48" aria-hidden="true">
              <path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            <div className="flex text-sm text-gray-600">
              <label htmlFor="file-upload-input" className="relative cursor-pointer bg-white rounded-md font-medium text-indigo-600 hover:text-indigo-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-indigo-500">
                <span>Carica un file</span>
                <input id="file-upload-input" name="file-upload" type="file" className="sr-only" onChange={handleFileUpload} />
              </label>
              <p className="pl-1">o trascinalo qui</p>
            </div>
            <p className="text-xs text-gray-500">{uploadMessage || 'PDF, DOCX, ZIP o immagine (max 1MB)'}</p>
          </div>
        </div>
      </div>
      <button
        onClick={handleUploadSubmit}
        disabled={uploading || !uploadFile}
        className={`mt-6 w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white ${uploading || !uploadFile ? 'bg-indigo-300' : 'bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition duration-150 ease-in-out'}`}
      >
        {uploading ? 'Caricamento in corso...' : 'Invia per la Revisione'}
      </button>
      <div className="mt-4 text-xs text-center text-gray-500">
        **ID Utente:** <span className="font-mono text-gray-700 break-all">{userId || 'Autenticazione in corso...'}</span>
      </div>
    </div>
  );

  const ReviewerView = () => (
    <div className="p-6 bg-white rounded-xl shadow-lg w-full">
      <h2 className="text-2xl font-bold mb-6 text-gray-800">Elementi in Attesa di Revisione ({reviewItems.length})</h2>
      {reviewItems.length === 0 ? (
        <div className="text-center py-10 text-gray-500">
          Nessun elemento in attesa di revisione. Tutto chiaro!
        </div>
      ) : (
        <ul className="space-y-6">
          {reviewItems.map((item) => (
            <li key={item.id} className="p-4 border border-gray-200 rounded-lg shadow-sm bg-gray-50">
              <p className="text-sm font-semibold text-indigo-600">ID Elemento: {item.id}</p>
              <p className="text-lg font-medium text-gray-900 mt-1">{item.fileName}</p>
              <p className="text-sm text-gray-600">Caricato il: {item.createdAt} (Da: {item.uploaderId.substring(0, 8)}...)</p>
              <div className="mt-3">
                <span className="text-sm italic text-gray-500">Contenuto: File Base64 (Tipo: {item.mimeType})</span>
              </div>
              <div className="mt-4 space-y-2">
                <textarea
                  value={reviewComment[item.id] || ''}
                  onChange={(e) => handleCommentChange(item.id, e.target.value)}
                  placeholder="Aggiungi un commento (obbligatorio per Rifiutato)"
                  rows="2"
                  className="w-full p-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
                ></textarea>
                <div className="flex space-x-3">
                  <button
                    onClick={() => handleReviewAction(item.id, 'approved')}
                    className="flex-1 py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 transition duration-150 ease-in-out"
                  >
                    <span className="font-bold">✓</span> Approva
                  </button>
                  <button
                    onClick={() => handleReviewAction(item.id, 'rejected')}
                    className="flex-1 py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-red-600 hover:bg-red-700 transition duration-150 ease-in-out"
                  >
                    <span className="font-bold">✗</span> Rifiuta
                  </button>
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );

  const MyUploadsView = () => (
    <div className="p-6 bg-white rounded-xl shadow-lg w-full">
      <h2 className="text-2xl font-bold mb-6 text-gray-800">I Miei Caricamenti ({myUploads.length})</h2>
      {myUploads.length === 0 ? (
        <div className="text-center py-10 text-gray-500">
          Non hai ancora caricato alcun elemento. Usa la scheda "Carica File" per iniziare.
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">File</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Stato</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Caricato Il</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Data Revisione</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Commento</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {myUploads.map((item) => {
                let statusColor = 'text-gray-500 bg-gray-100';
                if (item.status === 'approved') statusColor = 'text-green-800 bg-green-100';
                if (item.status === 'rejected') statusColor = 'text-red-800 bg-red-100';
                return (
                  <tr key={item.id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{item.fileName}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${statusColor}`}>
                        {item.status.charAt(0).toUpperCase() + item.status.slice(1)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{item.createdAt}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{item.reviewedAt}</td>
                    <td className="px-6 py-4 whitespace-normal text-sm text-gray-700 max-w-xs">{item.reviewComment || 'Nessun commento.'}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
      <div className="mt-6 text-xs text-right text-gray-500">
        **ID Utente:** <span className="font-mono text-gray-700 break-all">{userId || 'N/D'}</span>
      </div>
    </div>
  );

  if (!isAuthReady) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="text-xl text-indigo-600">Caricamento dell'autenticazione...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 p-4 sm:p-8 flex flex-col items-center">
      {showModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-75 flex items-center justify-center z-50 transition-opacity">
          <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-sm">
            <h3 className="text-xl font-bold mb-4 text-gray-900">{modalContent.title}</h3>
            <p className="text-gray-700 mb-6">{modalContent.message}</p>
            <div className="flex justify-end">
              <button
                onClick={() => setShowModal(false)}
                className="py-2 px-4 bg-indigo-600 text-white font-semibold rounded-md hover:bg-indigo-700 transition duration-150"
              >
                Chiudi
              </button>
            </div>
          </div>
        </div>
      )}
      <div className="w-full max-w-4xl mb-6 bg-white rounded-xl shadow-lg p-2">
        <div className="flex border-b border-gray-200">
          {['upload', 'review', 'my-uploads'].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`flex-1 py-3 px-1 text-center font-medium rounded-t-lg transition duration-200 ease-in-out ${
                activeTab === tab
                  ? 'text-indigo-600 border-b-2 border-indigo-600'
                  : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
              }`}
            >
              {tab === 'upload' && 'Carica File'}
              {tab === 'review' && 'Vista Revisore'}
              {tab === 'my-uploads' && 'I Miei Caricamenti'}
            </button>
          ))}
        </div>
      </div>
      <div className="w-full max-w-4xl">
        {activeTab === 'upload' && <UploadView />}
        {activeTab === 'review' && <ReviewerView />}
        {activeTab === 'my-uploads' && <MyUploadsView />}
      </div>
    </div>
  );
};

export default ReviewApp;
