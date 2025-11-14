import { useState } from 'react'
import { motion } from 'framer-motion'

interface ContactFormProps {
  language?: 'en' | 'pt'
}

export default function ContactForm({ language = 'en' }: ContactFormProps) {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    company: '',
    message: '',
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'success' | 'error'>('idle')

  const content = {
    en: {
      title: 'Get in Touch',
      subtitle: 'Have a project in mind? Let\'s discuss how I can help',
      form: {
        name: 'Your Name',
        email: 'Email Address',
        company: 'Company (Optional)',
        message: 'Tell me about your project',
        submit: 'Send Message',
        submitting: 'Sending...',
      },
      success: 'Thank you! I\'ll get back to you within 24 hours.',
      error: 'Something went wrong. Please email me directly at edsonaguiar17@gmail.com',
      or: 'Or reach out directly:',
    },
    pt: {
      title: 'Entre em Contato',
      subtitle: 'Tem um projeto em mente? Vamos discutir como posso ajudar',
      form: {
        name: 'Seu Nome',
        email: 'Endereço de Email',
        company: 'Empresa (Opcional)',
        message: 'Conte-me sobre seu projeto',
        submit: 'Enviar Mensagem',
        submitting: 'Enviando...',
      },
      success: 'Obrigado! Entrarei em contato em até 24 horas.',
      error: 'Algo deu errado. Por favor, envie um email direto para edsonaguiar17@gmail.com',
      or: 'Ou entre em contato diretamente:',
    },
  }

  const t = content[language]

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setSubmitStatus('idle')

    try {
      // In a real implementation, you would send this to your backend or a service like Formspree
      // For now, we'll simulate sending to mailto
      const subject = `New Contact from ${formData.name}`
      const body = `
Name: ${formData.name}
Email: ${formData.email}
Company: ${formData.company || 'Not provided'}

Message:
${formData.message}
      `

      // Open mailto link
      window.location.href = `mailto:edsonaguiar17@gmail.com?subject=${encodeURIComponent(
        subject
      )}&body=${encodeURIComponent(body)}`

      setSubmitStatus('success')
      setFormData({ name: '', email: '', company: '', message: '' })
    } catch (error) {
      console.error('Form submission error:', error)
      setSubmitStatus('error')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }))
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      viewport={{ once: true }}
      className="max-w-2xl mx-auto"
    >
      <div className="text-center mb-12">
        <h2 className="text-4xl font-bold text-neural-blue mb-4">{t.title}</h2>
        <p className="text-xl text-gray-300">{t.subtitle}</p>
      </div>

      <div className="glass-strong rounded-lg p-8">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Name */}
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-300 mb-2">
              {t.form.name}
            </label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
              className="w-full bg-neural-dark/50 border border-neural-blue/30 rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-neural-blue transition-colors"
              placeholder={t.form.name}
            />
          </div>

          {/* Email */}
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-300 mb-2">
              {t.form.email}
            </label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
              className="w-full bg-neural-dark/50 border border-neural-blue/30 rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-neural-blue transition-colors"
              placeholder={t.form.email}
            />
          </div>

          {/* Company */}
          <div>
            <label htmlFor="company" className="block text-sm font-medium text-gray-300 mb-2">
              {t.form.company}
            </label>
            <input
              type="text"
              id="company"
              name="company"
              value={formData.company}
              onChange={handleChange}
              className="w-full bg-neural-dark/50 border border-neural-blue/30 rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-neural-blue transition-colors"
              placeholder={t.form.company}
            />
          </div>

          {/* Message */}
          <div>
            <label htmlFor="message" className="block text-sm font-medium text-gray-300 mb-2">
              {t.form.message}
            </label>
            <textarea
              id="message"
              name="message"
              value={formData.message}
              onChange={handleChange}
              required
              rows={6}
              className="w-full bg-neural-dark/50 border border-neural-blue/30 rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-neural-blue transition-colors resize-none"
              placeholder={t.form.message}
            />
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting ? t.form.submitting : t.form.submit}
          </button>

          {/* Status Messages */}
          {submitStatus === 'success' && (
            <div className="bg-neural-green/20 border border-neural-green/50 rounded-lg p-4">
              <p className="text-neural-green text-center">{t.success}</p>
            </div>
          )}

          {submitStatus === 'error' && (
            <div className="bg-red-500/20 border border-red-500/50 rounded-lg p-4">
              <p className="text-red-400 text-center">{t.error}</p>
            </div>
          )}
        </form>

        {/* Direct Contact */}
        <div className="mt-8 pt-8 border-t border-neural-blue/30">
          <p className="text-sm text-gray-400 mb-4 text-center">{t.or}</p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a
              href="mailto:edsonaguiar17@gmail.com"
              className="flex items-center gap-2 text-neural-blue hover:text-neural-green transition-colors"
            >
              <span>📧</span>
              <span>edsonaguiar17@gmail.com</span>
            </a>
            <a
              href="https://linkedin.com/in/edsonzandamela"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 text-neural-blue hover:text-neural-green transition-colors"
            >
              <span>💼</span>
              <span>LinkedIn</span>
            </a>
            <a
              href="https://github.com/edsna"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 text-neural-blue hover:text-neural-green transition-colors"
            >
              <span>💻</span>
              <span>GitHub</span>
            </a>
          </div>
        </div>
      </div>
    </motion.div>
  )
}
