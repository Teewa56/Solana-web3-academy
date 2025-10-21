import { motion } from 'framer-motion'

export default function CTA() {
  return (
    <section className="py-20 px-4 bg-gradient-to-r from-[#FDDA00]/10 to-transparent">
      <div className="max-w-4xl mx-auto text-center">
        <motion.div
          initial={{ y: 50, opacity: 0 }}
          whileInView={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
        >
          <h2 className="text-4xl md:text-5xl font-bold mb-6">
            Ready to Start Your <span className="text-[#FDDA00]">Web3 Journey</span>?
          </h2>
          <p className="text-xl text-gray-400 mb-8 max-w-2xl mx-auto">
            Join thousands of developers learning blockchain development with Orion Academy
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="px-8 py-4 bg-[#FDDA00] text-black font-bold rounded-lg hover:bg-yellow-400 transition-colors"
            >
              Get Started Now
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="px-8 py-4 border-2 border-[#FDDA00] text-[#FDDA00] font-bold rounded-lg hover:bg-[#FDDA00] hover:text-black transition-all"
            >
              View Courses
            </motion.button>
          </div>
        </motion.div>
      </div>
    </section>
  )
}
