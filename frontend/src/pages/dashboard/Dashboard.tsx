import { motion } from 'framer-motion'
import {
  BookOpen,
  FileText,
  Trophy,
  Award,
  TrendingUp,
  Clock,
  Star,
  Target,
  Zap
} from 'lucide-react'

export default function Dashboard() {
  const stats = [
    { icon: <BookOpen className="w-6 h-6" />, label: 'Courses Enrolled', value: '3', color: 'text-blue-400' },
    { icon: <FileText className="w-6 h-6" />, label: 'Assignments', value: '12', color: 'text-green-400' },
    { icon: <Trophy className="w-6 h-6" />, label: 'Points Earned', value: '2,450', color: 'text-[#FDDA00]' },
    { icon: <Award className="w-6 h-6" />, label: 'Certificates', value: '1', color: 'text-purple-400' }
  ]

  const recentActivity = [
    {
      type: 'assignment',
      title: 'Completed Solana Basics Assignment',
      time: '2 hours ago',
      points: '+50 points',
      icon: <FileText className="w-5 h-5" />
    },
    {
      type: 'certificate',
      title: 'Earned Blockchain Fundamentals Certificate',
      time: '1 day ago',
      points: 'NFT Minted',
      icon: <Award className="w-5 h-5" />
    },
    {
      type: 'course',
      title: 'Started Advanced Solana Development',
      time: '3 days ago',
      points: 'New Course',
      icon: <BookOpen className="w-5 h-5" />
    }
  ]

  const upcomingDeadlines = [
    {
      title: 'Smart Contract Security',
      dueDate: 'Tomorrow',
      progress: 75,
      color: 'text-red-400'
    },
    {
      title: 'DeFi Protocols',
      dueDate: 'In 3 days',
      progress: 45,
      color: 'text-yellow-400'
    },
    {
      title: 'NFT Marketplace',
      dueDate: 'Next week',
      progress: 20,
      color: 'text-green-400'
    }
  ]

  const achievements = [
    { title: 'First Assignment', description: 'Completed your first assignment', icon: <Star className="w-5 h-5" />, earned: true },
    { title: 'Quick Learner', description: 'Completed 3 assignments in a week', icon: <Zap className="w-5 h-5" />, earned: true },
    { title: 'Top Performer', description: 'Ranked in top 10% of cohort', icon: <Trophy className="w-5 h-5" />, earned: false },
    { title: 'Certificate Master', description: 'Earned 5 certificates', icon: <Award className="w-5 h-5" />, earned: false }
  ]

  return (
    <div className="space-y-8">
      {/* Welcome Section */}
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.6 }}
        className="bg-gradient-to-r from-[#FDDA00]/10 to-transparent border border-[#FDDA00]/20 rounded-xl p-6"
      >
        <h1 className="text-3xl font-bold text-white mb-2">
          Welcome back, <span className="text-[#FDDA00]">John</span>! 👋
        </h1>
        <p className="text-gray-400">
          Ready to continue your Web3 development journey? You're making great progress!
        </p>
      </motion.div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => (
          <motion.div
            key={stat.label}
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.6, delay: index * 0.1 }}
            whileHover={{ y: -5 }}
            className="bg-gray-900/50 backdrop-blur-sm border border-gray-800 rounded-xl p-6 hover:border-[#FDDA00]/50 transition-all duration-300"
          >
            <div className="flex items-center justify-between mb-4">
              <div className={`p-3 rounded-lg bg-gray-800 ${stat.color}`}>
                {stat.icon}
              </div>
              <TrendingUp className="w-5 h-5 text-green-400" />
            </div>
            <h3 className="text-2xl font-bold text-white mb-1">{stat.value}</h3>
            <p className="text-gray-400 text-sm">{stat.label}</p>
          </motion.div>
        ))}
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Recent Activity */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="lg:col-span-2 bg-gray-900/50 backdrop-blur-sm border border-gray-800 rounded-xl p-6"
        >
          <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
            <Clock className="w-5 h-5 text-[#FDDA00]" />
            Recent Activity
          </h2>
          <div className="space-y-4">
            {recentActivity.map((activity, index) => (
              <motion.div
                key={index}
                initial={{ x: -20, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ duration: 0.6, delay: 0.5 + index * 0.1 }}
                className="flex items-center gap-4 p-4 bg-gray-800/50 rounded-lg hover:bg-gray-800 transition-colors"
              >
                <div className="p-2 bg-[#FDDA00]/20 rounded-lg text-[#FDDA00]">
                  {activity.icon}
                </div>
                <div className="flex-1">
                  <h3 className="text-white font-medium">{activity.title}</h3>
                  <p className="text-gray-400 text-sm">{activity.time}</p>
                </div>
                <span className="text-[#FDDA00] text-sm font-medium">{activity.points}</span>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Upcoming Deadlines */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.6 }}
          className="bg-gray-900/50 backdrop-blur-sm border border-gray-800 rounded-xl p-6"
        >
          <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
            <Target className="w-5 h-5 text-[#FDDA00]" />
            Upcoming Deadlines
          </h2>
          <div className="space-y-4">
            {upcomingDeadlines.map((deadline, index) => (
              <motion.div
                key={index}
                initial={{ x: 20, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ duration: 0.6, delay: 0.7 + index * 0.1 }}
                className="p-4 bg-gray-800/50 rounded-lg"
              >
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-white font-medium text-sm">{deadline.title}</h3>
                  <span className={`text-xs font-medium ${deadline.color}`}>{deadline.dueDate}</span>
                </div>
                <div className="w-full bg-gray-700 rounded-full h-2">
                  <div
                    className="bg-[#FDDA00] h-2 rounded-full transition-all duration-300"
                    style={{ width: `${deadline.progress}%` }}
                  ></div>
                </div>
                <p className="text-gray-400 text-xs mt-1">{deadline.progress}% complete</p>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* Achievements */}
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.6, delay: 0.8 }}
        className="bg-gray-900/50 backdrop-blur-sm border border-gray-800 rounded-xl p-6"
      >
        <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
          <Trophy className="w-5 h-5 text-[#FDDA00]" />
          Achievements
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {achievements.map((achievement, index) => (
            <motion.div
              key={index}
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.9 + index * 0.1 }}
              whileHover={{ scale: 1.05 }}
              className={`p-4 rounded-lg border transition-all duration-300 ${
                achievement.earned
                  ? 'bg-[#FDDA00]/10 border-[#FDDA00]/50'
                  : 'bg-gray-800/50 border-gray-700'
              }`}
            >
              <div className={`p-2 rounded-lg w-fit mb-3 ${
                achievement.earned ? 'bg-[#FDDA00]/20 text-[#FDDA00]' : 'bg-gray-700 text-gray-500'
              }`}>
                {achievement.icon}
              </div>
              <h3 className={`font-medium mb-1 ${
                achievement.earned ? 'text-white' : 'text-gray-500'
              }`}>
                {achievement.title}
              </h3>
              <p className={`text-sm ${
                achievement.earned ? 'text-gray-300' : 'text-gray-600'
              }`}>
                {achievement.description}
              </p>
            </motion.div>
          ))}
        </div>
      </motion.div>
    </div>
  )
}
