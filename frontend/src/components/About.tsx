import { motion } from 'framer-motion'
import { Users, Target, Award, TrendingUp } from 'lucide-react'

export default function About() {
  const stats = [
    { icon: <Users className="w-8 h-8" />, number: '10,000+', label: 'Students Enrolled' },
    { icon: <Award className="w-8 h-8" />, number: '5,000+', label: 'Certificates Issued' },
    { icon: <Target className="w-8 h-8" />, number: '95%', label: 'Success Rate' },
    { icon: <TrendingUp className="w-8 h-8" />, number: '50+', label: 'Industry Partners' }
  ]

  return (
    <section id="about" className="py-20 px-4 bg-black">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ y: 50, opacity: 0 }}
          whileInView={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl md:text-5xl font-bold mb-6 orbitron-font">
            About <span className="text-[#FDDA00]">Orion</span>
          </h2>
          <p className="text-xl text-gray-400 max-w-3xl mx-auto">
            We're revolutionizing blockchain education by combining cutting-edge curriculum with real-world applications and industry partnerships.
          </p>
        </motion.div>

        <div className="grid lg:grid-cols-2 gap-12 items-center mb-16">
          {/* Content */}
          <motion.div
            initial={{ x: -50, opacity: 0 }}
            whileInView={{ x: 0, opacity: 1 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
          >
            <h3 className="text-3xl font-bold text-[#FDDA00] mb-6 orbitron-font">Our Mission</h3>
            <p className="text-gray-300 mb-6 leading-relaxed">
              At Orion, we believe that blockchain technology is the future of the internet. Our mission is to provide world-class education that prepares students for the rapidly evolving Web3 landscape.
            </p>
            <p className="text-gray-300 mb-8 leading-relaxed">
              We combine traditional learning methodologies with cutting-edge blockchain technology to create an immersive educational experience that produces industry-ready developers.
            </p>

            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-2 h-2 bg-[#FDDA00] rounded-full"></div>
                <span className="text-gray-300">Industry-leading curriculum</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-2 h-2 bg-[#FDDA00] rounded-full"></div>
                <span className="text-gray-300">Hands-on project experience</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-2 h-2 bg-[#FDDA00] rounded-full"></div>
                <span className="text-gray-300">Blockchain-verified certificates</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-2 h-2 bg-[#FDDA00] rounded-full"></div>
                <span className="text-gray-300">Expert mentorship</span>
              </div>
            </div>
          </motion.div>

          {/* Stats */}
          <motion.div
            initial={{ x: 50, opacity: 0 }}
            whileInView={{ x: 0, opacity: 1 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="grid grid-cols-2 gap-6"
          >
            {stats.map((stat, index) => (
              <motion.div
                key={stat.label}
                initial={{ y: 30, opacity: 0 }}
                whileInView={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                viewport={{ once: true }}
                whileHover={{ scale: 1.05 }}
                className="bg-gray-900/50 backdrop-blur-sm border border-gray-800 rounded-xl p-6 text-center hover:border-[#FDDA00]/50 transition-all duration-300"
              >
                <div className="text-[#FDDA00] mb-4 flex justify-center">
                  {stat.icon}
                </div>
                <div className="text-3xl font-bold text-white mb-2">{stat.number}</div>
                <div className="text-gray-400 text-sm">{stat.label}</div>
              </motion.div>
            ))}
          </motion.div>
        </div>

        {/* Values */}
        <motion.div
          initial={{ y: 50, opacity: 0 }}
          whileInView={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="text-center"
        >
          <h3 className="text-3xl font-bold text-[#FDDA00] mb-8 orbitron-font">Our Values</h3>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-gray-900/30 border border-gray-800 rounded-lg p-6 hover:border-[#FDDA00]/50 transition-all duration-300">
              <h4 className="text-xl font-bold text-white mb-3 orbitron-font">Innovation</h4>
              <p className="text-gray-400">
                We stay at the forefront of blockchain technology, constantly updating our curriculum to reflect the latest developments.
              </p>
            </div>
            <div className="bg-gray-900/30 border border-gray-800 rounded-lg p-6 hover:border-[#FDDA00]/50 transition-all duration-300">
              <h4 className="text-xl font-bold text-white mb-3 orbitron-font">Excellence</h4>
              <p className="text-gray-400">
                We maintain the highest standards in education, ensuring every student receives world-class training and support.
              </p>
            </div>
            <div className="bg-gray-900/30 border border-gray-800 rounded-lg p-6 hover:border-[#FDDA00]/50 transition-all duration-300">
              <h4 className="text-xl font-bold text-white mb-3 orbitron-font">Community</h4>
              <p className="text-gray-400">
                We foster a supportive learning environment where students can grow together and build lasting professional networks.
              </p>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  )
}
