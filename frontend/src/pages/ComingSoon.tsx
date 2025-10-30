export default function ComingSoon() {
  return (
    <div className="min-h-screen bg-black text-white flex items-center justify-center px-4">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(253,218,0,0.08),transparent_55%)]" />
      <div className="relative z-10 text-center max-w-2xl">
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-[#FDDA00]/30 bg-[#FDDA00]/10 backdrop-blur-sm mb-6">
          <span className="text-sm text-[#FDDA00]">Orion Academy</span>
        </div>
        <h1 className="text-5xl md:text-7xl font-semibold">Coming Soon</h1>
        <p className="text-gray-400 mt-4">We’re preparing something stellar. Check back shortly.</p>
        <a href="/" className="inline-block mt-10 px-6 py-3 rounded-lg border border-[#FDDA00]/40 text-[#FDDA00] hover:bg-[#FDDA00]/10">Back to Home</a>
      </div>
    </div>
  )
}


