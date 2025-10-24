
import { motion } from 'framer-motion'
import { BookOpen, Clock, Users, Star, Play, CheckCircle } from 'lucide-react'

export default function Courses() {
  const courses = [
    {
      id: '1',
      title: 'Solana Fundamentals',
      description: 'Learn the basics of Solana blockchain development',
      progress: 75,
      duration: '4 weeks',
      students: 120,
      rating: 4.8,
      status: 'in-progress',
      thumbnail: '/api/placeholder/300/200'
    },
    {
      id: '2',
      title: 'Smart Contract Security',
      description: 'Advanced security practices for Solana smart contracts',
      progress: 45,
      duration: '6 weeks',
      students: 85,
      rating: 4.9,
      status: 'in-progress',
      thumbnail: '/api/placeholder/300/200'
    },
    {
      id: '3',
      title: 'DeFi Protocols',
      description: 'Building decentralized finance applications',
      progress: 100,
      duration: '8 weeks',
      students: 200,
      rating: 4.7,
      status: 'completed',
      thumbnail: '/api/placeholder/300/200'
    }
  ]

  return (
    <div className="space-y-8">
      {/* Header */}
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.6 }}
        className="flex items-center justify-between"
      >
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">My Courses</h1>
          <p className="text-gray-400">Continue your learning journey</p>
        </div>
        <button className="px-6 py-3 bg-[#FDDA00] text-black rounded-lg font-medium hover:bg-[#FDDA00]/80 transition-colors">
          Browse All Courses
        </button>
      </motion.div>

      {/* Courses Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {courses.map((course, index) => (
          <motion.div
            key={course.id}
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.6, delay: index * 0.1 }}
            whileHover={{ y: -5 }}
            className="bg-gray-900/50 backdrop-blur-sm border border-gray-800 rounded-xl overflow-hidden hover:border-[#FDDA00]/50 transition-all duration-300"
          >
            {/* Course Thumbnail */}
            <div className="relative h-48 bg-gradient-to-br from-[#FDDA00]/20 to-purple-500/20">
              <div className="absolute inset-0 flex items-center justify-center">
                <BookOpen className="w-16 h-16 text-[#FDDA00]" />
              </div>
              <div className="absolute top-4 right-4">
                {course.status === 'completed' ? (
                  <CheckCircle className="w-6 h-6 text-green-400" />
                ) : (
                  <Play className="w-6 h-6 text-[#FDDA00]" />
                )}
              </div>
            </div>

            {/* Course Content */}
            <div className="p-6">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-xl font-bold text-white">{course.title}</h3>
                <div className="flex items-center gap-1">
                  <Star className="w-4 h-4 text-[#FDDA00] fill-current" />
                  <span className="text-sm text-gray-400">{course.rating}</span>
                </div>
              </div>

              <p className="text-gray-400 text-sm mb-4">{course.description}</p>

              {/* Progress Bar */}
              <div className="mb-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-gray-400">Progress</span>
                  <span className="text-sm text-[#FDDA00] font-medium">{course.progress}%</span>
                </div>
                <div className="w-full bg-gray-700 rounded-full h-2">
                  <div
                    className="bg-[#FDDA00] h-2 rounded-full transition-all duration-300"
                    style={{ width: `${course.progress}%` }}
                  />
                </div>
              </div>

              {/* Course Stats */}
              <div className="flex items-center justify-between text-sm text-gray-400 mb-4">
                <div className="flex items-center gap-1">
                  <Clock className="w-4 h-4" />
                  <span>{course.duration}</span>
                </div>
                <div className="flex items-center gap-1">
                  <Users className="w-4 h-4" />
                  <span>{course.students} students</span>
                </div>
              </div>

              {/* Action Button */}
              <button className={`w-full py-2 px-4 rounded-lg font-medium transition-colors ${
                course.status === 'completed'
                  ? 'bg-green-500/20 text-green-400 border border-green-500/30'
                  : 'bg-[#FDDA00] text-black hover:bg-[#FDDA00]/80'
              }`}>
                {course.status === 'completed' ? 'View Certificate' : 'Continue Learning'}
              </button>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  )
}
