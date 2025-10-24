import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Menu,
  X,
  Home,
  BookOpen,
  FileText,
  Trophy,
  Award,
  Users,
  Settings,
  LogOut,
  Wallet,
  User
} from 'lucide-react'
import { useRouter } from '../../hooks/useRouter'

interface DashboardLayoutProps {
  children: React.ReactNode
}

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [walletConnected, setWalletConnected] = useState(false)
  const [showSignOutModal, setShowSignOutModal] = useState(false)
  const { navigate, currentPath } = useRouter()

  // Get user data from localStorage
  const getUserData = () => {
    try {
      const storedUser = localStorage.getItem('user')
      if (storedUser) {
        const userData = JSON.parse(storedUser)
        console.log('DashboardLayout - Stored user data:', userData)

        // Handle missing fullName by using email or providing a fallback
        return {
          ...userData,
          fullName: userData.fullName || userData.name || userData.email?.split('@')[0] || 'Student',
          role: userData.role || 'Student'
        }
      }
    } catch (error) {
      console.error('Error parsing user data:', error)
    }
    return { fullName: 'Student', role: 'Student' }
  }

  const userData = getUserData()

  const sidebarItems = [
    { icon: <Home className="w-5 h-5" />, label: 'Dashboard', href: '/dashboard' },
    { icon: <BookOpen className="w-5 h-5" />, label: 'My Courses', href: '/dashboard/courses' },
    { icon: <FileText className="w-5 h-5" />, label: 'Assignments', href: '/dashboard/assignments' },
    { icon: <Trophy className="w-5 h-5" />, label: 'Progress', href: '/dashboard/progress' },
    { icon: <Award className="w-5 h-5" />, label: 'Certificates', href: '/dashboard/certificates' },
    { icon: <Users className="w-5 h-5" />, label: 'Leaderboard', href: '/dashboard/leaderboard' },
    { icon: <Settings className="w-5 h-5" />, label: 'Settings', href: '/dashboard/settings' }
  ]

  const handleWalletConnect = () => {
    // TODO: Implement wallet connection logic
    setWalletConnected(!walletConnected)
  }

  const handleSignOut = () => {
    setShowSignOutModal(true)
  }

  const confirmSignOut = () => {
    // Clear all stored data
    localStorage.removeItem('accessToken')
    localStorage.removeItem('refreshToken')
    localStorage.removeItem('user')

    // Close modal and redirect to login page
    setShowSignOutModal(false)
    window.location.href = '/login'
  }

  const cancelSignOut = () => {
    setShowSignOutModal(false)
  }

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Desktop Sidebar - Always visible on lg+ screens */}
      <div className="hidden lg:block fixed left-0 top-0 h-full w-64 bg-gray-900/95 backdrop-blur-md border-r border-gray-800 z-50">
        {/* Sidebar Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-800">
          <div className="flex items-center gap-3">
            <img
              src="/orionorion.png"
              alt="Orion Academy Logo"
              className="w-8 h-8 object-contain"
            />
            <span className="text-lg font-bold bg-gradient-to-r from-[#FDDA00] to-yellow-300 bg-clip-text text-transparent">
              Orion Academy
            </span>
          </div>
        </div>

        {/* Navigation */}
        <nav className="p-4 space-y-2">
          {sidebarItems.map((item, index) => {
            const isActive = currentPath === item.href
            return (
              <motion.button
                key={item.label}
                onClick={() => {
                  navigate(item.href)
                  setSidebarOpen(false)
                }}
                initial={{ x: -20, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ delay: index * 0.1 }}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-300 group ${
                  isActive
                    ? 'text-[#FDDA00] bg-[#FDDA00]/10 border border-[#FDDA00]/30'
                    : 'text-gray-300 hover:text-[#FDDA00] hover:bg-[#FDDA00]/10'
                }`}
              >
                <div className="group-hover:scale-110 transition-transform">
                  {item.icon}
                </div>
                <span className="font-medium">{item.label}</span>
              </motion.button>
            )
          })}
        </nav>

        {/* User Section */}
        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-gray-800">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 bg-[#FDDA00]/20 rounded-full flex items-center justify-center">
              <User className="w-5 h-5 text-[#FDDA00]" />
            </div>
            <div>
              <p className="text-sm font-medium text-white">
                {userData.fullName || 'Student'}
              </p>
              <p className="text-xs text-gray-400">
                {userData.role || 'Student'}
              </p>
            </div>
          </div>

          <button
            onClick={handleSignOut}
            className="w-full flex items-center gap-3 px-4 py-3 text-gray-300 hover:text-red-400 hover:bg-red-400/10 rounded-lg transition-all duration-300"
          >
            <LogOut className="w-5 h-5" />
            <span className="font-medium">Sign Out</span>
          </button>
        </div>
      </div>

      {/* Mobile Sidebar - Toggleable */}
      <AnimatePresence>
        {sidebarOpen && (
          <>
            {/* Mobile Overlay */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 lg:hidden"
              onClick={() => setSidebarOpen(false)}
            />

            {/* Mobile Sidebar */}
            <motion.div
              initial={{ x: -300 }}
              animate={{ x: 0 }}
              exit={{ x: -300 }}
              transition={{ type: "spring", damping: 30, stiffness: 300 }}
              className="fixed left-0 top-0 h-full w-64 bg-gray-900/95 backdrop-blur-md border-r border-gray-800 z-50 lg:hidden"
            >
              {/* Sidebar Header */}
              <div className="flex items-center justify-between p-6 border-b border-gray-800">
                <div className="flex items-center gap-3">
                  <img
                    src="/orionorion.png"
                    alt="Orion Academy Logo"
                    className="w-8 h-8 object-contain"
                  />
                  <span className="text-lg font-bold bg-gradient-to-r from-[#FDDA00] to-yellow-300 bg-clip-text text-transparent">
                    Orion Academy
                  </span>
                </div>
                <button
                  onClick={() => setSidebarOpen(false)}
                  className="text-gray-400 hover:text-white transition-colors"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              {/* Navigation */}
              <nav className="p-4 space-y-2">
                {sidebarItems.map((item, index) => {
                  const isActive = currentPath === item.href
                  return (
                    <motion.button
                      key={item.label}
                      onClick={() => {
                        navigate(item.href)
                        setSidebarOpen(false)
                      }}
                      initial={{ x: -20, opacity: 0 }}
                      animate={{ x: 0, opacity: 1 }}
                      transition={{ delay: index * 0.1 }}
                      className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-300 group ${
                        isActive
                          ? 'text-[#FDDA00] bg-[#FDDA00]/10 border border-[#FDDA00]/30'
                          : 'text-gray-300 hover:text-[#FDDA00] hover:bg-[#FDDA00]/10'
                      }`}
                    >
                      <div className="group-hover:scale-110 transition-transform">
                        {item.icon}
                      </div>
                      <span className="font-medium">{item.label}</span>
                    </motion.button>
                  )
                })}
              </nav>

              {/* User Section */}
              <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-gray-800">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 bg-[#FDDA00]/20 rounded-full flex items-center justify-center">
                    {userData.avatar ? (
                      <img
                        src={userData.avatar}
                        alt="User Avatar"
                        className="w-10 h-10 rounded-full object-cover"
                      />
                    ) : (
                      <User className="w-5 h-5 text-[#FDDA00]" />
                    )}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-white">
                      {userData.fullName || 'Student'}
                    </p>
                    <p className="text-xs text-gray-400">
                      {userData.role || 'Student'}
                    </p>
                  </div>
                </div>

                <button
                  onClick={handleSignOut}
                  className="w-full flex items-center gap-3 px-4 py-3 text-gray-300 hover:text-red-400 hover:bg-red-400/10 rounded-lg transition-all duration-300"
                >
                  <LogOut className="w-5 h-5" />
                  <span className="font-medium">Sign Out</span>
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Main Content */}
      <div className="lg:ml-64">
        {/* Top Navbar */}
        <header className="bg-gray-900/50 backdrop-blur-sm border-b border-gray-800 px-4 py-4 lg:px-6">
          <div className="flex items-center justify-between">
            {/* Mobile Menu Button */}
            <button
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden text-gray-400 hover:text-white transition-colors"
            >
              <Menu className="w-6 h-6" />
            </button>

            {/* Desktop Logo */}
            <div className="hidden lg:flex items-center gap-3">
              <img
                src="/orionorion.png"
                alt="Orion Academy Logo"
                className="w-8 h-8 object-contain"
              />
              <span className="text-lg font-bold bg-gradient-to-r from-[#FDDA00] to-yellow-300 bg-clip-text text-transparent">
                Orion Academy
              </span>
            </div>

            {/* Right Side Actions */}
            <div className="flex items-center gap-4">
              {/* Wallet Connection Button */}
              <motion.button
                onClick={handleWalletConnect}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all duration-300 ${
                  walletConnected
                    ? 'bg-green-500/20 text-green-400 border border-green-500/30'
                    : 'bg-[#FDDA00]/20 text-[#FDDA00] border border-[#FDDA00]/30 hover:bg-[#FDDA00]/30'
                }`}
              >
                <Wallet className="w-4 h-4" />
                {walletConnected ? 'Connected' : 'Connect Wallet'}
              </motion.button>

              {/* User Profile */}
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-[#FDDA00]/20 rounded-full flex items-center justify-center">
                  {userData.avatar ? (
                    <img
                      src={userData.avatar}
                      alt="User Avatar"
                      className="w-8 h-8 rounded-full object-cover"
                    />
                  ) : (
                    <User className="w-4 h-4 text-[#FDDA00]" />
                  )}
                </div>
                <div className="hidden sm:block">
                  <p className="text-sm font-medium text-white">{userData.fullName || 'Student'}</p>
                  <p className="text-xs text-gray-400">{userData.role || 'Student'}</p>
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* Main Content Area */}
        <main className="p-4 lg:p-6">
          {children}
        </main>
      </div>

      {/* Sign Out Confirmation Modal */}
      <AnimatePresence>
        {showSignOutModal && (
          <>
            {/* Modal Overlay */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
              onClick={cancelSignOut}
            >
              {/* Modal Content */}
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                transition={{ type: "spring", damping: 25, stiffness: 300 }}
                className="bg-gray-900 border border-gray-800 rounded-xl p-6 max-w-md w-full"
                onClick={(e) => e.stopPropagation()}
              >
                {/* Modal Header */}
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-2 bg-red-500/20 rounded-lg">
                    <LogOut className="w-5 h-5 text-red-400" />
                  </div>
                  <h3 className="text-xl font-bold text-white">Sign Out</h3>
                </div>

                {/* Modal Body */}
                <p className="text-gray-400 mb-6">
                  Are you sure you want to sign out? You'll need to log in again to access your dashboard.
                </p>

                {/* Modal Actions */}
                <div className="flex gap-3">
                  <button
                    onClick={cancelSignOut}
                    className="flex-1 px-4 py-2 border border-gray-600 text-gray-300 rounded-lg hover:border-gray-500 hover:text-white transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={confirmSignOut}
                    className="flex-1 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
                  >
                    Sign Out
                  </button>
                </div>
              </motion.div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  )
}
