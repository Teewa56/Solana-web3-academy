
import { Navbar, Hero, Features, About, CTA, Contact, Footer } from './components'

function App() {
  return (
    <div className="min-h-screen bg-black text-white overflow-x-hidden">
      <Navbar />
      <Hero />
      <Features />
      <About />
      <CTA />
      <Contact />
      <Footer />
    </div>
  )
}

export default App
