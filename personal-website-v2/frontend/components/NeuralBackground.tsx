import { useRef, useMemo } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import * as THREE from 'three'

interface ParticleSystemProps {
  count?: number
}

function ParticleSystem({ count = 100 }: ParticleSystemProps) {
  const pointsRef = useRef<THREE.Points>(null)
  const linesRef = useRef<THREE.LineSegments>(null)

  // Generate particle positions
  const particles = useMemo(() => {
    const positions = new Float32Array(count * 3)
    const velocities = new Float32Array(count * 3)

    for (let i = 0; i < count; i++) {
      const i3 = i * 3
      // Distribute particles in 3D space
      positions[i3] = (Math.random() - 0.5) * 20
      positions[i3 + 1] = (Math.random() - 0.5) * 20
      positions[i3 + 2] = (Math.random() - 0.5) * 10

      // Random velocities
      velocities[i3] = (Math.random() - 0.5) * 0.02
      velocities[i3 + 1] = (Math.random() - 0.5) * 0.02
      velocities[i3 + 2] = (Math.random() - 0.5) * 0.02
    }

    return { positions, velocities }
  }, [count])

  // Generate connections between nearby particles
  const connections = useMemo(() => {
    const linePositions: number[] = []
    const maxDistance = 3 // Maximum distance for connections

    const positions = particles.positions

    for (let i = 0; i < count; i++) {
      const i3 = i * 3
      const x1 = positions[i3]
      const y1 = positions[i3 + 1]
      const z1 = positions[i3 + 2]

      for (let j = i + 1; j < count; j++) {
        const j3 = j * 3
        const x2 = positions[j3]
        const y2 = positions[j3 + 1]
        const z2 = positions[j3 + 2]

        const distance = Math.sqrt(
          Math.pow(x2 - x1, 2) +
          Math.pow(y2 - y1, 2) +
          Math.pow(z2 - z1, 2)
        )

        if (distance < maxDistance) {
          linePositions.push(x1, y1, z1, x2, y2, z2)
        }
      }
    }

    return new Float32Array(linePositions)
  }, [particles.positions, count])

  // Animation loop
  useFrame((state) => {
    if (!pointsRef.current) return

    const positions = pointsRef.current.geometry.attributes.position.array as Float32Array
    const velocities = particles.velocities

    // Update particle positions
    for (let i = 0; i < count; i++) {
      const i3 = i * 3

      positions[i3] += velocities[i3]
      positions[i3 + 1] += velocities[i3 + 1]
      positions[i3 + 2] += velocities[i3 + 2]

      // Boundary check and bounce
      if (Math.abs(positions[i3]) > 10) velocities[i3] *= -1
      if (Math.abs(positions[i3 + 1]) > 10) velocities[i3 + 1] *= -1
      if (Math.abs(positions[i3 + 2]) > 5) velocities[i3 + 2] *= -1
    }

    pointsRef.current.geometry.attributes.position.needsUpdate = true

    // Rotate the entire system slowly
    pointsRef.current.rotation.y = state.clock.elapsedTime * 0.05
    if (linesRef.current) {
      linesRef.current.rotation.y = state.clock.elapsedTime * 0.05
    }
  })

  return (
    <>
      {/* Particles */}
      <points ref={pointsRef}>
        <bufferGeometry>
          <bufferAttribute
            attach="attributes-position"
            count={count}
            array={particles.positions}
            itemSize={3}
          />
        </bufferGeometry>
        <pointsMaterial
          size={0.1}
          color="#00d9ff"
          transparent
          opacity={0.8}
          sizeAttenuation
        />
      </points>

      {/* Connection Lines */}
      <lineSegments ref={linesRef}>
        <bufferGeometry>
          <bufferAttribute
            attach="attributes-position"
            count={connections.length / 3}
            array={connections}
            itemSize={3}
          />
        </bufferGeometry>
        <lineBasicMaterial
          color="#00d9ff"
          transparent
          opacity={0.2}
        />
      </lineSegments>
    </>
  )
}

export default function NeuralBackground() {
  return (
    <div className="fixed top-0 left-0 w-full h-full -z-10 opacity-30">
      <Canvas
        camera={{ position: [0, 0, 15], fov: 60 }}
        gl={{ alpha: true, antialias: true }}
      >
        <ambientLight intensity={0.5} />
        <pointLight position={[10, 10, 10]} intensity={1} />
        <ParticleSystem count={100} />
      </Canvas>
    </div>
  )
}
