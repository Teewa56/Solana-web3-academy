import { useState } from 'react'
import { motion } from 'framer-motion'
import { Eye, EyeOff, Mail, Lock, ArrowRight } from 'lucide-react'
import { useNavigation } from '../../contexts/NavigationContext'
import { authAPI } from '../../services/api'

export default function Login() {
  const { navigate } = useNavigation()
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  })
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setIsLoading(true)

    try {
      const response = await authAPI.login({
        email: formData.email,
        password: formData.password
      })

      if (response.data.success) {
        // Store tokens
        localStorage.setItem('accessToken', response.data.accessToken)
        if (response.data.refreshToken) {
          localStorage.setItem('refreshToken', response.data.refreshToken)
        }

        // Store user data
        localStorage.setItem('user', JSON.stringify(response.data.user))

        // Redirect to dashboard after successful login
        navigate('/dashboard')
      } else {
        setError(response.data.message || 'Login failed')
      }
    } catch (error: any) {
      console.error('Login error:', error)
      setError(error.response?.data?.message || 'Login failed. Please check your credentials.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-black text-white flex items-center justify-center px-4">
      {/* Background Effects */}
      <div className="absolute inset-0 bg-black">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(253,218,0,0.1),transparent_50%)]"></div>
        <div className="absolute top-20 left-20 w-32 h-32 bg-[#FDDA00] rounded-full blur-3xl opacity-20 neon-float"></div>
        <div className="absolute bottom-20 right-20 w-48 h-48 bg-[#FDDA00] rounded-full blur-3xl opacity-15 neon-float" style={{animationDelay: '1s'}}></div>
      </div>

      <div className="relative z-10 w-full max-w-md">
        {/* Logo */}
        <motion.div
          initial={{ y: -50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.8 }}
          className="text-center mb-8"
        >
          <div className="flex items-center justify-center gap-3 mb-6">
            <img
              src="/orionorion.png"
              alt="Orion Logo"
              className="w-12 h-12 object-contain"
            />
            <span className="text-3xl font-bold bg-gradient-to-r from-[#FDDA00] to-yellow-300 bg-clip-text text-transparent">
              Orion
            </span>
          </div>
          <h1 className="text-2xl font-bold text-white mb-2">Welcome Back</h1>
          <p className="text-gray-400">Sign in to continue your Web3 journey</p>
        </motion.div>

        {/* Login Form */}
        <motion.div
          initial={{ y: 50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="rounded-xl p-8 bg-white/[0.03] backdrop-blur-sm border border-white/10 shadow-[0_10px_40px_rgba(0,0,0,0.6)]"
        >
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Error Message */}
            {error && (
              <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-lg">
                <p className="text-red-400 text-sm">{error}</p>
              </div>
            )}

            {/* Email Field */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-300 mb-2">
                Email Address
              </label>
              <div className="relative group">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400 transition-colors group-focus-within:text-[#FDDA00]" />
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  className="w-full pl-10 pr-4 py-3.5 bg-[#0B0B0B]/90 border border-white/10 rounded-lg text-white placeholder-white/30 focus:outline-none focus:ring-2 focus:ring-[#FDDA00]/40 focus:border-[#FDDA00]/40 hover:border-[#FDDA00]/25 transition-all shadow-[0_0_0_rgba(0,0,0,0)] focus:shadow-[0_0_20px_rgba(253,218,0,0.08)]"
                  placeholder="your@email.com"
                />
              </div>
            </div>

            {/* Password Field */}
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-300 mb-2">
                Password
              </label>
              <div className="relative group">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400 transition-colors group-focus-within:text-[#FDDA00]" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  id="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  required
                  className="w-full pl-10 pr-12 py-3.5 bg-[#0B0B0B]/90 border border-white/10 rounded-lg text-white placeholder-white/30 focus:outline-none focus:ring-2 focus:ring-[#FDDA00]/40 focus:border-[#FDDA00]/40 hover:border-[#FDDA00]/25 transition-all shadow-[0_0_0_rgba(0,0,0,0)] focus:shadow-[0_0_20px_rgba(253,218,0,0.08)]"
                  placeholder="Enter your password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-[#FDDA00] transition-transform duration-150 ease-out"
                >
                  {showPassword ? <EyeOff className="w-5 h-5 rotate-90" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            {/* Forgot Password */}
            <div className="flex justify-end">
              <button
                type="button"
                className="text-sm text-[#FDDA00] hover:text-yellow-300 transition-colors"
              >
                Forgot Password?
              </button>
            </div>

            {/* Submit Button */}
            <motion.button
              type="submit"
              disabled={isLoading}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="w-full px-6 py-4 bg-gradient-to-r from-[#FDDA00] to-yellow-400 text-black font-bold rounded-lg hover:shadow-lg hover:shadow-[#FDDA00]/50 transition-all duration-300 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <div className="w-5 h-5 border-2 border-black border-t-transparent rounded-full animate-spin"></div>
              ) : (
                <>
                  Sign In
                  <ArrowRight className="w-5 h-5" />
                </>
              )}
            </motion.button>
          </form>

          {/* Register Link */}
          <div className="mt-6 text-center">
            <p className="text-gray-400">
              Don't have an account?{' '}
              <button
                onClick={() => navigate('/register')}
                className="text-[#FDDA00] hover:text-yellow-300 transition-colors font-medium"
              >
                Create Account
              </button>
            </p>
          </div>
        </motion.div>

        {/* Floating Elements */}
        <div className="absolute top-1/4 left-10 w-4 h-4 bg-[#FDDA00] rounded-full opacity-60 neon-float"></div>
        <div className="absolute top-1/3 right-16 w-6 h-6 bg-[#FDDA00] rounded-full opacity-40 neon-float" style={{animationDelay: '0.5s'}}></div>
        <div className="absolute bottom-1/4 left-1/4 w-3 h-3 bg-[#FDDA00] rounded-full opacity-50 neon-float" style={{animationDelay: '1.5s'}}></div>
      </div>
    </div>
  )
}
