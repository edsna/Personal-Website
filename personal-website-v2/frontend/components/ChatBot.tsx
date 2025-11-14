import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import axios from 'axios'

interface Message {
  role: 'user' | 'assistant'
  content: string
  timestamp: Date
}

interface ChatBotProps {
  language?: 'en' | 'pt'
}

export default function ChatBot({ language = 'en' }: ChatBotProps) {
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [tokensRemaining, setTokensRemaining] = useState(50)
  const [conversationId, setConversationId] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  useEffect(() => {
    // Fetch current token usage on mount
    fetchTokenUsage()
  }, [])

  const fetchTokenUsage = async () => {
    try {
      const response = await axios.get(`${API_URL}/api/chat/usage`)
      setTokensRemaining(response.data.tokens_remaining)
    } catch (err) {
      console.error('Failed to fetch token usage:', err)
    }
  }

  const sendMessage = async () => {
    if (!input.trim() || isLoading) return

    const userMessage: Message = {
      role: 'user',
      content: input,
      timestamp: new Date(),
    }

    setMessages((prev) => [...prev, userMessage])
    setInput('')
    setIsLoading(true)
    setError(null)

    try {
      const response = await axios.post(`${API_URL}/api/chat`, {
        message: input,
        conversation_id: conversationId,
        language: language,
      })

      const assistantMessage: Message = {
        role: 'assistant',
        content: response.data.message,
        timestamp: new Date(),
      }

      setMessages((prev) => [...prev, assistantMessage])
      setConversationId(response.data.conversation_id)
      setTokensRemaining(response.data.tokens_remaining)

      if (!response.data.is_on_topic) {
        setError(
          language === 'pt'
            ? 'Pergunta fora do tópico - só posso responder sobre Edson'
            : 'Off-topic question - I can only answer about Edson'
        )
      }
    } catch (err: any) {
      console.error('Chat error:', err)

      let errorMessage = 'Failed to send message. Please try again.'

      if (err.response?.status === 429) {
        errorMessage =
          language === 'pt'
            ? 'Limite de taxa excedido. Tente novamente mais tarde.'
            : 'Rate limit exceeded. Please try again later.'
      } else if (err.response?.data?.error) {
        errorMessage = err.response.data.error
      }

      setError(errorMessage)

      const errorAssistantMessage: Message = {
        role: 'assistant',
        content: errorMessage,
        timestamp: new Date(),
      }

      setMessages((prev) => [...prev, errorAssistantMessage])
    } finally {
      setIsLoading(false)
      inputRef.current?.focus()
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      sendMessage()
    }
  }

  const exampleQuestions =
    language === 'pt'
      ? [
          'Qual é o cargo atual do Edson?',
          'Quais são as habilidades de GenAI do Edson?',
          'Conte-me sobre a experiência do Edson na Apple',
          'Quais certificações o Edson tem?',
        ]
      : [
          "What is Edson's current role?",
          "What are Edson's GenAI skills?",
          "Tell me about Edson's experience at Apple",
          'What certifications does Edson have?',
        ]

  return (
    <div className="w-full max-w-4xl mx-auto">
      {/* Token Counter */}
      <div className="mb-4 flex items-center justify-between">
        <div className="text-sm text-gray-400">
          <span className="text-neural-green font-mono">
            {language === 'pt' ? 'Tokens restantes' : 'Tokens remaining'}:
          </span>{' '}
          <span className="text-neural-blue font-bold">{tokensRemaining}</span> / 50
        </div>
        <div className="text-xs text-gray-500">
          {language === 'pt'
            ? 'Limite: 3 msgs/min, 10 msgs/dia'
            : 'Limit: 3 msgs/min, 10 msgs/day'}
        </div>
      </div>

      {/* Chat Container */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass-strong rounded-lg overflow-hidden"
      >
        {/* Chat Header */}
        <div className="bg-neural-dark/80 border-b border-neural-blue/30 px-6 py-4">
          <h3 className="text-xl font-bold text-neural-blue flex items-center gap-2">
            <span className="text-2xl">🤖</span>
            {language === 'pt' ? "Minion do Edson" : "Edson's Minion"}
          </h3>
          <p className="text-sm text-gray-400 mt-1">
            {language === 'pt'
              ? 'Pergunte-me qualquer coisa sobre a experiência, habilidades e projetos do Edson'
              : "Ask me anything about Edson's experience, skills, and projects"}
          </p>
        </div>

        {/* Messages Area */}
        <div className="h-96 overflow-y-auto p-6 space-y-4 bg-neural-dark/50">
          {messages.length === 0 && (
            <div className="text-center text-gray-500 py-8">
              <p className="mb-4">
                {language === 'pt'
                  ? 'Comece a conversa fazendo uma pergunta'
                  : 'Start the conversation by asking a question'}
              </p>
              <div className="space-y-2">
                <p className="text-xs text-neural-green">
                  {language === 'pt' ? 'Exemplos:' : 'Examples:'}
                </p>
                {exampleQuestions.slice(0, 2).map((q, i) => (
                  <button
                    key={i}
                    onClick={() => setInput(q)}
                    className="block w-full text-left px-4 py-2 text-sm text-gray-400 hover:text-neural-blue hover:bg-neural-blue/10 rounded transition-colors"
                  >
                    "{q}"
                  </button>
                ))}
              </div>
            </div>
          )}

          <AnimatePresence>
            {messages.map((message, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className={`flex ${
                  message.role === 'user' ? 'justify-end' : 'justify-start'
                }`}
              >
                <div
                  className={`max-w-[80%] rounded-lg px-4 py-3 ${
                    message.role === 'user'
                      ? 'bg-neural-blue text-neural-dark'
                      : 'bg-neural-dark/80 text-white border border-neural-green/30'
                  }`}
                >
                  <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                  <p className="text-xs opacity-60 mt-1">
                    {message.timestamp.toLocaleTimeString([], {
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </p>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>

          {/* Typing Indicator */}
          {isLoading && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex justify-start"
            >
              <div className="bg-neural-dark/80 border border-neural-green/30 rounded-lg px-4 py-3">
                <div className="flex gap-2">
                  <div className="w-2 h-2 bg-neural-green rounded-full animate-bounce"></div>
                  <div
                    className="w-2 h-2 bg-neural-green rounded-full animate-bounce"
                    style={{ animationDelay: '0.2s' }}
                  ></div>
                  <div
                    className="w-2 h-2 bg-neural-green rounded-full animate-bounce"
                    style={{ animationDelay: '0.4s' }}
                  ></div>
                </div>
              </div>
            </motion.div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Error Display */}
        {error && (
          <div className="px-6 py-2 bg-red-500/20 border-t border-red-500/50">
            <p className="text-sm text-red-400">{error}</p>
          </div>
        )}

        {/* Input Area */}
        <div className="border-t border-neural-blue/30 p-4 bg-neural-dark/80">
          <div className="flex gap-2">
            <input
              ref={inputRef}
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder={
                language === 'pt'
                  ? 'Digite sua pergunta...'
                  : 'Type your question...'
              }
              className="flex-1 bg-neural-dark/50 border border-neural-blue/30 rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-neural-blue transition-colors"
              disabled={isLoading || tokensRemaining <= 0}
              maxLength={1000}
            />
            <button
              onClick={sendMessage}
              disabled={isLoading || !input.trim() || tokensRemaining <= 0}
              className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <span className="loading-dots">
                  {language === 'pt' ? 'Enviando' : 'Sending'}
                </span>
              ) : (
                <span>{language === 'pt' ? 'Enviar' : 'Send'}</span>
              )}
            </button>
          </div>

          {tokensRemaining <= 0 && (
            <p className="text-xs text-red-400 mt-2">
              {language === 'pt'
                ? 'Limite diário de tokens atingido. Tente novamente amanhã.'
                : 'Daily token limit reached. Try again tomorrow.'}
            </p>
          )}

          <p className="text-xs text-gray-500 mt-2">
            {language === 'pt'
              ? `${input.length}/1000 caracteres`
              : `${input.length}/1000 characters`}
          </p>
        </div>
      </motion.div>

      {/* Suggested Questions */}
      {messages.length === 0 && (
        <div className="mt-4">
          <p className="text-sm text-gray-400 mb-2">
            {language === 'pt' ? 'Perguntas sugeridas:' : 'Suggested questions:'}
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
            {exampleQuestions.map((q, i) => (
              <button
                key={i}
                onClick={() => setInput(q)}
                className="text-left px-4 py-2 text-sm text-gray-400 bg-neural-dark/30 hover:bg-neural-blue/10 hover:text-neural-blue border border-neural-blue/20 rounded-lg transition-all"
              >
                {q}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
