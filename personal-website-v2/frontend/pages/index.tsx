import { useState, useEffect } from 'react'
import Head from 'next/head'
import dynamic from 'next/dynamic'
import { motion } from 'framer-motion'
import Navigation from '@/components/Navigation'
import Terminal from '@/components/Terminal'
import Experience from '@/components/Experience'
import Skills from '@/components/Skills'
import Certifications from '@/components/Certifications'
import Portfolio from '@/components/Portfolio'
import ConsultingServices from '@/components/ConsultingServices'
import ContactForm from '@/components/ContactForm'
import { achievements, initiatives } from '@/data/profile'
import Link from 'next/link'

// Dynamically import Three.js components (client-side only)
const NeuralBackground = dynamic(() => import('@/components/NeuralBackground'), {
  ssr: false,
})

export default function Home() {
  const [activeSection, setActiveSection] = useState('home')

  // Track active section on scroll
  useEffect(() => {
    const handleScroll = () => {
      const sections = ['home', 'experience', 'skills', 'certifications', 'consulting', 'portfolio', 'contact']
      const scrollPosition = window.scrollY + 200

      for (const section of sections) {
        const element = document.getElementById(section)
        if (element) {
          const { offsetTop, offsetHeight } = element
          if (scrollPosition >= offsetTop && scrollPosition < offsetTop + offsetHeight) {
            setActiveSection(section)
            break
          }
        }
      }
    }

    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  return (
    <>
      <Head>
        <title>Edson Zandamela - GenAI/MLOps Engineer</title>
        <meta
          name="description"
          content="Senior AI Infrastructure Engineer specializing in LLMs, RAG systems, and scalable cloud platforms. Currently at Apple."
        />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>

      {/* Neural Network Particle Background */}
      <NeuralBackground />

      {/* Navigation */}
      <Navigation activeSection={activeSection} onNavigate={setActiveSection} />

      <main className="min-h-screen relative">
        {/* Hero Section */}
        <section id="home" className="min-h-screen flex flex-col items-center justify-center px-4 py-12 pt-24">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8 }}
            className="text-center mb-12"
          >
            <h1 className="text-5xl md:text-7xl lg:text-8xl font-bold text-glow-blue mb-4">
              EDSON ZANDAMELA
            </h1>
            <p className="text-xl md:text-2xl text-neural-blue font-mono">
              Senior GenAI/MLOps Engineer
            </p>
            <p className="text-lg text-gray-400 mt-2">
              AI Infrastructure • LLMs • Cloud Architecture
            </p>
          </motion.div>

          <Terminal onNavigate={setActiveSection} />

          {/* Quick Links */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="mt-8 flex flex-wrap gap-4 justify-center"
          >
            <a
              href={process.env.NEXT_PUBLIC_RESUME_PDF || '/resume.pdf'}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-primary"
            >
              Download Resume
            </a>
            <a
              href={process.env.NEXT_PUBLIC_CALENDAR_LINK || '#'}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-secondary"
            >
              Schedule a Call
            </a>
            <Link href="/chat" className="btn-terminal">
              Chat with Minion 🤖
            </Link>
          </motion.div>

          {/* Achievement Stats */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.5 }}
            className="mt-12 grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6 max-w-4xl"
          >
            {achievements.map((achievement) => (
              <div key={achievement.label} className="text-center glass-strong rounded-lg p-4">
                <p className="text-2xl md:text-3xl font-bold text-neural-blue">{achievement.value}</p>
                <p className="text-gray-400 text-xs md:text-sm mt-1">{achievement.label}</p>
              </div>
            ))}
          </motion.div>
        </section>

        {/* About Section - Brief */}
        <section className="py-16 px-4">
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="max-w-5xl mx-auto glass-strong rounded-lg p-8 md:p-12"
          >
            <h2 className="text-3xl md:text-4xl font-bold text-neural-blue mb-6">
              About Me
            </h2>
            <div className="space-y-4 text-gray-300 text-lg leading-relaxed">
              <p>
                I'm a <span className="text-neural-green font-semibold">Senior AI Infrastructure Engineer</span> with{' '}
                <span className="text-neural-blue">5+ years</span> of experience scaling GPU and ML/GenAI
                platforms for LLM workloads across biotech and big tech.
              </p>
              <p>
                Currently at <span className="text-neural-blue font-semibold">Apple Inc.</span>, I optimize
                GPU infrastructure for internal LLM workloads, processing 150K+ events and identifying{' '}
                <span className="text-neural-green">$1.2M+ in annualized cost savings</span>.
              </p>
              <p>
                Previously, I architected enterprise AI platforms with RAG systems at{' '}
                <span className="text-neural-blue">Arcaea</span>, improving R&D efficiency by 30% and
                reducing cloud costs by 90%.
              </p>
              <p className="text-neural-green">
                Passionate about the intersection of AI, cloud infrastructure, and developer experience.
                Fluent in English and Portuguese.
              </p>
            </div>

            {/* Initiatives */}
            <div className="mt-8 grid md:grid-cols-2 gap-4">
              {initiatives.map((initiative) => (
                <div key={initiative.name} className="bg-neural-blue/10 rounded-lg p-4">
                  <span className="text-xs text-neural-green font-semibold">{initiative.type}</span>
                  <h4 className="text-white font-bold mt-1">{initiative.name}</h4>
                  <p className="text-gray-400 text-sm mt-1">{initiative.description}</p>
                </div>
              ))}
            </div>
          </motion.div>
        </section>

        {/* Experience Section */}
        <section id="experience" className="py-16 px-4">
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="max-w-5xl mx-auto"
          >
            <Experience />
          </motion.div>
        </section>

        {/* Skills Section */}
        <section id="skills" className="py-16 px-4 bg-gradient-neural">
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="max-w-6xl mx-auto"
          >
            <Skills />
          </motion.div>
        </section>

        {/* Certifications Section */}
        <section id="certifications" className="py-16 px-4">
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="max-w-6xl mx-auto"
          >
            <Certifications />
          </motion.div>
        </section>

        {/* Consulting Services Section */}
        <section id="consulting" className="py-16 px-4 bg-gradient-neural">
          <div className="max-w-7xl mx-auto">
            <ConsultingServices language="en" />
          </div>
        </section>

        {/* Portfolio Section */}
        <section id="portfolio" className="py-16 px-4">
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="max-w-6xl mx-auto"
          >
            <Portfolio />
          </motion.div>
        </section>

        {/* Chat CTA Section */}
        <section className="py-16 px-4 bg-gradient-neural">
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="max-w-3xl mx-auto text-center"
          >
            <h2 className="text-3xl md:text-4xl font-bold text-neural-blue mb-4">
              Want to Know More?
            </h2>
            <p className="text-gray-400 mb-8">
              Chat with my AI assistant to learn more about my experience, skills, and how I can help your team.
            </p>
            <Link
              href="/chat"
              className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-neural-green to-neural-blue rounded-lg text-white font-medium hover:opacity-90 transition-opacity"
            >
              <span className="text-xl">🤖</span>
              Chat with Edson's Minion
            </Link>
          </motion.div>
        </section>

        {/* Contact Section */}
        <section id="contact" className="py-16 px-4">
          <ContactForm language="en" />
        </section>

        {/* Footer */}
        <footer className="py-12 px-4 border-t border-neural-blue/30">
          <div className="max-w-5xl mx-auto">
            <div className="flex flex-col md:flex-row justify-between items-center gap-6">
              <div className="text-center md:text-left">
                <p className="text-neural-blue font-semibold text-lg">Edson Zandamela</p>
                <p className="text-gray-400 text-sm">
                  Senior GenAI/MLOps Engineer
                </p>
              </div>

              <div className="flex gap-6">
                <a
                  href="https://linkedin.com/in/edsonzandamela"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-gray-400 hover:text-neural-blue transition-colors"
                >
                  LinkedIn
                </a>
                <a
                  href="https://github.com/edsna"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-gray-400 hover:text-neural-blue transition-colors"
                >
                  GitHub
                </a>
                <a
                  href="mailto:edsonaguiar17@gmail.com"
                  className="text-gray-400 hover:text-neural-blue transition-colors"
                >
                  Email
                </a>
              </div>
            </div>

            <div className="mt-8 text-center text-gray-500 text-sm">
              <p>© 2025 Edson Zandamela. Built with Next.js, Three.js, and GenAI</p>
            </div>
          </div>
        </footer>
      </main>
    </>
  )
}
