import { useState, useEffect } from 'react'
import { NavigationProvider } from './contexts/NavigationContext'
import { Navbar, Hero, Features, About, CTA, Contact, Footer } from './components'
import DashboardLayout from './components/layout/DashboardLayout'
import Login from './pages/auth/Login'
import Register from './pages/auth/Register'
import EmailVerification from './pages/auth/EmailVerification'
import Dashboard from './pages/dashboard/Dashboard'

function App() {
  const [currentPage, setCurrentPage] = useState('home')

  useEffect(() => {
    const handleRouteChange = () => {
      const path = window.location.pathname
      switch (path) {
        case '/login':
          setCurrentPage('login')
          break
        case '/register':
        case '/signup':
          setCurrentPage('register')
          break
        case '/verify-email':
          setCurrentPage('verify-email')
          break
        case '/dashboard':
          setCurrentPage('dashboard')
          break
        default:
          setCurrentPage('home')
      }
    }

    // Handle initial route
    handleRouteChange()

    // Listen for browser back/forward
    window.addEventListener('popstate', handleRouteChange)
    return () => window.removeEventListener('popstate', handleRouteChange)
  }, [])

  const renderPage = () => {
    switch (currentPage) {
      case 'login':
        return <Login />
      case 'register':
        return <Register />
      case 'verify-email':
        return <EmailVerification />
      case 'dashboard':
        return (
          <DashboardLayout>
            <Dashboard />
          </DashboardLayout>
        )
      default:
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
  }

  const navigate = (path: string) => {
    window.history.pushState({}, '', path)
    setCurrentPage(path === '/' ? 'home' : path.substring(1))
  }

  return (
    <NavigationProvider currentPage={currentPage} navigate={navigate}>
      {renderPage()}
    </NavigationProvider>
  )
}

export default App