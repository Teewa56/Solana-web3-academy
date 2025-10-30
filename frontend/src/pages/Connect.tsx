import { useState } from 'react'
import { motion } from 'framer-motion'
import { CheckCircle2, Wallet, Send, Book, Twitter } from 'lucide-react'
import { useNavigation } from '../contexts/NavigationContext'

type ConnectorKey = 'x' | 'discord' | 'telegram' | 'wallet'

export default function Connect() {
  const { navigate } = useNavigation()
  const [connected, setConnected] = useState<Record<ConnectorKey, boolean>>({
    x: false,
    discord: false,
    telegram: false,
    wallet: false
  })

  const allOptional = false
  const minComplete = 1
  const completionCount = Object.values(connected).filter(Boolean).length
  const canContinue = allOptional || completionCount >= minComplete

  const toggle = (k: ConnectorKey) => setConnected(prev => ({ ...prev, [k]: !prev[k] }))

  return (
    <div className="min-h-screen text-white px-4 py-16 flex items-center justify-center">

      <div className="relative z-10 w-full max-w-3xl">
        <div className="text-center mb-10">
          <h1 className="text-3xl font-semibold">Complete your setup</h1>
          <p className="text-gray-400 mt-2">Connect your socials and wallet for the best experience.</p>
        </div>

        <div className="space-y-4">
          <ConnectTile
            title="Connect X handle"
            description="Link your X account to personalize updates."
            icon={<Twitter className="w-5 h-5" />}
            checked={connected.x}
            onPress={() => toggle('x')}
          />
          <ConnectTile
            title="Connect Discord"
            description="Join the community and unlock role-based channels."
            icon={<Book className="w-5 h-5 rotate-90" />}
            checked={connected.discord}
            onPress={() => toggle('discord')}
          />
          <ConnectTile
            title="Connect Telegram"
            description="Get announcements right in Telegram."
            icon={<Send className="w-5 h-5" />}
            checked={connected.telegram}
            onPress={() => toggle('telegram')}
          />
          <ConnectTile
            title="Import wallet"
            description="Connect Phantom or any supported wallet."
            icon={<Wallet className="w-5 h-5" />}
            checked={connected.wallet}
            onPress={() => toggle('wallet')}
          />
        </div>

        <motion.button
          whileHover={{ scale: canContinue ? 1.02 : 1 }}
          whileTap={{ scale: canContinue ? 0.98 : 1 }}
          disabled={!canContinue}
          onClick={() => navigate('/coming-soon')}
          className={`w-full mt-8 px-6 py-4 rounded-lg font-semibold transition ${
            canContinue
              ? 'bg-gradient-to-r from-[#FDDA00] to-yellow-400 text-black'
              : 'bg-white/5 text-gray-500 cursor-not-allowed border border-white/10'
          }`}
        >
          Continue
        </motion.button>

        <button
          onClick={() => navigate('/')}
          className="block w-full text-center mt-3 text-gray-400 hover:text-[#FDDA00]"
        >
          Do this later
        </button>
      </div>
    </div>
  )
}

function ConnectTile({
  title,
  description,
  icon,
  checked,
  onPress
}: {
  title: string
  description: string
  icon: React.ReactNode
  checked: boolean
  onPress: () => void
}) {
  return (
    <motion.button
      onClick={onPress}
      whileHover={{ y: -2 }}
      className={`w-full text-left p-5 rounded-xl border backdrop-blur-xl transition flex items-center justify-between ${
        checked
          ? 'bg-[#FDDA00]/10 border-[#FDDA00]/40'
          : 'bg-white/5 border-white/10 hover:border-[#FDDA00]/30'
      }`}
    >
      <div className="flex items-center gap-4">
        <div className="w-10 h-10 rounded-lg bg-white/10 flex items-center justify-center text-[#FDDA00]">
          {icon}
        </div>
        <div>
          <div className="font-medium">{title}</div>
          <div className="text-sm text-gray-400">{description}</div>
        </div>
      </div>
      {checked && <CheckCircle2 className="w-5 h-5 text-[#FDDA00]" />}
    </motion.button>
  )
}


