import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Mail, ArrowRight, RefreshCw, CheckCircle } from 'lucide-react'
import { useNavigation } from '../../contexts/NavigationContext'
import { authAPI } from '../../services/api'

export default function EmailVerification() {
  const { navigate } = useNavigation()
  const [otp, setOtp] = useState(['', '', '', '', '', ''])
  const [isLoading, setIsLoading] = useState(false)
  const [isResending, setIsResending] = useState(false)
  const [timeLeft, setTimeLeft] = useState(300) // 5 minutes
  const [isVerified, setIsVerified] = useState(false)
  const [error, setError] = useState('')

  // Get email from localStorage or URL params
  const email = localStorage.getItem('pendingEmail') || 'your@email.com'

  useEffect(() => {
    if (timeLeft > 0) {
      const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000)
      return () => clearTimeout(timer)
    }
  }, [timeLeft])

  const handleOtpChange = (index: number, value: string) => {
    if (value.length > 1) return

    const newOtp = [...otp]
    newOtp[index] = value
    setOtp(newOtp)

    // Auto-focus next input
    if (value && index < 5) {
      const nextInput = document.getElementById(`otp-${index + 1}`)
      nextInput?.focus()
    }
  }

  const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      const prevInput = document.getElementById(`otp-${index - 1}`)
      prevInput?.focus()
    }
  }

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault()
    const otpCode = otp.join('')
    setError('')

    if (otpCode.length !== 6) {
      setError('Please enter the complete 6-digit code')
      return
    }

    setIsLoading(true)

    try {
      const response = await authAPI.verifyEmail({
        email: email,
        otp: otpCode
      })

      if (response.data.success) {
        // Store tokens and user data
        localStorage.setItem('accessToken', response.data.accessToken)
        localStorage.setItem('user', JSON.stringify(response.data.userData))

        // Clear pending email
        localStorage.removeItem('pendingEmail')

        setIsVerified(true)
        // Redirect to dashboard after successful verification
        navigate('/dashboard')
      } else {
        setError(response.data.message || 'Invalid OTP. Please try again.')
      }
    } catch (error: any) {
      console.error('Verification error:', error)
      setError(error.response?.data?.message || 'Invalid OTP. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  const handleResendOtp = async () => {
    setIsResending(true)
    setError('')

    try {
      const response = await authAPI.resendOTP({
        email: email
      })

      if (response.data.success) {
        setTimeLeft(300) // Reset timer
        setError('') // Clear any previous errors
      } else {
        setError(response.data.message || 'Failed to resend OTP. Please try again.')
      }
    } catch (error: any) {
      console.error('Resend error:', error)
      setError(error.response?.data?.message || 'Failed to resend OTP. Please try again.')
    } finally {
      setIsResending(false)
    }
  }

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  if (isVerified) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center px-4">
        <div className="absolute inset-0 bg-black">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(253,218,0,0.1),transparent_50%)]"></div>
        </div>

        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.8 }}
          className="relative z-10 text-center max-w-md"
        >
          <div className="w-20 h-20 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-white mb-4">Email Verified!</h1>
          <p className="text-gray-400 mb-8">
            Your email has been successfully verified. You can now access your dashboard.
          </p>
          <motion.button
            onClick={() => navigate('/dashboard')}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="px-8 py-4 bg-gradient-to-r from-[#FDDA00] to-yellow-400 text-black font-bold rounded-lg hover:shadow-lg hover:shadow-[#FDDA00]/50 transition-all duration-300"
          >
            Go to Dashboard
          </motion.button>
        </motion.div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-black text-white flex items-center justify-center px-4">
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
              alt="Orion Logo"
              className="w-12 h-12 object-contain"
            />
            <span className="text-3xl font-bold bg-gradient-to-r from-[#FDDA00] to-yellow-300 bg-clip-text text-transparent">
              Orion
            </span>
          </div>
          <div className="w-16 h-16 bg-[#FDDA00]/20 rounded-full flex items-center justify-center mx-auto mb-4">
            <Mail className="w-8 h-8 text-[#FDDA00]" />
          </div>
          <h1 className="text-2xl font-bold text-white mb-2">Verify Your Email</h1>
          <p className="text-gray-400">
            We've sent a 6-digit code to <span className="text-[#FDDA00]">{email}</span>
          </p>
        </motion.div>

        {/* Verification Form */}
        <motion.div
          initial={{ y: 50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="rounded-xl p-8 bg-white/[0.03] backdrop-blur-sm border border-white/10 shadow-[0_10px_40px_rgba(0,0,0,0.6)]"
        >
          <form onSubmit={handleVerify} className="space-y-6">
            {/* Error Message */}
            {error && (
              <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-lg">
                <p className="text-red-400 text-sm">{error}</p>
              </div>
            )}

            {/* OTP Input */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-4 text-center">
                Enter Verification Code
              </label>
              <div className="flex justify-center gap-3">
                {otp.map((digit, index) => (
                  <input
                    key={index}
                    id={`otp-${index}`}
                    type="text"
                    maxLength={1}
                    value={digit}
                    onChange={(e) => handleOtpChange(index, e.target.value)}
                    onKeyDown={(e) => handleKeyDown(index, e)}
                    className="w-12 h-12 text-center text-xl font-bold bg-[#0B0B0B]/90 border border-white/10 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-[#FDDA00]/40 focus:border-[#FDDA00]/40 hover:border-[#FDDA00]/25 transition-all"
                  />
                ))}
              </div>
            </div>

            {/* Timer */}
            <div className="text-center">
              {timeLeft > 0 ? (
                <p className="text-sm text-gray-400">
                  Code expires in <span className="text-[#FDDA00] font-medium">{formatTime(timeLeft)}</span>
                </p>
              ) : (
                <p className="text-sm text-red-400">Code has expired</p>
              )}
            </div>

            {/* Verify Button */}
            <motion.button
              type="submit"
              disabled={isLoading || otp.join('').length !== 6}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="w-full px-6 py-4 glow-btn--black rounded-full flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <div className="w-5 h-5 border-2 border-black border-t-transparent rounded-full animate-spin"></div>
              ) : (
                <>
                  Verify Email
                  <ArrowRight className="w-5 h-5" />
                </>
              )}
            </motion.button>
          </form>

          {/* Resend OTP */}
          <div className="mt-6 text-center">
            <p className="text-gray-400 mb-4">Didn't receive the code?</p>
            <button
              onClick={handleResendOtp}
              disabled={isResending || timeLeft > 0}
              className="text-[#FDDA00] hover:text-yellow-300 transition-colors font-medium flex items-center justify-center gap-2 mx-auto disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isResending ? (
                <RefreshCw className="w-4 h-4 animate-spin" />
              ) : (
                <RefreshCw className="w-4 h-4" />
              )}
              Resend Code
            </button>
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
