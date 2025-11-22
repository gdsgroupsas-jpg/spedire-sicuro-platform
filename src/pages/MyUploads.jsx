import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import {
  FolderOpen,
  Clock,
  CheckCircle,
  XCircle,
  FileText,
  Calendar,
  MessageSquare,
  Search,
  Filter
} from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { collection, query, where, onSnapshot, orderBy } from 'firebase/firestore'

function MyUploads() {
  const { db, user, isDemo } = useAuth()
  const [uploads, setUploads] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterStatus, setFilterStatus] = useState('all')

  // Demo data
  const demoUploads = [
    {
      id: '1',
      fileName: 'fattura_2024_001.pdf',
      status: 'approved',
      createdAt: new Date(Date.now() - 86400000),
      reviewedAt: new Date(Date.now() - 82800000),
      reviewComment: 'Documento conforme'
    },
    {
      id: '2',
      fileName: 'ddt_spedizione_45.pdf',
      status: 'pending',
      createdAt: new Date(Date.now() - 3600000),
      reviewedAt: null,
      reviewComment: null
    },
    {
      id: '3',
      fileName: 'documento_errato.pdf',
      status: 'rejected',
      createdAt: new Date(Date.now() - 172800000),
      reviewedAt: new Date(Date.now() - 169200000),
      reviewComment: 'Manca la firma del responsabile'
    },
    {
      id: '4',
      fileName: 'packing_list_78.xlsx',
      status: 'approved',
      createdAt: new Date(Date.now() - 259200000),
      reviewedAt: new Date(Date.now() - 255600000),
      reviewComment: null
    },
    {
      id: '5',
      fileName: 'contratto_fornitore.pdf',
      status: 'pending',
      createdAt: new Date(Date.now() - 7200000),
      reviewedAt: null,
      reviewComment: null
    }
  ]

  useEffect(() => {
    if (isDemo) {
      setUploads(demoUploads)
      setLoading(false)
      return
    }

    if (!db || !user) return

    const appId = import.meta.env.VITE_APP_ID || 'default'
    const collectionRef = collection(
      db,
      'artifacts',
      appId,
      'public',
      'data',
      'review_items'
    )

    const q = query(
      collectionRef,
      where('uploaderId', '==', user.uid)
    )

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const fetchedUploads = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate(),
        reviewedAt: doc.data().reviewedAt?.toDate()
      }))

      // Sort by createdAt descending
      fetchedUploads.sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0))

      setUploads(fetchedUploads)
      setLoading(false)
    })

    return () => unsubscribe()
  }, [db, user, isDemo])

  const formatDate = (date) => {
    if (!date) return '-'
    return new Intl.DateTimeFormat('it-IT', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date)
  }

  const getStatusConfig = (status) => {
    switch (status) {
      case 'approved':
        return {
          icon: CheckCircle,
          label: 'Approvato',
          color: 'text-green-600 dark:text-green-400',
          bg: 'bg-green-100 dark:bg-green-900/30'
        }
      case 'rejected':
        return {
          icon: XCircle,
          label: 'Rifiutato',
          color: 'text-red-600 dark:text-red-400',
          bg: 'bg-red-100 dark:bg-red-900/30'
        }
      default:
        return {
          icon: Clock,
          label: 'In Attesa',
          color: 'text-yellow-600 dark:text-yellow-400',
          bg: 'bg-yellow-100 dark:bg-yellow-900/30'
        }
    }
  }

  const filteredUploads = uploads.filter((upload) => {
    const matchesSearch = upload.fileName
      .toLowerCase()
      .includes(searchTerm.toLowerCase())
    const matchesFilter =
      filterStatus === 'all' || upload.status === filterStatus
    return matchesSearch && matchesFilter
  })

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.05 }
    }
  }

  const itemVariants = {
    hidden: { opacity: 0, x: -20 },
    visible: { opacity: 1, x: 0 }
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
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-3xl font-display font-bold mb-2">
            I Miei <span className="gradient-text">Caricamenti</span>
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Totale documenti: {uploads.length}
          </p>
        </motion.div>

        {/* Filters */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col sm:flex-row gap-4 mb-6"
        >
          {/* Search */}
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Cerca documento..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="input-field pl-12"
            />
          </div>

          {/* Status Filter */}
          <div className="relative">
            <Filter className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="input-field pl-12 pr-10 appearance-none cursor-pointer min-w-[160px]"
            >
              <option value="all">Tutti</option>
              <option value="pending">In Attesa</option>
              <option value="approved">Approvati</option>
              <option value="rejected">Rifiutati</option>
            </select>
          </div>
        </motion.div>

        {/* Stats Summary */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="grid grid-cols-3 gap-4 mb-6"
        >
          <div className="card p-4 text-center">
            <div className="text-2xl font-bold text-yellow-600">
              {uploads.filter((u) => u.status === 'pending').length}
            </div>
            <div className="text-sm text-gray-500">In Attesa</div>
          </div>
          <div className="card p-4 text-center">
            <div className="text-2xl font-bold text-green-600">
              {uploads.filter((u) => u.status === 'approved').length}
            </div>
            <div className="text-sm text-gray-500">Approvati</div>
          </div>
          <div className="card p-4 text-center">
            <div className="text-2xl font-bold text-red-600">
              {uploads.filter((u) => u.status === 'rejected').length}
            </div>
            <div className="text-sm text-gray-500">Rifiutati</div>
          </div>
        </motion.div>

        {/* Uploads List */}
        {filteredUploads.length === 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="card text-center py-12"
          >
            <FolderOpen className="w-16 h-16 mx-auto text-gray-300 dark:text-gray-600 mb-4" />
            <h3 className="text-xl font-semibold mb-2">Nessun documento</h3>
            <p className="text-gray-500">
              {searchTerm || filterStatus !== 'all'
                ? 'Nessun risultato trovato'
                : 'Non hai ancora caricato documenti'}
            </p>
          </motion.div>
        ) : (
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="space-y-3"
          >
            {filteredUploads.map((upload) => {
              const statusConfig = getStatusConfig(upload.status)
              const StatusIcon = statusConfig.icon

              return (
                <motion.div
                  key={upload.id}
                  variants={itemVariants}
                  className="card p-4"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className={`p-2 rounded-lg ${statusConfig.bg}`}>
                        <StatusIcon className={`w-5 h-5 ${statusConfig.color}`} />
                      </div>
                      <div>
                        <h3 className="font-medium">{upload.fileName}</h3>
                        <div className="flex items-center space-x-3 text-xs text-gray-500 mt-1">
                          <span className="flex items-center">
                            <Calendar className="w-3 h-3 mr-1" />
                            {formatDate(upload.createdAt)}
                          </span>
                          {upload.reviewedAt && (
                            <span className="flex items-center">
                              <FileText className="w-3 h-3 mr-1" />
                              Rev: {formatDate(upload.reviewedAt)}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="text-right">
                      <span className={`text-sm font-medium ${statusConfig.color}`}>
                        {statusConfig.label}
                      </span>
                    </div>
                  </div>

                  {upload.reviewComment && (
                    <div className="mt-3 pt-3 border-t border-gray-100 dark:border-gray-700">
                      <div className="flex items-start space-x-2 text-sm">
                        <MessageSquare className="w-4 h-4 text-gray-400 mt-0.5" />
                        <p className="text-gray-600 dark:text-gray-300">
                          {upload.reviewComment}
                        </p>
                      </div>
                    </div>
                  )}
                </motion.div>
              )
            })}
          </motion.div>
        )}
      </div>
    </div>
  )
}

export default MyUploads
