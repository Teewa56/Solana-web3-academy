export default function Background() {
  return (
    <div className="pointer-events-none fixed inset-0 -z-10">
      <div className="absolute inset-0 bg-black" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(253,218,0,0.08),transparent_55%)]" />
      <div className="absolute top-20 left-20 w-32 h-32 bg-[#FDDA00] rounded-full blur-3xl opacity-20" />
      <div className="absolute bottom-20 right-20 w-48 h-48 bg-[#FDDA00] rounded-full blur-3xl opacity-15" />
    </div>
  )
}


