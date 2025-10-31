import { motion } from 'framer-motion'
import {
  GraduationCap,
  Zap,
  Shield,
  Trophy,
  Users,
  BookOpen
} from 'lucide-react'

const features = [
  {
    icon: <GraduationCap className="w-8 h-8" />,
    title: "Blockchain Certificates",
    description: "Earn NFT certificates verified on Solana blockchain"
  },
  {
    icon: <Zap className="w-8 h-8" />,
    title: "Fast Learning",
    description: "Accelerated curriculum designed by industry experts"
  },
  {
    icon: <Shield className="w-8 h-8" />,
    title: "Secure Platform",
    description: "Your credentials are secured by blockchain technology"
  },
  {
    icon: <Trophy className="w-8 h-8" />,
    title: "Gamification",
    description: "Earn points, badges, and compete on leaderboards"
  },
  {
    icon: <Users className="w-8 h-8" />,
    title: "Community",
    description: "Join cohorts and learn with like-minded developers"
  },
  {
    icon: <BookOpen className="w-8 h-8" />,
    title: "Comprehensive",
    description: "From basics to advanced Solana development"
  }
]

export default function Features() {
  return (
    <section id="features" className="py-20 px-4">
      <div className="max-w-6xl mx-auto">
        <motion.div
          initial={{ y: 50, opacity: 0 }}
          whileInView={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl md:text-5xl font-bold mb-6 heading-font">
            Why Choose <span className="text-[#FDDA00]">Orion</span>?
          </h2>
          <p className="text-xl text-gray-400 max-w-2xl mx-auto">
            Learn blockchain development with industry-leading curriculum and earn verifiable credentials
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <motion.div
              key={index}
              initial={{ y: 50, opacity: 0 }}
              whileInView={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              viewport={{ once: true }}
              whileHover={{ y: -5 }}
              className="group p-6 rounded-xl bg-white/[0.03] backdrop-blur-sm border border-white/10 shadow-[0_10px_30px_rgba(0,0,0,0.45)] hover:border-[#FDDA00]/35 hover:shadow-[0_12px_36px_rgba(253,218,0,0.12)] transition-all duration-300"
            >
              <div className="text-[#FDDA00] mb-4 group-hover:scale-110 transition-transform drop-shadow-[0_0_12px_rgba(253,218,0,0.35)]">
                {feature.icon}
              </div>
              <h3 className="text-xl font-bold mb-3 heading-font">{feature.title}</h3>
              <p className="text-gray-300">{feature.description}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
