import { useEffect, useRef } from 'react'
import { gsap } from 'gsap'
import { motion } from 'framer-motion'
import { ArrowRight, Play, Sparkles, Twitter, Book, Send } from 'lucide-react'

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
              Orion
            </span>
        </h1>

          <p
            ref={subtitleRef}
            className="text-xl md:text-2xl text-gray-300 mb-12 max-w-3xl mx-auto leading-relaxed"
          >
            Converting <span className="text-[#FDDA00] font-semibold">Web3 Enthusiasts</span> to
            <span className="text-[#FDDA00] font-semibold"> Product Users</span>.
          </p>

        <div ref={ctaRef} className="flex flex-col sm:flex-row gap-4 justify-center items-center">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => window.location.href = '/register'}
            className="group relative px-8 py-4 bg-gradient-to-r from-[#FDDA00] to-yellow-400 text-black font-bold rounded-lg shadow-lg hover:shadow-[#FDDA00]/50 transition-all duration-300 orbitron-font"
          >
            <span className="relative z-10 flex items-center gap-2">
              Signup
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

        {/* Quick actions row */}
        <div className="mt-8 flex items-center justify-center gap-6">
          <a
            href="https://x.com/yourhandle"
            target="_blank"
            rel="noreferrer"
            className="group p-3 rounded-xl border border-white/10 bg-white/5 backdrop-blur-md text-gray-200 hover:text-[#FDDA00] hover:border-[#FDDA00]/40 transition"
            aria-label="X (Twitter)"
          >
            <Twitter className="w-5 h-5" />
          </a>
          <a
            href="/whitepaper"
            className="group p-3 rounded-xl border border-white/10 bg-white/5 backdrop-blur-md text-gray-200 hover:text-[#FDDA00] hover:border-[#FDDA00]/40 transition"
            aria-label="Whitepaper"
          >
            <Book className="w-5 h-5" />
          </a>
          <a
            href="https://t.me/yourchannel"
            target="_blank"
            rel="noreferrer"
            className="group p-3 rounded-xl border border-white/10 bg-white/5 backdrop-blur-md text-gray-200 hover:text-[#FDDA00] hover:border-[#FDDA00]/40 transition"
            aria-label="Telegram"
          >
            <Send className="w-5 h-5" />
          </a>
        </div>
      </div>

      {/* Optional floating accents removed to keep background consistent */}
    </section>
  )
}
