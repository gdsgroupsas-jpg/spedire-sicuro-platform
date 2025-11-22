import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { toast } from 'react-hot-toast'
import {
  FileCheck,
  CheckCircle,
  XCircle,
  Clock,
  FileText,
  User,
  Calendar,
  MessageSquare,
  Search,
  Filter,
  ChevronDown
} from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import {
  collection,
  query,
  where,
  onSnapshot,
  doc,
  updateDoc,
  serverTimestamp
} from 'firebase/firestore'

function Review() {
  const { db, user, isDemo } = useAuth()
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [comments, setComments] = useState({})
  const [searchTerm, setSearchTerm] = useState('')
  const [expandedItem, setExpandedItem] = useState(null)

  // Demo data
  const demoItems = [
    {
      id: '1',
      fileName: 'fattura_2024_001.pdf',
      mimeType: 'application/pdf',
      uploaderId: 'user_123',
      createdAt: new Date(Date.now() - 3600000),
      status: 'pending'
    },
    {
      id: '2',
      fileName: 'ddt_spedizione_45.pdf',
      mimeType: 'application/pdf',
      uploaderId: 'user_456',
      createdAt: new Date(Date.now() - 7200000),
      status: 'pending'
    },
    {
      id: '3',
      fileName: 'packing_list_78.xlsx',
      mimeType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      uploaderId: 'user_789',
      createdAt: new Date(Date.now() - 10800000),
      status: 'pending'
    },
    {
      id: '4',
      fileName: 'contratto_fornitore.pdf',
      mimeType: 'application/pdf',
      uploaderId: 'user_101',
      createdAt: new Date(Date.now() - 14400000),
      status: 'pending'
    }
  ]

  useEffect(() => {
    if (isDemo) {
      setItems(demoItems)
      setLoading(false)
      return
    }

    if (!db) return

    const appId = import.meta.env.VITE_APP_ID || 'default'
    const collectionRef = collection(
      db,
      'artifacts',
      appId,
      'public',
      'data',
      'review_items'
    )

    const q = query(collectionRef, where('status', '==', 'pending'))

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const fetchedItems = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate()
      }))
      setItems(fetchedItems)
      setLoading(false)
    })

    return () => unsubscribe()
  }, [db, isDemo])

  const handleReview = async (itemId, action) => {
    if (action === 'rejected' && !comments[itemId]?.trim()) {
      toast.error('Inserisci un commento per il rifiuto')
      return
    }

    if (isDemo) {
      // Demo mode
      setItems((prev) => prev.filter((item) => item.id !== itemId))
      toast.success(
        action === 'approved'
          ? 'Documento approvato!'
          : 'Documento rifiutato'
      )
      return
    }

    try {
      const appId = import.meta.env.VITE_APP_ID || 'default'
      const docRef = doc(
        db,
        'artifacts',
        appId,
        'public',
        'data',
        'review_items',
        itemId
      )

      await updateDoc(docRef, {
        status: action,
        reviewerId: user.uid,
        reviewComment: comments[itemId] || null,
        reviewedAt: serverTimestamp()
      })

      toast.success(
        action === 'approved'
          ? 'Documento approvato!'
          : 'Documento rifiutato'
      )

      setComments((prev) => {
        const newComments = { ...prev }
        delete newComments[itemId]
        return newComments
      })
    } catch (error) {
      console.error('Review error:', error)
      toast.error('Errore durante la revisione')
    }
  }

  const formatDate = (date) => {
    if (!date) return 'N/A'
    return new Intl.DateTimeFormat('it-IT', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date)
  }

  const filteredItems = items.filter((item) =>
    item.fileName.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.1 }
    }
  }

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 }
  }

  if (loading) {
    return (
      <div className="min-h-screen pt-20 flex items-center justify-center">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
          className="w-8 h-8 border-3 border-primary-200 border-t-primary-600 rounded-full"
        />
      </div>
    )
  }

  return (
    <div className="min-h-screen pt-20 pb-12">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-3xl font-display font-bold mb-2">
            Centro <span className="gradient-text">Revisioni</span>
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Documenti in attesa di revisione: {items.length}
          </p>
        </motion.div>

        {/* Search Bar */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6"
        >
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Cerca documento..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="input-field pl-12"
            />
          </div>
        </motion.div>

        {/* Items List */}
        {filteredItems.length === 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="card text-center py-12"
          >
            <FileCheck className="w-16 h-16 mx-auto text-gray-300 dark:text-gray-600 mb-4" />
            <h3 className="text-xl font-semibold mb-2">Nessun documento in attesa</h3>
            <p className="text-gray-500">
              {searchTerm
                ? 'Nessun risultato trovato'
                : 'Tutti i documenti sono stati revisionati'}
            </p>
          </motion.div>
        ) : (
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="space-y-4"
          >
            {filteredItems.map((item) => (
              <motion.div
                key={item.id}
                variants={itemVariants}
                layout
                className="card overflow-hidden"
              >
                {/* Item Header */}
                <div
                  onClick={() => setExpandedItem(expandedItem === item.id ? null : item.id)}
                  className="flex items-center justify-between cursor-pointer"
                >
                  <div className="flex items-center space-x-4">
                    <div className="p-3 bg-yellow-100 dark:bg-yellow-900/30 rounded-xl">
                      <Clock className="w-6 h-6 text-yellow-600" />
                    </div>
                    <div>
                      <h3 className="font-semibold">{item.fileName}</h3>
                      <div className="flex items-center space-x-4 text-sm text-gray-500 mt-1">
                        <span className="flex items-center">
                          <User className="w-3 h-3 mr-1" />
                          {item.uploaderId?.slice(0, 8)}...
                        </span>
                        <span className="flex items-center">
                          <Calendar className="w-3 h-3 mr-1" />
                          {formatDate(item.createdAt)}
                        </span>
                      </div>
                    </div>
                  </div>
                  <motion.div
                    animate={{ rotate: expandedItem === item.id ? 180 : 0 }}
                    transition={{ duration: 0.2 }}
                  >
                    <ChevronDown className="w-5 h-5 text-gray-400" />
                  </motion.div>
                </div>

                {/* Expanded Content */}
                <AnimatePresence>
                  {expandedItem === item.id && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      className="mt-4 pt-4 border-t border-gray-100 dark:border-gray-700"
                    >
                      {/* Comment Input */}
                      <div className="mb-4">
                        <label className="block text-sm font-medium mb-2">
                          <MessageSquare className="w-4 h-4 inline mr-2" />
                          Commento (obbligatorio per rifiuto)
                        </label>
                        <textarea
                          value={comments[item.id] || ''}
                          onChange={(e) =>
                            setComments((prev) => ({
                              ...prev,
                              [item.id]: e.target.value
                            }))
                          }
                          placeholder="Aggiungi un commento..."
                          rows={3}
                          className="input-field resize-none"
                        />
                      </div>

                      {/* Action Buttons */}
                      <div className="flex space-x-3">
                        <motion.button
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                          onClick={() => handleReview(item.id, 'approved')}
                          className="flex-1 btn-success flex items-center justify-center"
                        >
                          <CheckCircle className="w-4 h-4 mr-2" />
                          Approva
                        </motion.button>
                        <motion.button
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                          onClick={() => handleReview(item.id, 'rejected')}
                          className="flex-1 btn-danger flex items-center justify-center"
                        >
                          <XCircle className="w-4 h-4 mr-2" />
                          Rifiuta
                        </motion.button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            ))}
          </motion.div>
        )}
      </div>
    </div>
  )
}

export default Review
