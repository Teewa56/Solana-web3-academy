import { useState } from 'react'
import { motion } from 'framer-motion'
import { Eye, EyeOff, Mail, Lock, User, ArrowRight, Check } from 'lucide-react'
import { useNavigation } from '../../contexts/NavigationContext'
import { authAPI } from '../../services/api'

export default function Register() {
  const { navigate } = useNavigation()
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    password: '',
    confirmPassword: ''
  })
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [agreedToTerms, setAgreedToTerms] = useState(false)
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

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match')
      return
    }

    if (!agreedToTerms) {
      setError('Please agree to the terms and conditions')
      return
    }

    setIsLoading(true)

    try {
      const response = await authAPI.register({
        fullName: formData.fullName,
        email: formData.email,
        password: formData.password,
        role: 'student'
      })

      if (response.data.success) {
        // Store email for verification page
        localStorage.setItem('pendingEmail', formData.email)
        // Redirect to email verification
        navigate('/verify-email')
      } else {
        setError(response.data.message || 'Registration failed')
      }
    } catch (error: any) {
      console.error('Register error:', error)
      setError(error.response?.data?.message || 'Registration failed. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  const passwordRequirements = [
    { text: 'At least 8 characters', met: formData.password.length >= 8 },
    { text: 'Contains uppercase letter', met: /[A-Z]/.test(formData.password) },
    { text: 'Contains lowercase letter', met: /[a-z]/.test(formData.password) },
    { text: 'Contains number', met: /\d/.test(formData.password) }
  ]

  return (
    <div className="min-h-screen bg-black text-white flex items-center justify-center px-4 py-8">
      {/* Background Effects */}
      <div className="absolute inset-0 bg-gradient-to-br from-black via-gray-900 to-black">
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
              alt="Orion Academy Logo"
              className="w-12 h-12 object-contain"
            />
            <span className="text-3xl font-bold bg-gradient-to-r from-[#FDDA00] to-yellow-300 bg-clip-text text-transparent">
              Orion Academy
            </span>
          </div>
          <h1 className="text-2xl font-bold text-white mb-2">Join Orion Academy</h1>
          <p className="text-gray-400">Start your Web3 development journey</p>
        </motion.div>

        {/* Register Form */}
        <motion.div
          initial={{ y: 50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="bg-gray-900/50 backdrop-blur-sm border border-gray-800 rounded-xl p-8"
        >
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Error Message */}
            {error && (
              <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-lg">
                <p className="text-red-400 text-sm">{error}</p>
              </div>
            )}

            {/* Full Name Field */}
            <div>
              <label htmlFor="fullName" className="block text-sm font-medium text-gray-300 mb-2">
                Full Name
              </label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  id="fullName"
                  name="fullName"
                  value={formData.fullName}
                  onChange={handleChange}
                  required
                  className="w-full pl-10 pr-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-400 focus:border-[#FDDA00] focus:outline-none transition-colors"
                  placeholder="Enter your full name"
                />
              </div>
            </div>

            {/* Email Field */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-300 mb-2">
                Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  className="w-full pl-10 pr-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-400 focus:border-[#FDDA00] focus:outline-none transition-colors"
                  placeholder="your@email.com"
                />
              </div>
            </div>

            {/* Password Field */}
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-300 mb-2">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  id="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  required
                  className="w-full pl-10 pr-12 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-400 focus:border-[#FDDA00] focus:outline-none transition-colors"
                  placeholder="Create a strong password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-[#FDDA00] transition-colors"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>

              {/* Password Requirements */}
              {formData.password && (
                <div className="mt-2 space-y-1">
                  {passwordRequirements.map((req, index) => (
                    <div key={index} className="flex items-center gap-2 text-sm">
                      <Check className={`w-4 h-4 ${req.met ? 'text-green-400' : 'text-gray-500'}`} />
                      <span className={req.met ? 'text-green-400' : 'text-gray-500'}>
                        {req.text}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Confirm Password Field */}
            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-300 mb-2">
                Confirm Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  id="confirmPassword"
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  required
                  className="w-full pl-10 pr-12 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-400 focus:border-[#FDDA00] focus:outline-none transition-colors"
                  placeholder="Confirm your password"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-[#FDDA00] transition-colors"
                >
                  {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            {/* Terms and Conditions */}
            <div className="flex items-start gap-3">
              <button
                type="button"
                onClick={() => setAgreedToTerms(!agreedToTerms)}
                className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-colors ${
                  agreedToTerms
                    ? 'bg-[#FDDA00] border-[#FDDA00]'
                    : 'border-gray-600 hover:border-[#FDDA00]'
                }`}
              >
                {agreedToTerms && <Check className="w-3 h-3 text-black" />}
              </button>
              <label className="text-sm text-gray-400 cursor-pointer">
                I agree to the{' '}
                <button type="button" className="text-[#FDDA00] hover:text-yellow-300 transition-colors">
                  Terms of Service
                </button>
                {' '}and{' '}
                <button type="button" className="text-[#FDDA00] hover:text-yellow-300 transition-colors">
                  Privacy Policy
                </button>
              </label>
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
                  Create Account
                  <ArrowRight className="w-5 h-5" />
                </>
              )}
            </motion.button>
          </form>

          {/* Login Link */}
          <div className="mt-6 text-center">
            <p className="text-gray-400">
              Already have an account?{' '}
              <button
                onClick={() => navigate('/login')}
                className="text-[#FDDA00] hover:text-yellow-300 transition-colors font-medium"
              >
                Sign In
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
