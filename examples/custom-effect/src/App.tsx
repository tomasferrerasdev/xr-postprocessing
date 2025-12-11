import { Canvas, useFrame } from '@react-three/fiber'
import { XREffectComposer } from 'xr-postprocessing'
import { useState, useRef } from 'react'
import { ChromaticAberration } from './effects/ChromaticAberration'
import { Mesh } from 'three'

function RotatingBox({ position, color }: { position: [number, number, number]; color: string }) {
  const meshRef = useRef<Mesh>(null)

  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.x = state.clock.elapsedTime * 0.5
      meshRef.current.rotation.y = state.clock.elapsedTime * 0.3
    }
  })

  return (
    <mesh ref={meshRef} position={position}>
      <boxGeometry args={[1, 1, 1]} />
      <meshStandardMaterial color={color} />
    </mesh>
  )
}

function AnimatedSphere() {
  const meshRef = useRef<Mesh>(null)

  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.position.y = Math.sin(state.clock.elapsedTime * 2) * 1.5
      meshRef.current.rotation.x = state.clock.elapsedTime * 0.7
      meshRef.current.rotation.z = state.clock.elapsedTime * 0.4
    }
  })

  return (
    <mesh ref={meshRef} position={[0, 0, 0]}>
      <sphereGeometry args={[0.8, 32, 32]} />
      <meshStandardMaterial color="#ff6b6b" wireframe />
    </mesh>
  )
}

export default function App() {
  const [offset, setOffset] = useState(1.0)
  const [angle, setAngle] = useState(0)

  return (
    <div className="container">
      <div className="info">
        <h1>🎨 Custom Effect Example</h1>
        <p>
          This demonstrates how to create a custom postprocessing effect. The{' '}
          <code>&lt;ChromaticAberration/&gt;</code> effect is implemented entirely within this
          example and not provided by the library.
        </p>
        <div style={{ marginTop: '1rem' }}>
          <label>
            Aberration Offset: {offset.toFixed(2)}
            <input
              type="range"
              min="0"
              max="5"
              step="0.1"
              value={offset}
              onChange={(e) => setOffset(parseFloat(e.target.value))}
              style={{ width: '100%' }}
            />
          </label>
          <label style={{ marginTop: '0.5rem', display: 'block' }}>
            Angle: {((angle * 180) / Math.PI).toFixed(0)}°
            <input
              type="range"
              min="0"
              max={Math.PI * 2}
              step="0.1"
              value={angle}
              onChange={(e) => setAngle(parseFloat(e.target.value))}
              style={{ width: '100%' }}
            />
          </label>
        </div>
      </div>
      <Canvas camera={{ position: [0, 0, 5] }}>
        <ambientLight intensity={0.5} />
        <directionalLight position={[10, 10, 5]} intensity={1} />
        <pointLight position={[-10, -10, -5]} intensity={0.5} color="#4ecdc4" />

        {/* Animated objects */}
        <RotatingBox position={[-2, 0, 0]} color="#4ecdc4" />
        <AnimatedSphere />
        <RotatingBox position={[2, 0, 0]} color="#ffe66d" />

        {/* Custom XR postprocessing effect */}
        <XREffectComposer>
          <ChromaticAberration offset={offset} angle={angle} />
        </XREffectComposer>
      </Canvas>
    </div>
  )
}
