import { useEffect, useRef } from 'react'
import { gsap } from 'gsap'
import { motion } from 'framer-motion'
import { ArrowRight, Play, Sparkles } from 'lucide-react'

export default function Hero() {
  const heroRef = useRef<HTMLDivElement>(null)
  const titleRef = useRef<HTMLHeadingElement>(null)
  const subtitleRef = useRef<HTMLParagraphElement>(null)
  const ctaRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const ctx = gsap.context(() => {
      // Hero animations
      gsap.fromTo(titleRef.current,
        { y: 100, opacity: 0 },
        { y: 0, opacity: 1, duration: 1.2, ease: "power3.out" }
      )

      gsap.fromTo(subtitleRef.current,
        { y: 50, opacity: 0 },
        { y: 0, opacity: 1, duration: 1, delay: 0.3, ease: "power3.out" }
      )

      gsap.fromTo(ctaRef.current,
        { y: 30, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.8, delay: 0.6, ease: "power3.out" }
      )

      // Floating animation for neon elements
      gsap.to(".neon-float", {
        y: -10,
        duration: 2,
        ease: "power2.inOut",
        yoyo: true,
        repeat: -1
      })
    }, heroRef)

    return () => ctx.revert()
  }, [])

  return (
    <section id="home" ref={heroRef} className="relative min-h-screen flex items-center justify-center px-4">
      {/* Animated Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-black via-gray-900 to-black">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(253,218,0,0.1),transparent_50%)]"></div>
        <div className="absolute top-20 left-20 w-32 h-32 bg-[#FDDA00] rounded-full blur-3xl opacity-20 neon-float"></div>
        <div className="absolute bottom-20 right-20 w-48 h-48 bg-[#FDDA00] rounded-full blur-3xl opacity-15 neon-float" style={{animationDelay: '1s'}}></div>
      </div>

      {/* Content */}
      <div className="relative z-10 text-center max-w-6xl mx-auto">
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="mb-8"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-[#FDDA00]/30 bg-[#FDDA00]/10 backdrop-blur-sm mb-6">
            <Sparkles className="w-4 h-4 text-[#FDDA00]" />
            <span className="text-sm font-medium text-[#FDDA00] orbitron-font">Web3 Education Platform</span>
          </div>
        </motion.div>

        <h1
          ref={titleRef}
          className="text-6xl md:text-8xl font-bold mb-6 leading-tight orbitron-font"
        >
            <span className="bg-gradient-to-r from-[#FDDA00] to-yellow-300 bg-clip-text text-transparent">
              Orion Academy
            </span>
        </h1>

          <p
            ref={subtitleRef}
            className="text-xl md:text-2xl text-gray-300 mb-12 max-w-3xl mx-auto leading-relaxed"
          >
            Master blockchain development with <span className="text-[#FDDA00] font-semibold">Solana</span> at Orion Academy, earn
            <span className="text-[#FDDA00] font-semibold"> NFT certificates</span>, and join the future of
            <span className="text-[#FDDA00] font-semibold"> decentralized education</span>
          </p>

        <div ref={ctaRef} className="flex flex-col sm:flex-row gap-4 justify-center items-center">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => window.location.href = '/register'}
            className="group relative px-8 py-4 bg-gradient-to-r from-[#FDDA00] to-yellow-400 text-black font-bold rounded-lg shadow-lg hover:shadow-[#FDDA00]/50 transition-all duration-300 orbitron-font"
          >
            <span className="relative z-10 flex items-center gap-2">
              Start Learning
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </span>
            <div className="absolute inset-0 bg-gradient-to-r from-[#FDDA00] to-yellow-400 rounded-lg blur opacity-75 group-hover:opacity-100 transition-opacity"></div>
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' })}
            className="group flex items-center gap-2 px-8 py-4 border-2 border-[#FDDA00] text-[#FDDA00] font-bold rounded-lg hover:bg-[#FDDA00] hover:text-black transition-all duration-300 orbitron-font"
          >
            <Play className="w-5 h-5" />
            Watch Demo
          </motion.button>
        </div>
      </div>

      {/* Floating Elements */}
      <div className="absolute top-1/4 left-10 w-4 h-4 bg-[#FDDA00] rounded-full opacity-60 neon-float"></div>
      <div className="absolute top-1/3 right-16 w-6 h-6 bg-[#FDDA00] rounded-full opacity-40 neon-float" style={{animationDelay: '0.5s'}}></div>
      <div className="absolute bottom-1/4 left-1/4 w-3 h-3 bg-[#FDDA00] rounded-full opacity-50 neon-float" style={{animationDelay: '1.5s'}}></div>
    </section>
  )
}
