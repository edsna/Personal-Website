import { useState } from 'react'
import Head from 'next/head'
import dynamic from 'next/dynamic'
import { motion } from 'framer-motion'
import Terminal from '@/components/Terminal'

// Dynamically import Three.js components (client-side only)
const NeuralBackground = dynamic(() => import('@/components/NeuralBackground'), {
  ssr: false,
})

export default function Home() {
  const [activeSection, setActiveSection] = useState('terminal')

  return (
    <>
      <Head>
        <title>Edson Zandamela - GenAI/MLOps Engineer</title>
        <meta
          name="description"
          content="Senior AI Infrastructure Engineer specializing in LLMs, RAG systems, and scalable cloud platforms"
        />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>

      {/* Neural Network Particle Background */}
      <NeuralBackground />

      <main className="min-h-screen relative">
        {/* Hero Section with Terminal */}
        <section className="min-h-screen flex flex-col items-center justify-center px-4 py-12">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8 }}
            className="text-center mb-12"
          >
            <h1 className="text-6xl md:text-8xl font-bold text-glow-blue mb-4">
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
            <button
              onClick={() => {
                const chatSection = document.getElementById('chat')
                chatSection?.scrollIntoView({ behavior: 'smooth' })
              }}
              className="btn-terminal"
            >
              Talk to Edson's Minion
            </button>
          </motion.div>
        </section>

        {/* About Section */}
        <section className="min-h-screen flex items-center justify-center px-4 py-12">
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="max-w-5xl w-full glass-strong rounded-lg p-8 md:p-12"
          >
            <h2 className="text-4xl font-bold text-neural-blue mb-6">
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

            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mt-12">
              <div className="text-center">
                <p className="text-4xl font-bold text-neural-blue">5+</p>
                <p className="text-gray-400 text-sm mt-2">Years Experience</p>
              </div>
              <div className="text-center">
                <p className="text-4xl font-bold text-neural-green">$1.2M+</p>
                <p className="text-gray-400 text-sm mt-2">Cost Savings</p>
              </div>
              <div className="text-center">
                <p className="text-4xl font-bold text-neural-purple">90%</p>
                <p className="text-gray-400 text-sm mt-2">Cloud Cost Reduction</p>
              </div>
              <div className="text-center">
                <p className="text-4xl font-bold text-neural-blue">20+</p>
                <p className="text-gray-400 text-sm mt-2">AI Certifications</p>
              </div>
            </div>
          </motion.div>
        </section>

        {/* Experience Timeline */}
        <section className="min-h-screen flex items-center justify-center px-4 py-12">
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="max-w-5xl w-full"
          >
            <h2 className="text-4xl font-bold text-neural-blue mb-12 text-center">
              Experience Journey
            </h2>

            <div className="space-y-8">
              {/* Apple */}
              <motion.div
                whileHover={{ scale: 1.02 }}
                className="glass-strong rounded-lg p-6 border-l-4 border-neural-blue"
              >
                <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-4">
                  <div>
                    <h3 className="text-2xl font-bold text-white">
                      Platform Infrastructure Engineer
                    </h3>
                    <p className="text-neural-blue font-semibold">Apple Inc.</p>
                  </div>
                  <p className="text-gray-400 text-sm">Apr 2025 - Present</p>
                </div>
                <ul className="space-y-2 text-gray-300">
                  <li className="flex gap-2">
                    <span className="text-neural-green">▸</span>
                    <span>Optimized GPU infrastructure for Apple's internal LLM workloads (Siri, Maps)</span>
                  </li>
                  <li className="flex gap-2">
                    <span className="text-neural-green">▸</span>
                    <span>Identified $1.2M+ in annualized cost savings across multiple Kubernetes clusters</span>
                  </li>
                  <li className="flex gap-2">
                    <span className="text-neural-green">▸</span>
                    <span>Evaluated Apple Foundation Models and GenAI platforms</span>
                  </li>
                </ul>
              </motion.div>

              {/* Arcaea */}
              <motion.div
                whileHover={{ scale: 1.02 }}
                className="glass-strong rounded-lg p-6 border-l-4 border-neural-green"
              >
                <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-4">
                  <div>
                    <h3 className="text-2xl font-bold text-white">DevOps Engineer</h3>
                    <p className="text-neural-green font-semibold">Arcaea</p>
                  </div>
                  <p className="text-gray-400 text-sm">Aug 2023 - Mar 2025</p>
                </div>
                <ul className="space-y-2 text-gray-300">
                  <li className="flex gap-2">
                    <span className="text-neural-green">▸</span>
                    <span>Architected enterprise AI platform using LLMs and RAG (20% efficiency gain)</span>
                  </li>
                  <li className="flex gap-2">
                    <span className="text-neural-green">▸</span>
                    <span>Reduced cloud costs by 90% through Kubernetes optimization</span>
                  </li>
                  <li className="flex gap-2">
                    <span className="text-neural-green">▸</span>
                    <span>Deployed scalable vector databases (Weaviate/Chroma) with LangChain</span>
                  </li>
                </ul>
              </motion.div>

              {/* Anagenex */}
              <motion.div
                whileHover={{ scale: 1.02 }}
                className="glass-strong rounded-lg p-6 border-l-4 border-neural-purple"
              >
                <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-4">
                  <div>
                    <h3 className="text-2xl font-bold text-white">
                      Software Engineer IT & DevOps
                    </h3>
                    <p className="text-neural-purple font-semibold">Anagenex</p>
                  </div>
                  <p className="text-gray-400 text-sm">Aug 2021 - Aug 2023</p>
                </div>
                <ul className="space-y-2 text-gray-300">
                  <li className="flex gap-2">
                    <span className="text-neural-green">▸</span>
                    <span>Developed ML pipelines for drug discovery on AWS</span>
                  </li>
                  <li className="flex gap-2">
                    <span className="text-neural-green">▸</span>
                    <span>Automated data workflows reducing manual tasks by 50%</span>
                  </li>
                  <li className="flex gap-2">
                    <span className="text-neural-green">▸</span>
                    <span>Built Flask-based internal tools for cross-functional teams</span>
                  </li>
                </ul>
              </motion.div>
            </div>
          </motion.div>
        </section>

        {/* Skills Section */}
        <section className="min-h-screen flex items-center justify-center px-4 py-12">
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="max-w-5xl w-full"
          >
            <h2 className="text-4xl font-bold text-neural-blue mb-12 text-center">
              Technical Skills
            </h2>

            <div className="grid md:grid-cols-2 gap-6">
              {/* Generative AI */}
              <div className="glass-strong rounded-lg p-6">
                <h3 className="text-2xl font-bold text-neural-green mb-4">Generative AI</h3>
                <div className="flex flex-wrap gap-2">
                  {['LLMs (OpenAI, Claude, Llama)', 'RAG', 'LangChain', 'LangGraph',
                    'Vector Databases', 'Fine-Tuning', 'Multi-Agent Systems', 'Transformers'].map((skill) => (
                    <span
                      key={skill}
                      className="px-3 py-1 bg-neural-green/20 text-neural-green rounded-full text-sm border border-neural-green/50"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              </div>

              {/* Cloud & Infrastructure */}
              <div className="glass-strong rounded-lg p-6">
                <h3 className="text-2xl font-bold text-neural-blue mb-4">
                  Cloud & Infrastructure
                </h3>
                <div className="flex flex-wrap gap-2">
                  {['AWS', 'Kubernetes', 'Terraform', 'Docker', 'EKS', 'S3', 'Lambda',
                    'Prometheus', 'Grafana'].map((skill) => (
                    <span
                      key={skill}
                      className="px-3 py-1 bg-neural-blue/20 text-neural-blue rounded-full text-sm border border-neural-blue/50"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              </div>

              {/* Software Development */}
              <div className="glass-strong rounded-lg p-6">
                <h3 className="text-2xl font-bold text-neural-purple mb-4">
                  Software Development
                </h3>
                <div className="flex flex-wrap gap-2">
                  {['Python', 'JavaScript', 'TypeScript', 'FastAPI', 'React', 'Next.js',
                    'REST APIs', 'Microservices'].map((skill) => (
                    <span
                      key={skill}
                      className="px-3 py-1 bg-neural-purple/20 text-neural-purple rounded-full text-sm border border-neural-purple/50"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              </div>

              {/* CI/CD & Automation */}
              <div className="glass-strong rounded-lg p-6">
                <h3 className="text-2xl font-bold text-neural-green mb-4">
                  CI/CD & Automation
                </h3>
                <div className="flex flex-wrap gap-2">
                  {['GitHub Actions', 'GitLab CI', 'ArgoCD', 'Helm', 'Jenkins',
                    'Bash', 'Python Scripts'].map((skill) => (
                    <span
                      key={skill}
                      className="px-3 py-1 bg-neural-green/20 text-neural-green rounded-full text-sm border border-neural-green/50"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        </section>

        {/* Chat Section Placeholder */}
        <section id="chat" className="min-h-screen flex items-center justify-center px-4 py-12">
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="max-w-3xl w-full glass-strong rounded-lg p-8 text-center"
          >
            <h2 className="text-4xl font-bold text-neural-blue mb-6">
              Edson's Minion 🤖
            </h2>
            <p className="text-gray-300 text-lg mb-8">
              AI-powered chatbot coming soon! Ask me anything about Edson's experience,
              skills, and projects.
            </p>
            <p className="text-sm text-gray-400">
              This feature will be available once the backend RAG system is deployed.
            </p>
          </motion.div>
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
              <p>© 2025 Edson Zandamela. Built with Next.js, Three.js, and GenAI ❤️</p>
            </div>
          </div>
        </footer>
      </main>
    </>
  )
}
