import { motion } from 'framer-motion'
import { FileText, Download } from 'lucide-react'

export default function Whitepaper() {
  return (
    <div className="min-h-screen text-white flex items-center justify-center px-4 py-16">

      <div className="relative z-10 w-full max-w-5xl grid grid-cols-1 md:grid-cols-2 gap-8">
        <motion.div
          initial={{ y: 24, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.6 }}
          className="bg-white/5 border border-white/10 rounded-2xl p-8 backdrop-blur-xl"
        >
          <div className="flex items-center gap-3 mb-4">
            <FileText className="w-6 h-6 text-[#FDDA00]" />
            <h1 className="text-2xl font-semibold">Orion Academy Whitepaper</h1>
          </div>
          <p className="text-gray-300 leading-relaxed">
            A concise overview of our mission to convert Web3 enthusiasts into product users,
            our curriculum architecture, credentialing model, and community flywheel.
          </p>
          <p className="text-gray-400 text-sm mt-4">Version 1.0 • Updated Oct 2025</p>
        </motion.div>

        <motion.div
          initial={{ y: 24, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="bg-white/5 border border-white/10 rounded-2xl p-8 backdrop-blur-xl flex flex-col"
        >
          <div className="flex-1 rounded-lg bg-black/40 border border-white/10 h-64 mb-6 flex items-center justify-center text-gray-400">
            In-page preview (coming soon)
          </div>
          <div className="flex gap-3">
            <a
              href="#"
              className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-3 rounded-lg bg-gradient-to-r from-[#FDDA00] to-yellow-400 text-black font-semibold shadow hover:opacity-95"
            >
              <Download className="w-4 h-4" />
              Download PDF
            </a>
            <a
              href="#"
              className="flex-1 inline-flex items-center justify-center px-4 py-3 rounded-lg border border-[#FDDA00]/40 text-[#FDDA00] hover:bg-[#FDDA00]/10"
            >
              Open Viewer
            </a>
          </div>
        </motion.div>
      </div>
    </div>
  )
}


