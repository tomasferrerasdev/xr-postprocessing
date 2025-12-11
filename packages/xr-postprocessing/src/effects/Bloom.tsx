import { useEffect, useRef } from 'react'
import { BasicBloomEffect } from '../bloom/basic-bloom-effect'
import { useEffectComposer } from '../EffectComposer'

interface BloomProps {
  strength?: number
  threshold?: number
  radius?: number
  steps?: number
}

/**
 *  Bloom effect component
 *
 * @param strength - Bloom intensity (default: 1.0)
 * @param threshold - Luminosity threshold for bloom (default: 0.8)
 * @param radius - Bloom radius (default: 1.0)
 * @param steps - Number of blur steps (default: 5)
 */
export function Bloom({ strength = 1.0, threshold = 0.8, radius = 1.0, steps = 5 }: BloomProps) {
  const { registerEffect, unregisterEffect } = useEffectComposer()
  const effectRef = useRef<BasicBloomEffect | null>(null)

  useEffect(() => {
    const effect = new BasicBloomEffect(undefined, strength, radius, threshold, steps)
    effectRef.current = effect
    registerEffect(effect)

    return () => {
      unregisterEffect(effect)
      effect.dispose()
    }
  }, [])

  useEffect(() => {
    if (effectRef.current) {
      effectRef.current.strength = strength
      effectRef.current.threshold = threshold
      effectRef.current.radius = radius
      // Note: steps cannot be changed after initialization
    }
  }, [strength, threshold, radius])

  return null
}
