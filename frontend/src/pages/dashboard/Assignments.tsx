import { motion } from 'framer-motion'
import { FileText, Clock, CheckCircle, AlertCircle, Calendar } from 'lucide-react'

export default function Assignments() {
  const assignments = [
    {
      id: '1',
      title: 'Smart Contract Security Audit',
      course: 'Smart Contract Security',
      dueDate: '2024-01-15',
      status: 'pending',
      priority: 'high',
      description: 'Perform a comprehensive security audit of the provided smart contract',
      points: 100
    },
    {
      id: '2',
      title: 'DeFi Protocol Analysis',
      course: 'DeFi Protocols',
      dueDate: '2024-01-20',
      status: 'in-progress',
      priority: 'medium',
      description: 'Analyze and document the architecture of a DeFi protocol',
      points: 80
    },
    {
      id: '3',
      title: 'NFT Marketplace Implementation',
      course: 'NFT Development',
      dueDate: '2024-01-10',
      status: 'completed',
      priority: 'low',
      description: 'Build a complete NFT marketplace using Solana',
      points: 150
    }
  ]

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="w-5 h-5 text-green-400" />
      case 'in-progress':
        return <Clock className="w-5 h-5 text-[#FDDA00]" />
      case 'pending':
        return <AlertCircle className="w-5 h-5 text-red-400" />
      default:
        return <FileText className="w-5 h-5 text-gray-400" />
    }
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'text-red-400 bg-red-400/20'
      case 'medium':
        return 'text-[#FDDA00] bg-[#FDDA00]/20'
      case 'low':
        return 'text-green-400 bg-green-400/20'
      default:
        return 'text-gray-400 bg-gray-400/20'
    }
  }

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
          <h1 className="text-3xl font-bold text-white mb-2">Assignments</h1>
          <p className="text-gray-400">Track your assignment progress and deadlines</p>
        </div>
        <div className="flex gap-3">
          <button className="px-4 py-2 border border-gray-600 text-gray-300 rounded-lg hover:border-[#FDDA00] hover:text-[#FDDA00] transition-colors">
            Filter
          </button>
          <button className="px-6 py-3 bg-[#FDDA00] text-black rounded-lg font-medium hover:bg-[#FDDA00]/80 transition-colors">
            New Assignment
          </button>
        </div>
      </motion.div>

      {/* Assignments List */}
      <div className="space-y-4">
        {assignments.map((assignment, index) => (
          <motion.div
            key={assignment.id}
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.6, delay: index * 0.1 }}
            className="bg-gray-900/50 backdrop-blur-sm border border-gray-800 rounded-xl p-6 hover:border-[#FDDA00]/50 transition-all duration-300"
          >
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-start gap-4">
                <div className="p-3 bg-gray-800 rounded-lg">
                  {getStatusIcon(assignment.status)}
                </div>
                <div>
                  <h3 className="text-xl font-bold text-white mb-1">{assignment.title}</h3>
                  <p className="text-gray-400 mb-2">{assignment.course}</p>
                  <p className="text-gray-500 text-sm">{assignment.description}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <span className={`px-3 py-1 rounded-full text-xs font-medium ${getPriorityColor(assignment.priority)}`}>
                  {assignment.priority}
                </span>
                <span className="text-[#FDDA00] font-bold">{assignment.points} pts</span>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-6">
                <div className="flex items-center gap-2 text-gray-400">
                  <Calendar className="w-4 h-4" />
                  <span className="text-sm">Due: {assignment.dueDate}</span>
                </div>
                <div className="flex items-center gap-2 text-gray-400">
                  <FileText className="w-4 h-4" />
                  <span className="text-sm">Assignment</span>
                </div>
              </div>
              <div className="flex gap-3">
                {assignment.status === 'completed' ? (
                  <button className="px-4 py-2 bg-green-500/20 text-green-400 border border-green-500/30 rounded-lg hover:bg-green-500/30 transition-colors">
                    View Submission
                  </button>
                ) : assignment.status === 'in-progress' ? (
                  <button className="px-4 py-2 bg-[#FDDA00] text-black rounded-lg hover:bg-[#FDDA00]/80 transition-colors">
                    Continue
                  </button>
                ) : (
                  <button className="px-4 py-2 bg-blue-500/20 text-blue-400 border border-blue-500/30 rounded-lg hover:bg-blue-500/30 transition-colors">
                    Start Assignment
                  </button>
                )}
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  )
}
