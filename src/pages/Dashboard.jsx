import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar
} from 'recharts'
import {
  Upload,
  FileCheck,
  Clock,
  CheckCircle,
  XCircle,
  TrendingUp,
  TrendingDown,
  ArrowRight,
  Activity,
  Users,
  Calendar,
  AlertCircle
} from 'lucide-react'
import { useAuth } from '../context/AuthContext'

function Dashboard() {
  const { user } = useAuth()
  const [stats, setStats] = useState({
    totalUploads: 0,
    pending: 0,
    approved: 0,
    rejected: 0
  })

  // Simulated data for demo
  const areaChartData = [
    { name: 'Lun', uploads: 12, approved: 10, rejected: 2 },
    { name: 'Mar', uploads: 19, approved: 15, rejected: 4 },
    { name: 'Mer', uploads: 15, approved: 13, rejected: 2 },
    { name: 'Gio', uploads: 25, approved: 20, rejected: 5 },
    { name: 'Ven', uploads: 32, approved: 28, rejected: 4 },
    { name: 'Sab', uploads: 18, approved: 16, rejected: 2 },
    { name: 'Dom', uploads: 8, approved: 7, rejected: 1 },
  ]

  const pieChartData = [
    { name: 'Approvati', value: 65, color: '#22c55e' },
    { name: 'In Attesa', value: 25, color: '#f59e0b' },
    { name: 'Rifiutati', value: 10, color: '#ef4444' },
  ]

  const barChartData = [
    { name: 'Set', value: 120 },
    { name: 'Ott', value: 180 },
    { name: 'Nov', value: 240 },
  ]

  const recentActivity = [
    { id: 1, type: 'approved', file: 'fattura_2024_001.pdf', time: '2 min fa', user: 'Marco R.' },
    { id: 2, type: 'uploaded', file: 'ddt_spedizione_45.pdf', time: '15 min fa', user: 'Tu' },
    { id: 3, type: 'rejected', file: 'documento_errato.pdf', time: '1 ora fa', user: 'Laura B.' },
    { id: 4, type: 'approved', file: 'contratto_fornitore.pdf', time: '2 ore fa', user: 'Giuseppe V.' },
    { id: 5, type: 'uploaded', file: 'packing_list_78.pdf', time: '3 ore fa', user: 'Tu' },
  ]

  useEffect(() => {
    // Simulate loading stats
    const timer = setTimeout(() => {
      setStats({
        totalUploads: 156,
        pending: 23,
        approved: 118,
        rejected: 15
      })
    }, 500)

    return () => clearTimeout(timer)
  }, [])

  const statsCards = [
    {
      title: 'Totale Upload',
      value: stats.totalUploads,
      change: '+12%',
      trend: 'up',
      icon: Upload,
      color: 'primary'
    },
    {
      title: 'In Attesa',
      value: stats.pending,
      change: '-5%',
      trend: 'down',
      icon: Clock,
      color: 'yellow'
    },
    {
      title: 'Approvati',
      value: stats.approved,
      change: '+18%',
      trend: 'up',
      icon: CheckCircle,
      color: 'green'
    },
    {
      title: 'Rifiutati',
      value: stats.rejected,
      change: '-8%',
      trend: 'down',
      icon: XCircle,
      color: 'red'
    }
  ]

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

  const getColorClasses = (color) => {
    const colors = {
      primary: 'bg-primary-100 dark:bg-primary-900/30 text-primary-600 dark:text-primary-400',
      yellow: 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-600 dark:text-yellow-400',
      green: 'bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400',
      red: 'bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400'
    }
    return colors[color]
  }

  const getActivityIcon = (type) => {
    switch (type) {
      case 'approved':
        return <CheckCircle className="w-4 h-4 text-green-500" />
      case 'rejected':
        return <XCircle className="w-4 h-4 text-red-500" />
      case 'uploaded':
        return <Upload className="w-4 h-4 text-primary-500" />
      default:
        return <Activity className="w-4 h-4 text-gray-500" />
    }
  }

  return (
    <div className="min-h-screen pt-20 pb-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-3xl font-display font-bold mb-2">
            Benvenuto, <span className="gradient-text">{user?.isDemo ? 'Utente Demo' : 'Utente'}</span>
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Ecco un riepilogo delle tue attività
          </p>
        </motion.div>

        {/* Stats Cards */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8"
        >
          {statsCards.map((stat, index) => (
            <motion.div
              key={index}
              variants={itemVariants}
              whileHover={{ y: -5 }}
              className="card"
            >
              <div className="flex items-center justify-between mb-4">
                <div className={`p-3 rounded-xl ${getColorClasses(stat.color)}`}>
                  <stat.icon className="w-6 h-6" />
                </div>
                <div className={`flex items-center text-sm font-medium ${
                  stat.trend === 'up' ? 'text-green-500' : 'text-red-500'
                }`}>
                  {stat.trend === 'up' ? (
                    <TrendingUp className="w-4 h-4 mr-1" />
                  ) : (
                    <TrendingDown className="w-4 h-4 mr-1" />
                  )}
                  {stat.change}
                </div>
              </div>
              <h3 className="text-3xl font-bold mb-1">{stat.value}</h3>
              <p className="text-gray-500 dark:text-gray-400 text-sm">{stat.title}</p>
            </motion.div>
          ))}
        </motion.div>

        {/* Charts Row */}
        <div className="grid lg:grid-cols-3 gap-6 mb-8">
          {/* Area Chart */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="lg:col-span-2 card"
          >
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-lg font-semibold">Attività Settimanale</h3>
                <p className="text-sm text-gray-500">Upload e approvazioni</p>
              </div>
              <div className="flex items-center space-x-4 text-sm">
                <div className="flex items-center">
                  <div className="w-3 h-3 rounded-full bg-primary-500 mr-2" />
                  Upload
                </div>
                <div className="flex items-center">
                  <div className="w-3 h-3 rounded-full bg-green-500 mr-2" />
                  Approvati
                </div>
              </div>
            </div>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={areaChartData}>
                  <defs>
                    <linearGradient id="colorUploads" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                    </linearGradient>
                    <linearGradient id="colorApproved" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#22c55e" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#22c55e" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis dataKey="name" stroke="#9ca3af" />
                  <YAxis stroke="#9ca3af" />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'var(--toast-bg)',
                      border: 'none',
                      borderRadius: '12px',
                      boxShadow: '0 10px 40px rgba(0,0,0,0.1)'
                    }}
                  />
                  <Area
                    type="monotone"
                    dataKey="uploads"
                    stroke="#3b82f6"
                    fillOpacity={1}
                    fill="url(#colorUploads)"
                  />
                  <Area
                    type="monotone"
                    dataKey="approved"
                    stroke="#22c55e"
                    fillOpacity={1}
                    fill="url(#colorApproved)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </motion.div>

          {/* Pie Chart */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="card"
          >
            <h3 className="text-lg font-semibold mb-6">Distribuzione Stato</h3>
            <div className="h-48">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={pieChartData}
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={70}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {pieChartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="space-y-2 mt-4">
              {pieChartData.map((item, index) => (
                <div key={index} className="flex items-center justify-between text-sm">
                  <div className="flex items-center">
                    <div
                      className="w-3 h-3 rounded-full mr-2"
                      style={{ backgroundColor: item.color }}
                    />
                    {item.name}
                  </div>
                  <span className="font-medium">{item.value}%</span>
                </div>
              ))}
            </div>
          </motion.div>
        </div>

        {/* Bottom Row */}
        <div className="grid lg:grid-cols-3 gap-6">
          {/* Recent Activity */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="lg:col-span-2 card"
          >
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold">Attività Recente</h3>
              <Link to="/my-uploads" className="text-primary-600 hover:text-primary-700 text-sm font-medium flex items-center">
                Vedi tutto
                <ArrowRight className="w-4 h-4 ml-1" />
              </Link>
            </div>
            <div className="space-y-4">
              {recentActivity.map((activity) => (
                <motion.div
                  key={activity.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="flex items-center justify-between p-3 rounded-xl bg-gray-50 dark:bg-gray-700/50"
                >
                  <div className="flex items-center space-x-3">
                    <div className="p-2 bg-white dark:bg-gray-800 rounded-lg shadow-sm">
                      {getActivityIcon(activity.type)}
                    </div>
                    <div>
                      <p className="font-medium text-sm">{activity.file}</p>
                      <p className="text-xs text-gray-500">{activity.user}</p>
                    </div>
                  </div>
                  <span className="text-xs text-gray-500">{activity.time}</span>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* Quick Actions & Monthly Stats */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="space-y-6"
          >
            {/* Quick Actions */}
            <div className="card">
              <h3 className="text-lg font-semibold mb-4">Azioni Rapide</h3>
              <div className="space-y-3">
                <Link
                  to="/upload"
                  className="flex items-center justify-between p-3 rounded-xl bg-primary-50 dark:bg-primary-900/20 text-primary-600 dark:text-primary-400 hover:bg-primary-100 dark:hover:bg-primary-900/30 transition-colors"
                >
                  <div className="flex items-center space-x-3">
                    <Upload className="w-5 h-5" />
                    <span className="font-medium">Carica Documento</span>
                  </div>
                  <ArrowRight className="w-4 h-4" />
                </Link>
                <Link
                  to="/review"
                  className="flex items-center justify-between p-3 rounded-xl bg-secondary-50 dark:bg-secondary-900/20 text-secondary-600 dark:text-secondary-400 hover:bg-secondary-100 dark:hover:bg-secondary-900/30 transition-colors"
                >
                  <div className="flex items-center space-x-3">
                    <FileCheck className="w-5 h-5" />
                    <span className="font-medium">Revisiona</span>
                  </div>
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </div>

            {/* Monthly Growth */}
            <div className="card">
              <h3 className="text-lg font-semibold mb-4">Crescita Mensile</h3>
              <div className="h-32">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={barChartData}>
                    <Bar dataKey="value" fill="#3b82f6" radius={[8, 8, 0, 0]} />
                    <XAxis dataKey="name" stroke="#9ca3af" fontSize={12} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: 'var(--toast-bg)',
                        border: 'none',
                        borderRadius: '8px'
                      }}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  )
}

export default Dashboard
