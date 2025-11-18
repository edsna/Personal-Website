import { useState } from 'react'
import { motion } from 'framer-motion'
import { skills } from '@/data/profile'

export default function Skills() {
  const [expandedCategory, setExpandedCategory] = useState<string | null>(null)

  const categories = Object.keys(skills)

  const getColorClasses = (color: string) => {
    const colors: Record<string, { bg: string; text: string; border: string }> = {
      'neural-green': {
        bg: 'bg-neural-green/20',
        text: 'text-neural-green',
        border: 'border-neural-green/50',
      },
      'neural-blue': {
        bg: 'bg-neural-blue/20',
        text: 'text-neural-blue',
        border: 'border-neural-blue/50',
      },
      'neural-purple': {
        bg: 'bg-neural-purple/20',
        text: 'text-neural-purple',
        border: 'border-neural-purple/50',
      },
    }
    return colors[color] || colors['neural-blue']
  }

  return (
    <div className="w-full">
      <h2 className="text-4xl font-bold text-neural-blue mb-4 text-center">
        Technical Skills
      </h2>
      <p className="text-gray-400 text-center mb-8">
        Comprehensive expertise across AI/ML, Cloud Infrastructure, and DevOps
      </p>

      {/* Skills Grid */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {categories.map((category) => {
          const categoryData = skills[category as keyof typeof skills]
          const colorClasses = getColorClasses(categoryData.color)
          const isExpanded = expandedCategory === category
          const displayItems = isExpanded ? categoryData.items : categoryData.items.slice(0, 8)

          return (
            <motion.div
              key={category}
              layout
              className="glass-strong rounded-lg p-6"
            >
              <h3 className={`text-xl font-bold ${colorClasses.text} mb-4`}>
                {category}
              </h3>

              <div className="flex flex-wrap gap-2">
                {displayItems.map((skill) => (
                  <motion.span
                    key={skill}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className={`px-3 py-1 ${colorClasses.bg} ${colorClasses.text} rounded-full text-sm border ${colorClasses.border}`}
                  >
                    {skill}
                  </motion.span>
                ))}
              </div>

              {categoryData.items.length > 8 && (
                <button
                  onClick={() => setExpandedCategory(isExpanded ? null : category)}
                  className={`mt-4 text-sm ${colorClasses.text} hover:underline`}
                >
                  {isExpanded
                    ? 'Show less'
                    : `+${categoryData.items.length - 8} more skills`}
                </button>
              )}
            </motion.div>
          )
        })}
      </div>

      {/* Skill Stats */}
      <div className="mt-8 glass-strong rounded-lg p-6">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
          <div>
            <p className="text-3xl font-bold text-neural-green">
              {Object.values(skills).reduce((acc, cat) => acc + cat.items.length, 0)}+
            </p>
            <p className="text-gray-400 text-sm">Total Skills</p>
          </div>
          <div>
            <p className="text-3xl font-bold text-neural-blue">{categories.length}</p>
            <p className="text-gray-400 text-sm">Categories</p>
          </div>
          <div>
            <p className="text-3xl font-bold text-neural-purple">5+</p>
            <p className="text-gray-400 text-sm">Years Experience</p>
          </div>
          <div>
            <p className="text-3xl font-bold text-neural-green">3</p>
            <p className="text-gray-400 text-sm">Cloud Platforms</p>
          </div>
        </div>
      </div>
    </div>
  )
}
