import { useFrame, useThree } from '@react-three/fiber'
import { createContext, useContext, useEffect, useRef, ReactNode } from 'react'
import * as THREE from 'three'

export interface XREffect {
  render(renderer: THREE.WebGLRenderer, scene: THREE.Scene, camera: THREE.Camera): void
  setSize(width: number, height: number): void
  dispose(): void
}

interface EffectComposerContextValue {
  registerEffect: (effect: XREffect) => void
  unregisterEffect: (effect: XREffect) => void
}

const EffectComposerContext = createContext<EffectComposerContextValue | undefined>(undefined)

export const useEffectComposer = () => {
  const context = useContext(EffectComposerContext)
  if (!context) {
    throw new Error('useEffectComposer must be used within an EffectComposer')
  }
  return context
}

interface EffectComposerProps {
  children: ReactNode
  enabled?: boolean
  renderPriority?: number
}

/**
 * small xr effect composer for post-processing
 *
 * usage:
 * ```tsx
 * <XREffectComposer>
 *   <Bloom strength={1.5} />
 *   <Sobel />
 * </XREffectComposer>
 * ```
 */
export function XREffectComposer({
  children,
  enabled = true,
  renderPriority = 1,
}: EffectComposerProps) {
  const { gl, size } = useThree()
  const effectsRef = useRef<Set<XREffect>>(new Set())

  // keep track of a new effect
  const registerEffect = (effect: XREffect) => {
    effectsRef.current.add(effect)

    // make sure the new effect matches the current render size
    const renderSize = gl.getSize(new THREE.Vector2())
    effect.setSize(renderSize.x, renderSize.y)
  }

  // stop tracking an effect
  const unregisterEffect = (effect: XREffect) => {
    effectsRef.current.delete(effect)
  }

  // react to size changes and xr session changes
  useEffect(() => {
    const handleResize = () => {
      // get the renderer size as used in xr mode
      const renderSize = gl.getSize(new THREE.Vector2())
      const width = renderSize.x
      const height = renderSize.y

      // update every registered effect with the latest size
      effectsRef.current.forEach((effect) => {
        effect.setSize(width, height)
      })
    }

    handleResize()

    // listen to xr session events so effects stay in sync
    gl.xr.addEventListener('sessionstart', handleResize)
    gl.xr.addEventListener('sessionend', handleResize)

    return () => {
      gl.xr.removeEventListener('sessionstart', handleResize)
      gl.xr.removeEventListener('sessionend', handleResize)
    }
  }, [gl, size])

  // render once with post-processing instead of the default pass
  useFrame((state) => {
    if (!enabled || effectsRef.current.size === 0) {
      return // let r3f do its normal render
    }

    // for now we just use the first registered effect
    const effects = Array.from(effectsRef.current)
    const effect = effects[0]

    if (effect) {
      // make sure we clear between frames
      state.gl.autoClear = true

      // let the effect handle the render
      effect.render(state.gl, state.scene as any, state.camera)

      // returning true skips r3f's default render
      return true
    }
  }, renderPriority)

  const contextValue: EffectComposerContextValue = {
    registerEffect,
    unregisterEffect,
  }

  return (
    <EffectComposerContext.Provider value={contextValue}>{children}</EffectComposerContext.Provider>
  )
}
