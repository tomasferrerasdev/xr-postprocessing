import { Canvas } from '@react-three/fiber'
import { Environment, Grid, OrbitControls } from '@react-three/drei'
import { createXRStore, XR } from '@react-three/xr'
import { useState } from 'react'
import { XREffectComposer, Bloom, UnrealBloom, Sobel, Blur, Pixelate } from 'xr-postprocessing'
import { useXRControls, useXRControlValues, LevaUikitXr } from './components/leva-uikit-xr.tsx'
import { Suzanne } from './components/Suzanne.tsx'

// Define the controls schema as a JSON config
const controlsSchema = {
  effectType: {
    value: 'none',
    options: ['none', 'bloom', 'unrealBloom', 'sobel', 'blur', 'pixelate'],
  },
  bloomStrength: { value: 1.0, min: 0, max: 3, step: 0.01 },
  bloomThreshold: { value: 0.8, min: 0, max: 1, step: 0.01 },
  unrealStrength: { value: 0.2, min: 0, max: 3, step: 0.01 },
  unrealRadius: { value: 0.0, min: 0, max: 1, step: 0.01 },
  unrealThreshold: { value: 0.5, min: 0, max: 1, step: 0.01 },
  pixelSize: { value: 8, min: 1, max: 32, step: 1 },
}

type ControlValues = {
  effectType: string
  bloomStrength: number
  bloomThreshold: number
  unrealStrength: number
  unrealRadius: number
  unrealThreshold: number
  pixelSize: number
}

function PostProcessing({ controls }: { controls: ReturnType<typeof useXRControls> }) {
  // Get the current values from the controls
  const values = useXRControlValues(controls) as ControlValues

  if (values.effectType === 'none') {
    return null
  }

  return (
    <XREffectComposer enabled={values.effectType !== 'none'} key={values.effectType}>
      {values.effectType === 'bloom' && (
        <Bloom strength={values.bloomStrength} threshold={values.bloomThreshold} />
      )}
      {values.effectType === 'unrealBloom' && (
        <UnrealBloom
          strength={values.unrealStrength}
          radius={values.unrealRadius}
          threshold={values.unrealThreshold}
        />
      )}
      {values.effectType === 'sobel' && <Sobel />}
      {values.effectType === 'blur' && <Blur />}
      {values.effectType === 'pixelate' && <Pixelate pixelSize={values.pixelSize} />}
    </XREffectComposer>
  )
}

function Scene() {
  // Initialize XR controls with the schema
  const controls = useXRControls(controlsSchema)

  return (
    <>
      <OrbitControls />
      <LevaUikitXr schema={controlsSchema} controls={controls} />
      <Environment preset="city" />
      <ambientLight intensity={0.4} />
      <directionalLight position={[2, 4, 3]} intensity={2.5} />

      <Suzanne />

      <mesh position={[-1, 1, -2]}>
        <sphereGeometry args={[0.3, 32, 32]} />
        <meshStandardMaterial color="blue" />
      </mesh>

      <mesh position={[1, 1, -2]}>
        <coneGeometry args={[0.3, 0.6, 32]} />
        <meshStandardMaterial color="green" />
      </mesh>
      <Grid args={[10, 10]} />
      <PostProcessing controls={controls} />
    </>
  )
}

export default function App() {
  const [sessionMode, setSessionMode] = useState<'immersive-vr' | 'immersive-ar'>('immersive-vr')

  const store = createXRStore({
    bounded: false,
    emulate: {
      headset: {
        position: [0, 1, 0],
      },
      controller: {
        left: {
          position: [-0.2, 1, -0.3],
        },
        right: {
          position: [0.2, 1, -0.3],
        },
      },
    },
    offerSession: sessionMode,
  })

  const handleEnterVR = () => {
    setSessionMode('immersive-vr')
    store.enterVR()
  }

  const handleEnterAR = () => {
    setSessionMode('immersive-ar')
    store.enterAR()
  }

  return (
    <main className="w-full h-full bg-black relative">
      <div className="absolute top-4 left-4 z-10 flex gap-3">
        <button
          onClick={handleEnterVR}
          className="px-6 py-3 bg-black border border-neutral-700 text-white font-semibold rounded-lg shadow-lg transition-colors"
        >
          Enter VR
        </button>
        <button
          onClick={handleEnterAR}
          className="px-6 py-3 bg-black border border-neutral-700  text-white font-semibold rounded-lg shadow-lg transition-colors"
        >
          Enter AR
        </button>
      </div>
      <div className="w-full h-screen">
        <Canvas
          gl={{
            antialias: true,
            alpha: true,
          }}
          frameloop="always"
        >
          <XR store={store}>
            <Scene />
          </XR>
        </Canvas>
      </div>
    </main>
  )
}
