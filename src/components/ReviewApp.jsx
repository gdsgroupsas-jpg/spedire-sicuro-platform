import React, { useState, useEffect, useCallback, useRef } from 'react';
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

// Funzione per simulare estrazione dati OCR
const simulateOCRData = (fileName) => {
  return {
    mittente: {
      nome: 'Mario Rossi',
      indirizzo: 'Via Roma 123',
      citta: 'Milano',
      cap: '20100',
      telefono: '+39 02 1234567'
    },
    destinatario: {
      nome: 'Luigi Bianchi',
      indirizzo: 'Via Napoli 456',
      citta: 'Roma',
      cap: '00100',
      telefono: '+39 06 7654321'
    },
    spedizione: {
      peso: '2.5 kg',
      dimensioni: '30x20x15 cm',
      tipo: 'Standard',
      assicurazione: 'Sì',
      valore: '€ 150.00'
    },
    note: `Documento estratto da: ${fileName}`
  };
};

const fileToBase64 = (file) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result);
    reader.onerror = (error) => reject(error);
  });
};

// Componente Loader Animato
const LoadingSpinner = () => (
  <div className="flex items-center justify-center space-x-2">
    <div className="w-4 h-4 bg-indigo-600 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
    <div className="w-4 h-4 bg-indigo-600 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
    <div className="w-4 h-4 bg-indigo-600 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
  </div>
);

// Componente Modal di Revisione
const ReviewModal = ({ item, onClose, onReview, isProcessing }) => {
  const [nota, setNota] = useState('');
  const ocrData = simulateOCRData(item.fileName);

  const handleAction = (action) => {
    if (action === 'rejected' && nota.trim() === '') {
      alert('Devi fornire una nota per rifiutare l\'ordine.');
      return;
    }
    onReview(item.id, action, nota);
  };

  // Determina se il file è un'immagine
  const isImage = item.mimeType && item.mimeType.startsWith('image/');

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-75 flex items-center justify-center z-50 p-4 overflow-y-auto">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-5xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex justify-between items-center">
          <h2 className="text-2xl font-bold text-gray-900">Revisione Documento</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Contenuto principale - Layout affiancato */}
        <div className="p-6 grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Colonna sinistra - Documento */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-800">Documento Caricato</h3>
            <div className="border border-gray-200 rounded-lg p-4 bg-gray-50">
              <p className="text-sm text-gray-600 mb-2">
                <strong>File:</strong> {item.fileName}
              </p>
              <p className="text-sm text-gray-600 mb-4">
                <strong>Tipo:</strong> {item.mimeType}
              </p>

              {/* Anteprima documento */}
              <div className="border border-gray-300 rounded-lg overflow-hidden bg-white">
                {isImage && item.data ? (
                  <img
                    src={item.data}
                    alt={item.fileName}
                    className="w-full h-auto max-h-80 object-contain"
                  />
                ) : (
                  <div className="flex flex-col items-center justify-center p-8 text-gray-400">
                    <svg className="w-16 h-16 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    <span className="text-sm">Anteprima non disponibile</span>
                    <span className="text-xs mt-1">{item.mimeType}</span>
                  </div>
                )}
              </div>

              <p className="text-xs text-gray-500 mt-2">
                Caricato il: {item.createdAt}
              </p>
            </div>
          </div>

          {/* Colonna destra - Dati OCR */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-800">Dati Estratti (OCR Simulato)</h3>

            {/* Mittente */}
            <div className="border border-gray-200 rounded-lg p-4 bg-blue-50">
              <h4 className="font-semibold text-blue-800 mb-2 flex items-center">
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
                Mittente
              </h4>
              <div className="text-sm space-y-1">
                <p><strong>Nome:</strong> {ocrData.mittente.nome}</p>
                <p><strong>Indirizzo:</strong> {ocrData.mittente.indirizzo}</p>
                <p><strong>Città:</strong> {ocrData.mittente.citta} ({ocrData.mittente.cap})</p>
                <p><strong>Tel:</strong> {ocrData.mittente.telefono}</p>
              </div>
            </div>

            {/* Destinatario */}
            <div className="border border-gray-200 rounded-lg p-4 bg-green-50">
              <h4 className="font-semibold text-green-800 mb-2 flex items-center">
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                Destinatario
              </h4>
              <div className="text-sm space-y-1">
                <p><strong>Nome:</strong> {ocrData.destinatario.nome}</p>
                <p><strong>Indirizzo:</strong> {ocrData.destinatario.indirizzo}</p>
                <p><strong>Città:</strong> {ocrData.destinatario.citta} ({ocrData.destinatario.cap})</p>
                <p><strong>Tel:</strong> {ocrData.destinatario.telefono}</p>
              </div>
            </div>

            {/* Dettagli Spedizione */}
            <div className="border border-gray-200 rounded-lg p-4 bg-yellow-50">
              <h4 className="font-semibold text-yellow-800 mb-2 flex items-center">
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                </svg>
                Dettagli Spedizione
              </h4>
              <div className="text-sm grid grid-cols-2 gap-2">
                <p><strong>Peso:</strong> {ocrData.spedizione.peso}</p>
                <p><strong>Dimensioni:</strong> {ocrData.spedizione.dimensioni}</p>
                <p><strong>Tipo:</strong> {ocrData.spedizione.tipo}</p>
                <p><strong>Assicurazione:</strong> {ocrData.spedizione.assicurazione}</p>
                <p className="col-span-2"><strong>Valore dichiarato:</strong> {ocrData.spedizione.valore}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Form di Azione */}
        <div className="border-t border-gray-200 p-6 bg-gray-50">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Azione di Revisione</h3>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Nota del Revisore <span className="text-gray-400">(obbligatoria per rifiuto)</span>
              </label>
              <textarea
                value={nota}
                onChange={(e) => setNota(e.target.value)}
                placeholder="Inserisci una nota per questo ordine..."
                rows="3"
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
              />
            </div>

            <div className="flex flex-col sm:flex-row gap-3">
              <button
                onClick={() => handleAction('approved')}
                disabled={isProcessing}
                className={`flex-1 py-3 px-6 rounded-lg font-semibold text-white transition-all duration-200 flex items-center justify-center ${
                  isProcessing
                    ? 'bg-gray-400 cursor-not-allowed'
                    : 'bg-green-600 hover:bg-green-700 hover:shadow-lg'
                }`}
              >
                {isProcessing ? (
                  <LoadingSpinner />
                ) : (
                  <>
                    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                    </svg>
                    Approva Ordine
                  </>
                )}
              </button>

              <button
                onClick={() => handleAction('rejected')}
                disabled={isProcessing}
                className={`flex-1 py-3 px-6 rounded-lg font-semibold text-white transition-all duration-200 flex items-center justify-center ${
                  isProcessing
                    ? 'bg-gray-400 cursor-not-allowed'
                    : 'bg-red-600 hover:bg-red-700 hover:shadow-lg'
                }`}
              >
                {isProcessing ? (
                  <LoadingSpinner />
                ) : (
                  <>
                    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                    Rifiuta Ordine
                  </>
                )}
              </button>

              <button
                onClick={onClose}
                disabled={isProcessing}
                className="flex-1 py-3 px-6 bg-gray-200 hover:bg-gray-300 rounded-lg font-semibold text-gray-700 transition-all duration-200"
              >
                Annulla
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
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
  const [showModal, setShowModal] = useState(false);
  const [modalContent, setModalContent] = useState({ title: '', message: '' });

  // Stato per il modal di revisione
  const [selectedItem, setSelectedItem] = useState(null);
  const [isProcessingReview, setIsProcessingReview] = useState(false);

  // Ref per l'input file
  const fileInputRef = useRef(null);

  const showCustomModal = (title, message) => {
    setModalContent({ title, message });
    setShowModal(true);
  };

  const getCollectionRef = useCallback((collectionName) => {
    if (!db || !userId) return null;
    return collection(db, 'artifacts', appId, 'public', 'data', collectionName);
  }, [db, userId]);

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
    if (!isAuthReady || !db || !userId) return;
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
  }, [isAuthReady, db, userId, getCollectionRef]);

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
  }, [isAuthReady, db, userId, getCollectionRef]);

  const handleFileUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      // Validazione dimensione (1MB max)
      if (file.size > 1024 * 1024) {
        showCustomModal("File Troppo Grande", "Il file selezionato supera il limite di 1MB.");
        if (fileInputRef.current) fileInputRef.current.value = '';
        return;
      }
      setUploadFile(file);
      setUploadMessage(`File selezionato: ${file.name} (${(file.size / 1024).toFixed(1)} KB)`);
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
      if (fileInputRef.current) fileInputRef.current.value = '';
    } catch (error) {
      console.error("Upload failed:", error);
      showCustomModal("Errore di Caricamento", `Caricamento non riuscito: ${error.message}`);
    } finally {
      setUploading(false);
    }
  };

  // Funzione per gestire l'azione di revisione dal modal
  const handleReviewAction = async (itemId, action, nota) => {
    if (!db || !userId) {
      showCustomModal("Errore", "Utente non autenticato.");
      return;
    }

    setIsProcessingReview(true);

    try {
      const itemDocRef = doc(getCollectionRef('review_items'), itemId);
      await updateDoc(itemDocRef, {
        status: action,
        reviewerId: userId,
        reviewComment: nota || null,
        reviewedAt: serverTimestamp(),
      });

      setSelectedItem(null);
      showCustomModal(
        "Revisione Completata",
        `L'ordine è stato ${action === 'approved' ? 'APPROVATO' : 'RIFIUTATO'} con successo.`
      );
    } catch (error) {
      console.error(`Error performing review action (${action}):`, error);
      showCustomModal("Errore di Revisione", `Impossibile completare la revisione: ${error.message}`);
    } finally {
      setIsProcessingReview(false);
    }
  };

  // Apri modal di revisione
  const openReviewModal = (item) => {
    setSelectedItem(item);
  };

  const UploadView = () => (
    <div className="p-6 bg-white rounded-xl shadow-lg w-full max-w-lg mx-auto">
      <h2 className="text-2xl font-bold mb-4 text-gray-800">Carica un File per la Revisione</h2>
      <div className="space-y-4">
        <label className="block text-sm font-medium text-gray-700">
          Seleziona il tuo File
        </label>
        <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md hover:border-indigo-400 transition-colors">
          <div className="space-y-1 text-center">
            <svg className="mx-auto h-12 w-12 text-gray-400" stroke="currentColor" fill="none" viewBox="0 0 48 48" aria-hidden="true">
              <path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            <div className="flex text-sm text-gray-600">
              <label htmlFor="file-upload-input" className="relative cursor-pointer bg-white rounded-md font-medium text-indigo-600 hover:text-indigo-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-indigo-500">
                <span>Carica un file</span>
                <input
                  ref={fileInputRef}
                  id="file-upload-input"
                  name="file-upload"
                  type="file"
                  className="sr-only"
                  onChange={handleFileUpload}
                  accept="image/*,.pdf,.docx,.zip"
                />
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
        <strong>ID Utente:</strong> <span className="font-mono text-gray-700 break-all">
          {userId || <LoadingSpinner />}
        </span>
      </div>
    </div>
  );

  const ReviewerView = () => (
    <div className="p-6 bg-white rounded-xl shadow-lg w-full">
      <h2 className="text-2xl font-bold mb-6 text-gray-800">
        Elementi in Attesa di Revisione ({reviewItems.length})
      </h2>
      {reviewItems.length === 0 ? (
        <div className="text-center py-10 text-gray-500">
          <svg className="mx-auto h-12 w-12 text-gray-300 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          Nessun elemento in attesa di revisione. Tutto chiaro!
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">File</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tipo</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Caricato</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Caricato Da</th>
                <th scope="col" className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Azione</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {reviewItems.map((item) => (
                <tr key={item.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <svg className="w-5 h-5 text-gray-400 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                      <span className="text-sm font-medium text-gray-900">{item.fileName}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {item.mimeType}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {item.createdAt}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    <span className="font-mono">{item.uploaderId.substring(0, 8)}...</span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-center">
                    <button
                      onClick={() => openReviewModal(item)}
                      className="inline-flex items-center px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium rounded-lg transition-colors shadow-sm hover:shadow"
                    >
                      <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                      </svg>
                      Revisiona
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );

  const MyUploadsView = () => (
    <div className="p-6 bg-white rounded-xl shadow-lg w-full">
      <h2 className="text-2xl font-bold mb-6 text-gray-800">I Miei Caricamenti ({myUploads.length})</h2>
      {myUploads.length === 0 ? (
        <div className="text-center py-10 text-gray-500">
          <svg className="mx-auto h-12 w-12 text-gray-300 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
          </svg>
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
                let statusColor = 'text-yellow-800 bg-yellow-100';
                let statusText = 'In Revisione';
                if (item.status === 'approved') {
                  statusColor = 'text-green-800 bg-green-100';
                  statusText = 'Approvato';
                }
                if (item.status === 'rejected') {
                  statusColor = 'text-red-800 bg-red-100';
                  statusText = 'Rifiutato';
                }
                return (
                  <tr key={item.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{item.fileName}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${statusColor}`}>
                        {statusText}
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
        <strong>ID Utente:</strong> <span className="font-mono text-gray-700 break-all">{userId || 'N/D'}</span>
      </div>
    </div>
  );

  if (!isAuthReady) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100">
        <LoadingSpinner />
        <p className="mt-4 text-lg text-indigo-600">Autenticazione in corso...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 p-4 sm:p-8 flex flex-col items-center">
      {/* Modal di messaggio */}
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

      {/* Modal di revisione */}
      {selectedItem && (
        <ReviewModal
          item={selectedItem}
          onClose={() => setSelectedItem(null)}
          onReview={handleReviewAction}
          isProcessing={isProcessingReview}
        />
      )}

      {/* Header */}
      <div className="w-full max-w-4xl mb-6">
        <h1 className="text-3xl font-bold text-gray-900 text-center mb-2">Spedire Sicuro</h1>
        <p className="text-gray-600 text-center">Piattaforma di Revisione Documenti</p>
      </div>

      {/* Tabs */}
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
              {tab === 'review' && `Vista Revisore ${reviewItems.length > 0 ? `(${reviewItems.length})` : ''}`}
              {tab === 'my-uploads' && 'I Miei Caricamenti'}
            </button>
          ))}
        </div>
      </div>

      {/* Contenuto */}
      <div className="w-full max-w-4xl">
        {activeTab === 'upload' && <UploadView />}
        {activeTab === 'review' && <ReviewerView />}
        {activeTab === 'my-uploads' && <MyUploadsView />}
      </div>

      {/* Footer Info */}
      <div className="w-full max-w-4xl mt-8 text-center text-xs text-gray-400">
        <p>App ID: {appId}</p>
      </div>
    </div>
  );
};

export default ReviewApp;
