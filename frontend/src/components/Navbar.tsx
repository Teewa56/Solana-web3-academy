import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Menu, X } from 'lucide-react'
import { useNavigation } from '../contexts/NavigationContext'

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const { navigate } = useNavigation()

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50)
    }
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const navItems = [
    { name: 'Home', href: '#home' },
    { name: 'Features', href: '#features' },
    { name: 'About', href: '#about' },
    { name: 'Contact', href: '#contact' }
  ]

  const scrollToSection = (href: string) => {
    const element = document.querySelector(href)
    if (element) {
      element.scrollIntoView({
        behavior: 'smooth',
        block: 'start'
      })
    }
    setIsOpen(false) // Close mobile menu after navigation
  }

  const handleLogin = () => {
    navigate('/login')
  }

  return (
    <motion.nav
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.8, ease: [0.25, 0.46, 0.45, 0.94] }}
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled
          ? 'bg-black/90 backdrop-blur-md border-b border-[#FDDA00]/20'
          : 'bg-transparent'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <motion.div
            whileHover={{ scale: 1.05 }}
            className="flex items-center space-x-3"
          >
            <img
              src="/orionorion.png"
              alt="Orion Logo"
              className="w-10 h-10 object-contain"
            />
            <span className="text-xl font-bold bg-gradient-to-r from-[#FDDA00] to-yellow-300 bg-clip-text text-transparent heading-font">
              Orion
            </span>
          </motion.div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center">
            <div className="flex items-center gap-1 px-2 py-1.5 rounded-full bg-white/[0.03] backdrop-blur-sm border border-white/10 shadow-[0_6px_18px_rgba(0,0,0,0.45)]">
              {navItems.map((item, index) => (
                <motion.button
                  key={item.name}
                  onClick={() => scrollToSection(item.href)}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="px-4 py-1.5 text-gray-300 hover:text-[#FDDA00] transition-colors duration-300 font-medium rounded-full hover:bg-white/[0.05]"
                  style={{ animationDelay: `${index * 0.1}s` }}
                >
                  {item.name}
                </motion.button>
              ))}
            </div>
          </div>

          {/* Desktop CTA Buttons */}
          <div className="hidden md:flex items-center space-x-4">
            <motion.button
              onClick={handleLogin}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="px-5 py-2 glow-btn"
            >
              Login
            </motion.button>
            <motion.button
              onClick={() => navigate('/register')}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="px-6 py-2 glow-btn"
            >
              Get Started
            </motion.button>
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <motion.button
              whileTap={{ scale: 0.95 }}
              onClick={() => setIsOpen(!isOpen)}
              className="text-[#FDDA00] hover:text-yellow-300 transition-colors"
            >
              {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </motion.button>
          </div>
        </div>

        {/* Mobile Navigation */}
        <motion.div
          initial={false}
          animate={{
            height: isOpen ? 'auto' : 0,
            opacity: isOpen ? 1 : 0
          }}
          transition={{ duration: 0.3 }}
          className="md:hidden overflow-hidden"
        >
          <div className="px-2 pt-2 pb-3 space-y-1 bg-black/95 backdrop-blur-md rounded-lg mt-2 border border-[#FDDA00]/20">
            {navItems.map((item, index) => (
              <motion.button
                key={item.name}
                onClick={() => scrollToSection(item.href)}
                initial={{ x: -20, opacity: 0 }}
                animate={{
                  x: isOpen ? 0 : -20,
                  opacity: isOpen ? 1 : 0
                }}
                transition={{ delay: index * 0.1 }}
                className="block w-full text-left px-3 py-2 text-gray-300 hover:text-[#FDDA00] hover:bg-[#FDDA00]/10 rounded-lg transition-all duration-300"
              >
                {item.name}
              </motion.button>
            ))}
            <div className="pt-4 border-t border-[#FDDA00]/20">
              <motion.button
                initial={{ x: -20, opacity: 0 }}
                animate={{
                  x: isOpen ? 0 : -20,
                  opacity: isOpen ? 1 : 0
                }}
                transition={{ delay: 0.5 }}
                onClick={() => {
                  handleLogin()
                  setIsOpen(false)
                }}
                className="w-full px-3 py-2 glow-btn"
              >
                Login
              </motion.button>
              <motion.button
                initial={{ x: -20, opacity: 0 }}
                animate={{
                  x: isOpen ? 0 : -20,
                  opacity: isOpen ? 1 : 0
                }}
                transition={{ delay: 0.6 }}
                onClick={() => {
                  navigate('/register')
                  setIsOpen(false)
                }}
                className="w-full px-1 py-1 glow-btn mt-2"
              >
                Get Started
              </motion.button>
            </div>
          </div>
        </motion.div>
      </div>
    </motion.nav>
  )
}
