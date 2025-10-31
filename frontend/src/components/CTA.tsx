import { motion } from 'framer-motion'
import { useNavigation } from '../contexts/NavigationContext'

export default function CTA() {
  const { navigate } = useNavigation()
  return (
    <section className="py-20 px-4">
      <div className="max-w-4xl mx-auto text-center">
        <motion.div
          initial={{ y: 50, opacity: 0 }}
          whileInView={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
        >
          <h2 className="text-4xl md:text-5xl font-bold mb-6 heading-font">
            Ready to Start Your <span className="text-[#FDDA00]">Web3 Journey</span>?
          </h2>
          <p className="text-xl text-gray-400 mb-8 max-w-2xl mx-auto">
            Join thousands of developers learning blockchain development with Orion
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => navigate('/register')}
              className="px-8 py-4 glow-btn--black"
            >
              Get Started Now
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' })}
              className="px-8 py-4 glow-btn--black"
            >
              View Courses
            </motion.button>
          </div>
        </motion.div>
      </div>
    </section>
  )
}
