import { useEffect, useRef } from 'react'
import { gsap } from 'gsap'
import { motion } from 'framer-motion'
import { useNavigation } from '../contexts/NavigationContext'
import { ArrowRight, Twitter, Book, Send } from 'lucide-react'

export default function Hero() {
  const { navigate } = useNavigation()
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
    <section id="home" ref={heroRef} className="relative min-h-screen flex items-center justify-center px-4 lg:mt-15">

      {/* Content */}
      <div className="relative z-10 text-center max-w-6xl mx-auto">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="mb-8"
        >
          <motion.img
            src="/orionorion.png"
            alt="Orion mark"
            className="mx-auto w-14 h-14 object-contain drop-shadow-[0_0_12px_rgba(253,218,0,0.25)]"
            animate={{ y: [0, -6, 0], rotate: [0, 1.5, 0] }}
            transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
          />
        </motion.div>

        <h1
          ref={titleRef}
          className="heading-font text-[2rem] leading-[1.08] sm:text-[2.25rem] md:text-6xl lg:text-7xl xl:text-8xl font-semibold mb-6 text-white"
        >
          Converting{' '}
          <br />
          <span className="text-[#FDDA00]">Web3 Enthusiasts</span>{' '}
          <br />
          into Product Users
        </h1>

        <p
          ref={subtitleRef}
          className="text-base md:text-lg text-gray-300 mb-10 max-w-3xl mx-auto leading-relaxed"
        >
          Learn, build, and ship with an academy designed for real product adoption.
        </p>

        <div ref={ctaRef} className="flex flex-col sm:flex-row gap-4 justify-center items-center">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => navigate('/register')}
            className="px-8 py-4 glow-btn--black rounded-full flex items-center gap-2"
          >
            Signup
            <ArrowRight className="w-5 h-5" />
          </motion.button>

          {/* Secondary demo button removed per request */}
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
          <span className="h-6 w-px bg-white/10" aria-hidden="true" />
          <a
            href="/whitepaper"
            className="group p-3 rounded-xl border border-white/10 bg-white/5 backdrop-blur-md text-gray-200 hover:text-[#FDDA00] hover:border-[#FDDA00]/40 transition"
            aria-label="Whitepaper"
          >
            <Book className="w-5 h-5" />
          </a>
          <span className="h-6 w-px bg-white/10" aria-hidden="true" />
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
