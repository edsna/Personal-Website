import { useState } from 'react'
import { motion } from 'framer-motion'
import { experiences, education } from '@/data/profile'

export default function Experience() {
  const [selectedExp, setSelectedExp] = useState<string | null>(null)

  return (
    <div className="w-full">
      <h2 className="text-4xl font-bold text-neural-blue mb-4 text-center">
        Experience Journey
      </h2>
      <p className="text-gray-400 text-center mb-12">
        5+ years scaling AI/ML infrastructure across biotech and big tech
      </p>

      {/* Timeline */}
      <div className="space-y-6">
        {experiences.map((exp, index) => {
          const isExpanded = selectedExp === exp.id
          const colorClass = exp.color === 'neural-blue' ? 'border-neural-blue' :
                           exp.color === 'neural-green' ? 'border-neural-green' :
                           'border-neural-purple'
          const textColor = exp.color === 'neural-blue' ? 'text-neural-blue' :
                          exp.color === 'neural-green' ? 'text-neural-green' :
                          'text-neural-purple'

          return (
            <motion.div
              key={exp.id}
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              viewport={{ once: true }}
              className={`glass-strong rounded-lg p-6 border-l-4 ${colorClass} cursor-pointer hover:border-opacity-100 transition-all duration-200`}
              onClick={() => setSelectedExp(isExpanded ? null : exp.id)}
            >
              <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-4">
                <div>
                  <h3 className="text-xl md:text-2xl font-bold text-white">
                    {exp.role}
                  </h3>
                  <p className={`${textColor} font-semibold`}>
                    {exp.company}
                    {exp.type && <span className="text-gray-500 text-sm ml-2">({exp.type})</span>}
                  </p>
                </div>
                <div className="text-right mt-2 md:mt-0">
                  <p className="text-gray-400 text-sm">{exp.period}</p>
                  <p className="text-gray-500 text-xs">{exp.location}</p>
                </div>
              </div>

              {/* Highlights */}
              <ul className={`space-y-2 text-gray-300 ${isExpanded ? '' : 'line-clamp-3'}`}>
                {(isExpanded ? exp.highlights : exp.highlights.slice(0, 3)).map((highlight, i) => (
                  <li key={i} className="flex gap-2">
                    <span className="text-neural-green shrink-0">▸</span>
                    <span>{highlight}</span>
                  </li>
                ))}
              </ul>

              {/* Impact Badge */}
              <div className="mt-4 flex items-center justify-between">
                <span className={`inline-block px-3 py-1 ${
                  exp.color === 'neural-blue' ? 'bg-neural-blue/20 text-neural-blue' :
                  exp.color === 'neural-green' ? 'bg-neural-green/20 text-neural-green' :
                  'bg-neural-purple/20 text-neural-purple'
                } rounded-full text-sm font-medium`}>
                  Impact: {exp.impact}
                </span>

                {exp.highlights.length > 3 && (
                  <span className="text-gray-500 text-sm">
                    {isExpanded ? 'Click to collapse' : `+${exp.highlights.length - 3} more`}
                  </span>
                )}
              </div>
            </motion.div>
          )
        })}
      </div>

      {/* Education Section */}
      <div className="mt-12">
        <h3 className="text-2xl font-bold text-neural-green mb-6 text-center">
          Education
        </h3>
        <div className="grid md:grid-cols-3 gap-4">
          {education.map((edu, index) => (
            <motion.div
              key={edu.degree}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: index * 0.1 }}
              viewport={{ once: true }}
              className="glass-strong rounded-lg p-4 text-center"
            >
              <span className="text-3xl mb-2 block">{edu.icon}</span>
              <h4 className="font-bold text-white text-sm">{edu.degree}</h4>
              <p className="text-neural-blue text-xs">{edu.specialization}</p>
              <p className="text-gray-400 text-xs mt-2">{edu.institution}</p>
              <p className="text-gray-500 text-xs">{edu.year}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  )
}
