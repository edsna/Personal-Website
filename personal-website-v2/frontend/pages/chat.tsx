import { useState, useRef, useEffect } from 'react'
import Head from 'next/head'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import dynamic from 'next/dynamic'
import axios from 'axios'

const NeuralBackground = dynamic(() => import('@/components/NeuralBackground'), {
  ssr: false,
})

interface Message {
  id: string
  role: 'user' | 'assistant'
  content: string
  timestamp: Date
}

export default function ChatPage() {
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [tokensRemaining, setTokensRemaining] = useState(50)
  const [conversationId] = useState(() => Math.random().toString(36).substring(7))
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLTextAreaElement>(null)

  const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'

  const exampleQuestions = [
    "What's Edson's experience with LLMs and RAG systems?",
    "Tell me about Edson's work at Apple",
    "What cloud platforms has Edson worked with?",
    "What makes Edson unique as an AI engineer?",
    "What consulting services does Edson offer?",
    "What certifications does Edson have?",
  ]

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  useEffect(() => {
    // Welcome message
    setMessages([
      {
        id: '0',
        role: 'assistant',
        content: `🤖 **Hello! I'm Edson's Minion** - your AI guide to learning about Edson Zandamela.

I can answer questions about:
• **Career & Experience** - Work at Apple, Arcaea, Anagenex, and more
• **Technical Skills** - GenAI, MLOps, Cloud, Kubernetes
• **Education & Certifications** - Georgia Tech, AWS, K8s certs
• **Projects & Achievements** - $1.2M savings, 90% cost reduction

Ask me anything about Edson's professional background!`,
        timestamp: new Date(),
      },
    ])
  }, [])

  const sendMessage = async () => {
    if (!input.trim() || isLoading) return

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: input,
      timestamp: new Date(),
    }

    setMessages((prev) => [...prev, userMessage])
    setInput('')
    setIsLoading(true)

    try {
      const response = await axios.post(`${API_URL}/api/chat`, {
        message: input,
        conversation_id: conversationId,
        language: 'en',
      })

      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: response.data.response,
        timestamp: new Date(),
      }

      setMessages((prev) => [...prev, assistantMessage])
      setTokensRemaining(response.data.tokens_remaining || tokensRemaining - 1)
    } catch (error: any) {
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: error.response?.data?.detail ||
          "I apologize, but I'm having trouble connecting right now. Please try again in a moment.",
        timestamp: new Date(),
      }
      setMessages((prev) => [...prev, errorMessage])
    } finally {
      setIsLoading(false)
      inputRef.current?.focus()
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      sendMessage()
    }
  }

  return (
    <>
      <Head>
        <title>Chat with Edson's Minion | Edson Zandamela</title>
        <meta
          name="description"
          content="Chat with an AI assistant to learn about Edson Zandamela's career, skills, and experience"
        />
      </Head>

      <NeuralBackground />

      <div className="min-h-screen flex flex-col">
        {/* Header */}
        <header className="glass-strong border-b border-neural-blue/20 z-10">
          <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
            <Link href="/" className="flex items-center space-x-3">
              <svg className="w-5 h-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              <span className="text-gray-300 text-sm">Back to Portfolio</span>
            </Link>

            <div className="flex items-center space-x-4">
              <div className="text-right">
                <p className="text-neural-green text-xs">Tokens Remaining</p>
                <p className="text-white font-bold">{tokensRemaining}/50</p>
              </div>
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-neural-green to-neural-blue flex items-center justify-center">
                <span className="text-lg">🤖</span>
              </div>
            </div>
          </div>
        </header>

        {/* Main Chat Area */}
        <main className="flex-1 flex overflow-hidden">
          {/* Chat Panel */}
          <div className="flex-1 flex flex-col">
            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              <AnimatePresence initial={false}>
                {messages.map((message) => (
                  <motion.div
                    key={message.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`max-w-[80%] lg:max-w-[60%] rounded-lg p-4 ${
                        message.role === 'user'
                          ? 'bg-neural-blue/20 border border-neural-blue/50'
                          : 'glass-strong'
                      }`}
                    >
                      {message.role === 'assistant' && (
                        <div className="flex items-center gap-2 mb-2">
                          <span className="text-sm">🤖</span>
                          <span className="text-neural-green text-xs font-semibold">Edson's Minion</span>
                        </div>
                      )}
                      <div className="text-gray-200 text-sm whitespace-pre-wrap leading-relaxed">
                        {message.content}
                      </div>
                      <div className="mt-2 text-xs text-gray-500">
                        {message.timestamp.toLocaleTimeString()}
                      </div>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>

              {isLoading && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="flex justify-start"
                >
                  <div className="glass-strong rounded-lg p-4">
                    <div className="flex items-center gap-2">
                      <span className="text-sm">🤖</span>
                      <div className="flex space-x-1">
                        <span className="w-2 h-2 bg-neural-green rounded-full animate-bounce" />
                        <span className="w-2 h-2 bg-neural-green rounded-full animate-bounce delay-100" />
                        <span className="w-2 h-2 bg-neural-green rounded-full animate-bounce delay-200" />
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}

              <div ref={messagesEndRef} />
            </div>

            {/* Input Area */}
            <div className="border-t border-neural-blue/20 p-4 glass-strong">
              {/* Example Questions */}
              {messages.length <= 1 && (
                <div className="mb-4">
                  <p className="text-gray-400 text-xs mb-2">Try asking:</p>
                  <div className="flex flex-wrap gap-2">
                    {exampleQuestions.map((question) => (
                      <button
                        key={question}
                        onClick={() => {
                          setInput(question)
                          inputRef.current?.focus()
                        }}
                        className="px-3 py-1.5 bg-neural-blue/10 text-neural-blue rounded-full text-xs hover:bg-neural-blue/20 transition-colors"
                      >
                        {question}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              <div className="flex items-end gap-3">
                <div className="flex-1 relative">
                  <textarea
                    ref={inputRef}
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder="Ask me anything about Edson..."
                    rows={1}
                    className="w-full bg-black/30 border border-neural-blue/30 rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-neural-blue resize-none"
                    style={{ minHeight: '48px', maxHeight: '120px' }}
                  />
                </div>
                <button
                  onClick={sendMessage}
                  disabled={!input.trim() || isLoading}
                  className="p-3 bg-gradient-to-r from-neural-green to-neural-blue rounded-lg text-white disabled:opacity-50 disabled:cursor-not-allowed hover:opacity-90 transition-opacity"
                >
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                  </svg>
                </button>
              </div>

              <p className="text-gray-500 text-xs mt-2 text-center">
                Press Enter to send • Shift+Enter for new line
              </p>
            </div>
          </div>

          {/* Sidebar - Desktop Only */}
          <div className="hidden lg:block w-80 border-l border-neural-blue/20 glass-strong p-4 overflow-y-auto">
            <h3 className="text-neural-blue font-bold mb-4">About Edson's Minion</h3>

            <div className="space-y-4 text-sm">
              <div>
                <h4 className="text-white font-medium mb-2">What I Know</h4>
                <ul className="text-gray-400 space-y-1">
                  <li>• Career history & achievements</li>
                  <li>• Technical skills & expertise</li>
                  <li>• Education & certifications</li>
                  <li>• Projects & consulting services</li>
                </ul>
              </div>

              <div>
                <h4 className="text-white font-medium mb-2">Quick Stats</h4>
                <div className="grid grid-cols-2 gap-2">
                  <div className="bg-neural-blue/10 rounded p-2 text-center">
                    <p className="text-neural-blue font-bold">5+</p>
                    <p className="text-gray-400 text-xs">Years Exp</p>
                  </div>
                  <div className="bg-neural-green/10 rounded p-2 text-center">
                    <p className="text-neural-green font-bold">$1.2M</p>
                    <p className="text-gray-400 text-xs">Savings</p>
                  </div>
                  <div className="bg-neural-purple/10 rounded p-2 text-center">
                    <p className="text-neural-purple font-bold">15+</p>
                    <p className="text-gray-400 text-xs">Certs</p>
                  </div>
                  <div className="bg-neural-blue/10 rounded p-2 text-center">
                    <p className="text-neural-blue font-bold">3</p>
                    <p className="text-gray-400 text-xs">Masters</p>
                  </div>
                </div>
              </div>

              <div>
                <h4 className="text-white font-medium mb-2">Connect</h4>
                <div className="space-y-2">
                  <a
                    href="https://linkedin.com/in/edsonzandamela"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block px-3 py-2 bg-neural-blue/10 rounded text-neural-blue hover:bg-neural-blue/20 transition-colors"
                  >
                    LinkedIn
                  </a>
                  <a
                    href="https://github.com/edsna"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block px-3 py-2 bg-neural-blue/10 rounded text-neural-blue hover:bg-neural-blue/20 transition-colors"
                  >
                    GitHub
                  </a>
                  <a
                    href={process.env.NEXT_PUBLIC_CALENDAR_LINK || '#'}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block px-3 py-2 bg-neural-green/10 rounded text-neural-green hover:bg-neural-green/20 transition-colors"
                  >
                    Schedule a Call
                  </a>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </>
  )
}
