import { motion } from 'framer-motion'
import { useState } from 'react'

interface ConsultingServicesProps {
  language?: 'en' | 'pt'
}

export default function ConsultingServices({ language = 'en' }: ConsultingServicesProps) {
  const [selectedService, setSelectedService] = useState<string | null>(null)

  const content = {
    en: {
      title: 'Consulting Services',
      subtitle: 'Expert GenAI & MLOps Consulting for Your Business',
      services: [
        {
          id: 'genai',
          icon: '🤖',
          title: 'GenAI Implementation',
          description:
            'Deploy enterprise-ready LLM solutions with RAG, multi-agent systems, and custom AI workflows',
          features: [
            'RAG system architecture & implementation',
            'Multi-agent LLM orchestration',
            'Vector database setup (Weaviate, Chroma)',
            'LLM fine-tuning and prompt engineering',
            'AI safety and guardrails implementation',
          ],
          pricing: 'From $200/hour',
        },
        {
          id: 'mlops',
          icon: '⚙️',
          title: 'MLOps & Infrastructure',
          description:
            'Build scalable ML infrastructure on AWS/Kubernetes with monitoring and automation',
          features: [
            'Kubernetes cluster design & deployment',
            'ML pipeline automation (CI/CD)',
            'Infrastructure as Code (Terraform)',
            'GPU optimization for LLM workloads',
            'Cost optimization (reduce cloud spend 50-90%)',
          ],
          pricing: 'From $200/hour',
        },
        {
          id: 'training',
          icon: '📚',
          title: 'AI Training & Workshops',
          description:
            'Upskill your team with hands-on GenAI training in English or Portuguese',
          features: [
            'Custom GenAI workshops (4-8 hours)',
            'LangChain/LangGraph training',
            'RAG implementation masterclass',
            'Bilingual delivery (EN/PT)',
            'Hands-on projects and code reviews',
          ],
          pricing: 'From $2,500/day',
        },
      ],
      cta: {
        title: 'Ready to Transform Your AI Strategy?',
        subtitle:
          "Let's discuss how I can help accelerate your GenAI and MLOps initiatives",
        button: 'Schedule a Free Consultation',
      },
      testimonials: {
        title: 'What Clients Say',
        items: [
          {
            quote:
              "Edson's expertise in GenAI helped us deploy a production RAG system in weeks, not months",
            author: 'CTO, Biotech Startup',
          },
          {
            quote:
              'Reduced our AWS costs by 90% while improving performance. Best investment we made.',
            author: 'VP Engineering, SaaS Company',
          },
        ],
      },
    },
    pt: {
      title: 'Serviços de Consultoria',
      subtitle: 'Consultoria Especializada em GenAI & MLOps para o Seu Negócio',
      services: [
        {
          id: 'genai',
          icon: '🤖',
          title: 'Implementação de GenAI',
          description:
            'Implemente soluções LLM empresariais com RAG, sistemas multi-agente e fluxos de IA personalizados',
          features: [
            'Arquitetura e implementação de sistemas RAG',
            'Orquestração de LLMs multi-agente',
            'Configuração de bancos de dados vetoriais',
            'Fine-tuning de LLMs e engenharia de prompts',
            'Implementação de proteções e segurança de IA',
          ],
          pricing: 'A partir de $200/hora',
        },
        {
          id: 'mlops',
          icon: '⚙️',
          title: 'MLOps & Infraestrutura',
          description:
            'Construa infraestrutura ML escalável em AWS/Kubernetes com monitoramento e automação',
          features: [
            'Design e deploy de clusters Kubernetes',
            'Automação de pipelines ML (CI/CD)',
            'Infrastructure as Code (Terraform)',
            'Otimização de GPU para cargas LLM',
            'Otimização de custos (reduza 50-90%)',
          ],
          pricing: 'A partir de $200/hora',
        },
        {
          id: 'training',
          icon: '📚',
          title: 'Treinamento em IA',
          description:
            'Capacite sua equipe com treinamento prático em GenAI em inglês ou português',
          features: [
            'Workshops personalizados de GenAI (4-8 horas)',
            'Treinamento em LangChain/LangGraph',
            'Masterclass de implementação RAG',
            'Entrega bilíngue (EN/PT)',
            'Projetos práticos e revisões de código',
          ],
          pricing: 'A partir de $2,500/dia',
        },
      ],
      cta: {
        title: 'Pronto para Transformar Sua Estratégia de IA?',
        subtitle:
          'Vamos discutir como posso ajudar a acelerar suas iniciativas de GenAI e MLOps',
        button: 'Agendar Consulta Gratuita',
      },
      testimonials: {
        title: 'O Que os Clientes Dizem',
        items: [
          {
            quote:
              'A expertise do Edson em GenAI nos ajudou a implementar um sistema RAG em produção em semanas',
            author: 'CTO, Startup de Biotecnologia',
          },
          {
            quote:
              'Reduzimos nossos custos AWS em 90% melhorando o desempenho. Melhor investimento que fizemos.',
            author: 'VP de Engenharia, Empresa SaaS',
          },
        ],
      },
    },
  }

  const t = content[language]

  return (
    <div className="w-full">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        viewport={{ once: true }}
        className="text-center mb-16"
      >
        <h2 className="text-5xl font-bold text-neural-blue mb-4">{t.title}</h2>
        <p className="text-xl text-gray-300 max-w-3xl mx-auto">{t.subtitle}</p>
      </motion.div>

      {/* Services Grid */}
      <div className="grid md:grid-cols-3 gap-8 mb-16">
        {t.services.map((service, index) => (
          <motion.div
            key={service.id}
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: index * 0.1 }}
            viewport={{ once: true }}
            whileHover={{ scale: 1.03 }}
            className={`glass-strong rounded-lg p-6 cursor-pointer transition-all ${
              selectedService === service.id
                ? 'border-2 border-neural-blue'
                : 'border border-neural-blue/30'
            }`}
            onClick={() =>
              setSelectedService(selectedService === service.id ? null : service.id)
            }
          >
            {/* Icon */}
            <div className="text-5xl mb-4">{service.icon}</div>

            {/* Title */}
            <h3 className="text-2xl font-bold text-neural-green mb-3">{service.title}</h3>

            {/* Description */}
            <p className="text-gray-300 mb-4 text-sm">{service.description}</p>

            {/* Features */}
            {selectedService === service.id && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="mb-4"
              >
                <ul className="space-y-2">
                  {service.features.map((feature, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm text-gray-400">
                      <span className="text-neural-green mt-1">✓</span>
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
              </motion.div>
            )}

            {/* Pricing */}
            <div className="mt-4 pt-4 border-t border-neural-blue/30">
              <p className="text-neural-blue font-semibold">{service.pricing}</p>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Testimonials */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        viewport={{ once: true }}
        className="mb-16"
      >
        <h3 className="text-3xl font-bold text-neural-blue text-center mb-8">
          {t.testimonials.title}
        </h3>
        <div className="grid md:grid-cols-2 gap-6">
          {t.testimonials.items.map((testimonial, index) => (
            <div
              key={index}
              className="glass-strong rounded-lg p-6 border-l-4 border-neural-green"
            >
              <p className="text-gray-300 italic mb-4">"{testimonial.quote}"</p>
              <p className="text-neural-blue font-semibold text-sm">
                — {testimonial.author}
              </p>
            </div>
          ))}
        </div>
      </motion.div>

      {/* CTA */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        viewport={{ once: true }}
        className="glass-strong rounded-lg p-12 text-center border-2 border-neural-blue"
      >
        <h3 className="text-3xl font-bold text-neural-blue mb-4">{t.cta.title}</h3>
        <p className="text-xl text-gray-300 mb-8 max-w-2xl mx-auto">{t.cta.subtitle}</p>
        <a
          href={process.env.NEXT_PUBLIC_CALENDAR_LINK || '#'}
          target="_blank"
          rel="noopener noreferrer"
          className="btn-primary text-lg px-8 py-4 inline-block"
        >
          {t.cta.button}
        </a>
      </motion.div>

      {/* Why Work With Me */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        viewport={{ once: true }}
        className="mt-16 grid md:grid-cols-4 gap-6"
      >
        {[
          {
            icon: '💰',
            title: language === 'pt' ? 'ROI Comprovado' : 'Proven ROI',
            desc:
              language === 'pt'
                ? 'Economizou $1.2M+ na Apple'
                : 'Saved $1.2M+ at Apple',
          },
          {
            icon: '🚀',
            title: language === 'pt' ? 'Entrega Rápida' : 'Fast Delivery',
            desc:
              language === 'pt'
                ? 'RAG em produção em semanas'
                : 'Production RAG in weeks',
          },
          {
            icon: '🌍',
            title: language === 'pt' ? 'Bilíngue' : 'Bilingual',
            desc:
              language === 'pt'
                ? 'Inglês & Português fluente'
                : 'Fluent English & Portuguese',
          },
          {
            icon: '🎓',
            title: language === 'pt' ? '20+ Certificações' : '20+ Certifications',
            desc:
              language === 'pt'
                ? 'DeepLearning.AI, Google, NVIDIA'
                : 'DeepLearning.AI, Google, NVIDIA',
          },
        ].map((item, i) => (
          <div key={i} className="text-center">
            <div className="text-4xl mb-2">{item.icon}</div>
            <h4 className="text-neural-green font-semibold mb-1">{item.title}</h4>
            <p className="text-sm text-gray-400">{item.desc}</p>
          </div>
        ))}
      </motion.div>
    </div>
  )
}
