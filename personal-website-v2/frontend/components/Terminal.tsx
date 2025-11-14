import { useState, useEffect, useRef } from 'react'
import { motion } from 'framer-motion'

interface Command {
  input: string
  output: string | JSX.Element
  type?: 'command' | 'info' | 'error'
}

const AVAILABLE_COMMANDS = [
  { cmd: 'help', desc: 'Show available commands' },
  { cmd: 'about', desc: 'Learn about Edson' },
  { cmd: 'experience', desc: 'View work experience' },
  { cmd: 'skills', desc: 'View technical skills' },
  { cmd: 'projects', desc: 'Explore projects' },
  { cmd: 'resume', desc: 'Download resume' },
  { cmd: 'contact', desc: 'Get in touch' },
  { cmd: 'clear', desc: 'Clear terminal' },
]

const WELCOME_ASCII = `
╔═══════════════════════════════════════════════════════════════╗
║                                                               ║
║   ███████╗██████╗ ███████╗ ██████╗ ███╗   ██╗                ║
║   ██╔════╝██╔══██╗██╔════╝██╔═══██╗████╗  ██║                ║
║   █████╗  ██║  ██║███████╗██║   ██║██╔██╗ ██║                ║
║   ██╔══╝  ██║  ██║╚════██║██║   ██║██║╚██╗██║                ║
║   ███████╗██████╔╝███████║╚██████╔╝██║ ╚████║                ║
║   ╚══════╝╚═════╝ ╚══════╝ ╚═════╝ ╚═╝  ╚═══╝                ║
║                                                               ║
║   Senior GenAI/MLOps Engineer                                ║
║   AI Infrastructure | LLMs | Cloud Architecture              ║
║                                                               ║
╚═══════════════════════════════════════════════════════════════╝

Type 'help' to see available commands or click on sections below.
`

interface TerminalProps {
  onNavigate?: (section: string) => void
}

export default function Terminal({ onNavigate }: TerminalProps) {
  const [history, setHistory] = useState<Command[]>([])
  const [input, setInput] = useState('')
  const [commandIndex, setCommandIndex] = useState(-1)
  const inputRef = useRef<HTMLInputElement>(null)
  const terminalRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    // Show welcome message on mount
    setHistory([
      {
        input: '',
        output: WELCOME_ASCII,
        type: 'info',
      },
    ])
  }, [])

  useEffect(() => {
    // Auto-scroll to bottom
    if (terminalRef.current) {
      terminalRef.current.scrollTop = terminalRef.current.scrollHeight
    }
  }, [history])

  const executeCommand = (cmd: string) => {
    const trimmedCmd = cmd.trim().toLowerCase()

    let output: string | JSX.Element = ''
    let type: 'command' | 'info' | 'error' = 'command'

    switch (trimmedCmd) {
      case 'help':
        output = (
          <div className="space-y-2">
            <p className="text-neural-green">Available Commands:</p>
            {AVAILABLE_COMMANDS.map((c, i) => (
              <div key={i} className="flex gap-4">
                <span className="text-neural-blue font-mono w-32">{c.cmd}</span>
                <span className="text-gray-300">{c.desc}</span>
              </div>
            ))}
          </div>
        )
        type = 'info'
        break

      case 'about':
        output = (
          <div className="space-y-2">
            <p className="text-neural-blue font-semibold">Edson Zandamela</p>
            <p className="text-gray-300">
              Senior AI Infrastructure Engineer with 5+ years scaling GPU and ML/GenAI
              platforms for LLM workloads across biotech and big tech.
            </p>
            <p className="text-gray-300">
              Currently working at Apple via Advantis Global, optimizing GPU infrastructure
              and evaluating Apple Foundation Models.
            </p>
            <p className="text-gray-300 mt-2">
              <span className="text-neural-green">Location:</span> Laurel, MD<br />
              <span className="text-neural-green">Education:</span> MSc Computer Science (ML) - Georgia Tech
            </p>
          </div>
        )
        type = 'info'
        break

      case 'experience':
        output = (
          <div className="space-y-3">
            <div>
              <p className="text-neural-blue font-semibold">Apple Inc. - Platform Infrastructure Engineer</p>
              <p className="text-gray-400 text-sm">Apr 2025 - Present</p>
              <p className="text-gray-300 text-sm">
                Optimizing GPU infrastructure for LLM workloads, saved $1.2M+ annually
              </p>
            </div>
            <div>
              <p className="text-neural-blue font-semibold">Arcaea - DevOps Engineer</p>
              <p className="text-gray-400 text-sm">Aug 2023 - Mar 2025</p>
              <p className="text-gray-300 text-sm">
                Built enterprise AI platform with RAG, reduced costs by 90%
              </p>
            </div>
            <div>
              <p className="text-neural-blue font-semibold">Anagenex - Software Engineer</p>
              <p className="text-gray-400 text-sm">Aug 2021 - Aug 2023</p>
              <p className="text-gray-300 text-sm">
                Developed ML pipelines for drug discovery
              </p>
            </div>
          </div>
        )
        type = 'info'
        break

      case 'skills':
        output = (
          <div className="space-y-2">
            <div>
              <p className="text-neural-green font-semibold">Generative AI:</p>
              <p className="text-gray-300 text-sm">
                LLMs (OpenAI, Claude, Apple FM), RAG, LangChain, Vector DBs, Fine-Tuning
              </p>
            </div>
            <div>
              <p className="text-neural-green font-semibold">Cloud & Infrastructure:</p>
              <p className="text-gray-300 text-sm">
                AWS, Kubernetes, Terraform, Docker, Prometheus/Grafana
              </p>
            </div>
            <div>
              <p className="text-neural-green font-semibold">Software Development:</p>
              <p className="text-gray-300 text-sm">
                Python, FastAPI, JavaScript, REST APIs, CI/CD
              </p>
            </div>
          </div>
        )
        type = 'info'
        break

      case 'projects':
        output = (
          <div className="space-y-2">
            <p className="text-neural-green">Featured Projects:</p>
            <p className="text-gray-300">
              • AI Learning Hub LLC - Bilingual AI education platform<br />
              • Enterprise RAG System - LangChain + Weaviate for biotech R&D<br />
              • Girls Can Code Club - Remote coding education initiative
            </p>
          </div>
        )
        type = 'info'
        break

      case 'resume':
        output = 'Opening resume...'
        type = 'info'
        setTimeout(() => {
          window.open(process.env.NEXT_PUBLIC_RESUME_PDF || '/resume.pdf', '_blank')
        }, 500)
        break

      case 'contact':
        output = (
          <div className="space-y-2">
            <p className="text-neural-green">Contact Information:</p>
            <p className="text-gray-300">
              Email: <a href="mailto:edsonaguiar17@gmail.com" className="text-neural-blue hover:underline">
                edsonaguiar17@gmail.com
              </a>
            </p>
            <p className="text-gray-300">
              LinkedIn: <a href="https://linkedin.com/in/edsonzandamela" target="_blank" rel="noopener noreferrer" className="text-neural-blue hover:underline">
                linkedin.com/in/edsonzandamela
              </a>
            </p>
            <p className="text-gray-300">
              GitHub: <a href="https://github.com/edsna" target="_blank" rel="noopener noreferrer" className="text-neural-blue hover:underline">
                github.com/edsna
              </a>
            </p>
          </div>
        )
        type = 'info'
        break

      case 'clear':
        setHistory([])
        return

      case '':
        return

      default:
        output = `Command not found: ${trimmedCmd}. Type 'help' for available commands.`
        type = 'error'
    }

    setHistory((prev) => [
      ...prev,
      {
        input: cmd,
        output,
        type,
      },
    ])
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!input.trim()) return

    executeCommand(input)
    setInput('')
    setCommandIndex(-1)
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    // Command history navigation
    const commandHistory = history.filter((h) => h.input).map((h) => h.input)

    if (e.key === 'ArrowUp') {
      e.preventDefault()
      if (commandHistory.length > 0) {
        const newIndex = commandIndex + 1
        if (newIndex < commandHistory.length) {
          setCommandIndex(newIndex)
          setInput(commandHistory[commandHistory.length - 1 - newIndex])
        }
      }
    } else if (e.key === 'ArrowDown') {
      e.preventDefault()
      const newIndex = commandIndex - 1
      if (newIndex >= 0) {
        setCommandIndex(newIndex)
        setInput(commandHistory[commandHistory.length - 1 - newIndex])
      } else {
        setCommandIndex(-1)
        setInput('')
      }
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="w-full max-w-4xl mx-auto glass-strong rounded-lg p-6 font-mono text-sm shadow-2xl"
    >
      {/* Terminal Header */}
      <div className="flex items-center gap-2 mb-4 pb-2 border-b border-neural-blue/30">
        <div className="flex gap-2">
          <div className="w-3 h-3 rounded-full bg-red-500"></div>
          <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
          <div className="w-3 h-3 rounded-full bg-green-500"></div>
        </div>
        <span className="text-gray-400 ml-4">edson@portfolio:~$</span>
      </div>

      {/* Terminal Output */}
      <div
        ref={terminalRef}
        className="h-96 overflow-y-auto mb-4 scrollbar-thin scrollbar-thumb-neural-blue scrollbar-track-transparent"
      >
        {history.map((item, index) => (
          <div key={index} className="mb-3">
            {item.input && (
              <div className="flex gap-2 text-neural-green">
                <span>$</span>
                <span>{item.input}</span>
              </div>
            )}
            {item.output && (
              <div className={`ml-4 mt-1 ${item.type === 'error' ? 'text-red-400' : ''}`}>
                {typeof item.output === 'string' ? (
                  <pre className="whitespace-pre-wrap font-mono">{item.output}</pre>
                ) : (
                  item.output
                )}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Terminal Input */}
      <form onSubmit={handleSubmit} className="flex gap-2 items-center">
        <span className="text-neural-green">$</span>
        <input
          ref={inputRef}
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          className="flex-1 bg-transparent border-none outline-none text-white font-mono"
          placeholder="Type a command... (try 'help')"
          autoFocus
        />
        <span className="terminal-cursor"></span>
      </form>
    </motion.div>
  )
}
