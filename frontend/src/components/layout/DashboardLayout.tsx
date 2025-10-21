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

interface DashboardLayoutProps {
  children: React.ReactNode
}

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [walletConnected, setWalletConnected] = useState(false)

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

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Sidebar */}
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

            {/* Sidebar */}
            <motion.div
              initial={{ x: -300 }}
              animate={{ x: 0 }}
              exit={{ x: -300 }}
              transition={{ type: "spring", damping: 30, stiffness: 300 }}
              className="fixed left-0 top-0 h-full w-64 bg-gray-900/95 backdrop-blur-md border-r border-gray-800 z-50"
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
                  className="lg:hidden text-gray-400 hover:text-white transition-colors"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              {/* Navigation */}
              <nav className="p-4 space-y-2">
                {sidebarItems.map((item, index) => (
                  <motion.a
                    key={item.label}
                    href={item.href}
                    initial={{ x: -20, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    transition={{ delay: index * 0.1 }}
                    className="flex items-center gap-3 px-4 py-3 text-gray-300 hover:text-[#FDDA00] hover:bg-[#FDDA00]/10 rounded-lg transition-all duration-300 group"
                  >
                    <div className="group-hover:scale-110 transition-transform">
                      {item.icon}
                    </div>
                    <span className="font-medium">{item.label}</span>
                  </motion.a>
                ))}
              </nav>

              {/* User Section */}
              <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-gray-800">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 bg-[#FDDA00]/20 rounded-full flex items-center justify-center">
                    <User className="w-5 h-5 text-[#FDDA00]" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-white">John Doe</p>
                    <p className="text-xs text-gray-400">Student</p>
                  </div>
                </div>

                <button className="w-full flex items-center gap-3 px-4 py-3 text-gray-300 hover:text-red-400 hover:bg-red-400/10 rounded-lg transition-all duration-300">
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
                  <User className="w-4 h-4 text-[#FDDA00]" />
                </div>
                <div className="hidden sm:block">
                  <p className="text-sm font-medium text-white">John Doe</p>
                  <p className="text-xs text-gray-400">Student</p>
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
    </div>
  )
}
