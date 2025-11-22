import { useState, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { toast } from 'react-hot-toast'
import {
  Upload as UploadIcon,
  FileText,
  X,
  CheckCircle,
  AlertCircle,
  Cloud,
  File,
  Image,
  FileSpreadsheet
} from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { collection, addDoc, serverTimestamp } from 'firebase/firestore'

function Upload() {
  const { db, user, isDemo } = useAuth()
  const [file, setFile] = useState(null)
  const [uploading, setUploading] = useState(false)
  const [dragActive, setDragActive] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)

  const handleDrag = useCallback((e) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true)
    } else if (e.type === 'dragleave') {
      setDragActive(false)
    }
  }, [])

  const handleDrop = useCallback((e) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileSelection(e.dataTransfer.files[0])
    }
  }, [])

  const handleFileSelection = (selectedFile) => {
    const maxSize = 10 * 1024 * 1024 // 10MB
    const allowedTypes = [
      'application/pdf',
      'image/png',
      'image/jpeg',
      'image/jpg',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'application/vnd.ms-excel'
    ]

    if (selectedFile.size > maxSize) {
      toast.error('File troppo grande. Massimo 10MB.')
      return
    }

    if (!allowedTypes.includes(selectedFile.type)) {
      toast.error('Tipo file non supportato. Usa PDF, immagini o Excel.')
      return
    }

    setFile(selectedFile)
    toast.success(`File "${selectedFile.name}" selezionato`)
  }

  const handleInputChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      handleFileSelection(e.target.files[0])
    }
  }

  const removeFile = () => {
    setFile(null)
    setUploadProgress(0)
  }

  const fileToBase64 = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.readAsDataURL(file)
      reader.onload = () => resolve(reader.result)
      reader.onerror = (error) => reject(error)
    })
  }

  const handleUpload = async () => {
    if (!file) {
      toast.error('Seleziona un file prima di caricare')
      return
    }

    setUploading(true)
    setUploadProgress(0)

    // Simulate progress
    const progressInterval = setInterval(() => {
      setUploadProgress((prev) => {
        if (prev >= 90) {
          clearInterval(progressInterval)
          return prev
        }
        return prev + 10
      })
    }, 200)

    try {
      if (isDemo) {
        // Demo mode - simulate upload
        await new Promise((resolve) => setTimeout(resolve, 2000))
        setUploadProgress(100)
        toast.success('Documento caricato con successo!')
        setFile(null)
      } else {
        // Real Firebase upload
        const base64Data = await fileToBase64(file)
        const appId = import.meta.env.VITE_APP_ID || 'default'

        const collectionRef = collection(
          db,
          'artifacts',
          appId,
          'public',
          'data',
          'review_items'
        )

        await addDoc(collectionRef, {
          fileName: file.name,
          mimeType: file.type,
          data: base64Data,
          status: 'pending',
          uploaderId: user.uid,
          reviewerId: null,
          reviewComment: null,
          createdAt: serverTimestamp(),
          reviewedAt: null
        })

        setUploadProgress(100)
        toast.success('Documento caricato con successo!')
        setFile(null)
      }
    } catch (error) {
      console.error('Upload error:', error)
      toast.error('Errore durante il caricamento')
    } finally {
      clearInterval(progressInterval)
      setUploading(false)
      setTimeout(() => setUploadProgress(0), 1000)
    }
  }

  const getFileIcon = (mimeType) => {
    if (mimeType?.includes('pdf')) return FileText
    if (mimeType?.includes('image')) return Image
    if (mimeType?.includes('sheet') || mimeType?.includes('excel')) return FileSpreadsheet
    return File
  }

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  return (
    <div className="min-h-screen pt-20 pb-12">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <h1 className="text-3xl font-display font-bold mb-2">
            Carica <span className="gradient-text">Documento</span>
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Carica i tuoi documenti per la revisione
          </p>
        </motion.div>

        {/* Upload Area */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="card"
        >
          <div
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
            className={`relative border-2 border-dashed rounded-xl p-8 text-center transition-all duration-300 ${
              dragActive
                ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20'
                : 'border-gray-300 dark:border-gray-600 hover:border-primary-400'
            }`}
          >
            <input
              type="file"
              onChange={handleInputChange}
              accept=".pdf,.png,.jpg,.jpeg,.xlsx,.xls"
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
            />

            <motion.div
              animate={{ y: dragActive ? -10 : 0 }}
              transition={{ type: 'spring', stiffness: 300 }}
            >
              <div className={`inline-flex items-center justify-center w-16 h-16 rounded-full mb-4 ${
                dragActive
                  ? 'bg-primary-100 dark:bg-primary-900/30'
                  : 'bg-gray-100 dark:bg-gray-700'
              }`}>
                <Cloud className={`w-8 h-8 ${
                  dragActive
                    ? 'text-primary-600 dark:text-primary-400'
                    : 'text-gray-400'
                }`} />
              </div>

              <p className="text-lg font-medium mb-2">
                {dragActive ? 'Rilascia il file qui' : 'Trascina il file qui'}
              </p>
              <p className="text-gray-500 dark:text-gray-400 text-sm mb-4">
                oppure clicca per selezionare
              </p>

              <div className="flex flex-wrap justify-center gap-2 text-xs text-gray-400">
                <span className="px-2 py-1 bg-gray-100 dark:bg-gray-700 rounded">PDF</span>
                <span className="px-2 py-1 bg-gray-100 dark:bg-gray-700 rounded">PNG</span>
                <span className="px-2 py-1 bg-gray-100 dark:bg-gray-700 rounded">JPG</span>
                <span className="px-2 py-1 bg-gray-100 dark:bg-gray-700 rounded">Excel</span>
                <span className="px-2 py-1 bg-gray-100 dark:bg-gray-700 rounded">Max 10MB</span>
              </div>
            </motion.div>
          </div>

          {/* Selected File Preview */}
          <AnimatePresence>
            {file && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="mt-6"
              >
                <div className="p-4 bg-gray-50 dark:bg-gray-700/50 rounded-xl">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="p-2 bg-white dark:bg-gray-800 rounded-lg shadow-sm">
                        {(() => {
                          const Icon = getFileIcon(file.type)
                          return <Icon className="w-6 h-6 text-primary-600" />
                        })()}
                      </div>
                      <div>
                        <p className="font-medium text-sm truncate max-w-xs">{file.name}</p>
                        <p className="text-xs text-gray-500">{formatFileSize(file.size)}</p>
                      </div>
                    </div>
                    <button
                      onClick={removeFile}
                      className="p-1 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-lg transition-colors"
                    >
                      <X className="w-5 h-5 text-gray-400" />
                    </button>
                  </div>

                  {/* Progress Bar */}
                  {uploadProgress > 0 && (
                    <div className="mt-3">
                      <div className="h-2 bg-gray-200 dark:bg-gray-600 rounded-full overflow-hidden">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${uploadProgress}%` }}
                          className="h-full gradient-bg"
                        />
                      </div>
                      <p className="text-xs text-gray-500 mt-1 text-right">{uploadProgress}%</p>
                    </div>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Upload Button */}
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={handleUpload}
            disabled={!file || uploading}
            className={`w-full mt-6 py-4 rounded-xl font-semibold flex items-center justify-center space-x-2 transition-all ${
              !file || uploading
                ? 'bg-gray-200 dark:bg-gray-700 text-gray-400 cursor-not-allowed'
                : 'gradient-bg text-white shadow-lg hover:shadow-xl'
            }`}
          >
            {uploading ? (
              <>
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                  className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full"
                />
                <span>Caricamento in corso...</span>
              </>
            ) : (
              <>
                <UploadIcon className="w-5 h-5" />
                <span>Carica Documento</span>
              </>
            )}
          </motion.button>
        </motion.div>

        {/* Info Cards */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="grid md:grid-cols-2 gap-4 mt-6"
        >
          <div className="card p-4">
            <div className="flex items-start space-x-3">
              <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-lg">
                <CheckCircle className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <h3 className="font-medium mb-1">Upload Sicuro</h3>
                <p className="text-sm text-gray-500">
                  I tuoi file sono protetti con crittografia end-to-end
                </p>
              </div>
            </div>
          </div>

          <div className="card p-4">
            <div className="flex items-start space-x-3">
              <div className="p-2 bg-yellow-100 dark:bg-yellow-900/30 rounded-lg">
                <AlertCircle className="w-5 h-5 text-yellow-600" />
              </div>
              <div>
                <h3 className="font-medium mb-1">Revisione Rapida</h3>
                <p className="text-sm text-gray-500">
                  Tempo medio di revisione: meno di 2 ore
                </p>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  )
}

export default Upload
