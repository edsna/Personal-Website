import { useState } from 'react'
import { motion } from 'framer-motion'
import { certifications } from '@/data/profile'

export default function Certifications() {
  const [selectedCategory, setSelectedCategory] = useState<string>('all')

  const categories = ['all', 'Cloud', 'AI/ML', 'DevOps', 'Security']

  const filteredCerts = selectedCategory === 'all'
    ? certifications
    : certifications.filter(cert => cert.category === selectedCategory)

  const getBadgeColor = (color: string) => {
    const colors: Record<string, string> = {
      orange: 'from-orange-500 to-orange-600',
      blue: 'from-blue-500 to-blue-600',
      purple: 'from-purple-500 to-purple-600',
      red: 'from-red-500 to-red-600',
      gray: 'from-gray-500 to-gray-600',
      green: 'from-green-500 to-green-600',
    }
    return colors[color] || colors.blue
  }

  return (
    <div className="w-full">
      <h2 className="text-4xl font-bold text-neural-blue mb-4 text-center">
        Certifications
      </h2>
      <p className="text-gray-400 text-center mb-8">
        {certifications.length}+ professional certifications across cloud, AI/ML, and DevOps
      </p>

      {/* Category Filter */}
      <div className="flex flex-wrap justify-center gap-2 mb-8">
        {categories.map((category) => (
          <button
            key={category}
            onClick={() => setSelectedCategory(category)}
            className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 ${
              selectedCategory === category
                ? 'bg-neural-blue text-white'
                : 'bg-neural-blue/10 text-neural-blue hover:bg-neural-blue/20'
            }`}
          >
            {category === 'all' ? 'All' : category}
          </button>
        ))}
      </div>

      {/* Certifications Grid */}
      <motion.div
        layout
        className="grid md:grid-cols-2 lg:grid-cols-3 gap-4"
      >
        {filteredCerts.map((cert, index) => (
          <motion.div
            key={cert.name}
            layout
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3, delay: index * 0.05 }}
            className="glass-strong rounded-lg p-4 hover:border-neural-blue/50 border border-transparent transition-all duration-200"
          >
            <div className="flex items-start gap-3">
              {/* Badge */}
              <div className={`px-2 py-1 rounded text-xs font-bold text-white bg-gradient-to-r ${getBadgeColor(cert.color)} shrink-0`}>
                {cert.badge}
              </div>

              <div className="flex-1 min-w-0">
                <h3 className="text-white font-medium text-sm leading-tight mb-1">
                  {cert.name}
                </h3>
                <p className="text-gray-400 text-xs">{cert.issuer}</p>
                <div className="flex items-center justify-between mt-2">
                  <span className={`text-xs px-2 py-0.5 rounded-full ${
                    cert.category === 'AI/ML' ? 'bg-neural-green/20 text-neural-green' :
                    cert.category === 'Cloud' ? 'bg-neural-blue/20 text-neural-blue' :
                    cert.category === 'DevOps' ? 'bg-neural-purple/20 text-neural-purple' :
                    'bg-red-500/20 text-red-400'
                  }`}>
                    {cert.category}
                  </span>
                  <span className="text-gray-500 text-xs">{cert.date}</span>
                </div>
              </div>
            </div>
          </motion.div>
        ))}
      </motion.div>

      {/* Summary Stats */}
      <div className="mt-8 grid grid-cols-2 md:grid-cols-4 gap-4">
        {['Cloud', 'AI/ML', 'DevOps', 'Security'].map((cat) => {
          const count = certifications.filter(c => c.category === cat).length
          return (
            <div key={cat} className="glass-strong rounded-lg p-4 text-center">
              <p className="text-2xl font-bold text-neural-blue">{count}</p>
              <p className="text-gray-400 text-sm">{cat}</p>
            </div>
          )
        })}
      </div>
    </div>
  )
}
