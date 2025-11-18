import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Link from 'next/link'
import { useRouter } from 'next/router'

interface NavItem {
  id: string
  label: string
  href?: string
  onClick?: () => void
}

interface NavigationProps {
  activeSection: string
  onNavigate: (section: string) => void
}

export default function Navigation({ activeSection, onNavigate }: NavigationProps) {
  const [isScrolled, setIsScrolled] = useState(false)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const router = useRouter()

  const navItems: NavItem[] = [
    { id: 'home', label: 'Home' },
    { id: 'experience', label: 'Experience' },
    { id: 'skills', label: 'Skills' },
    { id: 'certifications', label: 'Certifications' },
    { id: 'consulting', label: 'Consulting' },
    { id: 'portfolio', label: 'Portfolio' },
    { id: 'contact', label: 'Contact' },
  ]

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50)
    }
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const handleNavClick = (id: string) => {
    onNavigate(id)
    setIsMobileMenuOpen(false)

    // Smooth scroll to section
    const element = document.getElementById(id)
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' })
    }
  }

  return (
    <>
      {/* Main Navigation Bar */}
      <motion.nav
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          isScrolled ? 'glass-strong shadow-lg' : 'bg-transparent'
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <Link href="/" className="flex items-center space-x-2">
              <span className="text-2xl font-bold text-neural-blue">EZ</span>
              <span className="hidden sm:block text-gray-300 text-sm">Edson Zandamela</span>
            </Link>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center space-x-1">
              {navItems.map((item) => (
                <button
                  key={item.id}
                  onClick={() => handleNavClick(item.id)}
                  className={`px-3 py-2 rounded-md text-sm font-medium transition-all duration-200 ${
                    activeSection === item.id
                      ? 'text-neural-blue bg-neural-blue/10'
                      : 'text-gray-300 hover:text-neural-blue hover:bg-neural-blue/5'
                  }`}
                >
                  {item.label}
                </button>
              ))}

              {/* Chat with Minion - Special Button */}
              <Link
                href="/chat"
                className="ml-4 px-4 py-2 bg-gradient-to-r from-neural-green to-neural-blue rounded-md text-white text-sm font-medium hover:opacity-90 transition-opacity"
              >
                Chat with Minion
              </Link>
            </div>

            {/* Mobile menu button */}
            <div className="md:hidden flex items-center">
              <Link
                href="/chat"
                className="mr-4 px-3 py-1.5 bg-neural-green/20 rounded-md text-neural-green text-xs font-medium"
              >
                Chat
              </Link>
              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="p-2 rounded-md text-gray-300 hover:text-neural-blue"
              >
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  {isMobileMenuOpen ? (
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  ) : (
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                  )}
                </svg>
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Navigation Menu */}
        <AnimatePresence>
          {isMobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="md:hidden glass-strong border-t border-neural-blue/20"
            >
              <div className="px-4 py-3 space-y-1">
                {navItems.map((item) => (
                  <button
                    key={item.id}
                    onClick={() => handleNavClick(item.id)}
                    className={`block w-full text-left px-3 py-2 rounded-md text-sm font-medium ${
                      activeSection === item.id
                        ? 'text-neural-blue bg-neural-blue/10'
                        : 'text-gray-300 hover:text-neural-blue'
                    }`}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.nav>

      {/* Section indicator tabs (visible when scrolled) */}
      {isScrolled && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="fixed bottom-6 left-1/2 transform -translate-x-1/2 z-40 hidden lg:flex"
        >
          <div className="glass-strong rounded-full px-4 py-2 flex items-center space-x-2">
            {navItems.map((item) => (
              <button
                key={item.id}
                onClick={() => handleNavClick(item.id)}
                className={`w-2 h-2 rounded-full transition-all duration-200 ${
                  activeSection === item.id
                    ? 'w-6 bg-neural-blue'
                    : 'bg-gray-500 hover:bg-neural-blue/50'
                }`}
                title={item.label}
              />
            ))}
          </div>
        </motion.div>
      )}
    </>
  )
}
