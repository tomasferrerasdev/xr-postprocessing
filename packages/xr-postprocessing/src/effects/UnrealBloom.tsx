import { useEffect, useRef } from 'react'
import { UnrealBloomEffect } from '../bloom/unreal-bloom-effect'
import { useEffectComposer } from '../EffectComposer'

interface UnrealBloomProps {
  strength?: number
  threshold?: number
  radius?: number
}

/**
 * Unreal Engine style Bloom effect component
 *
 * @param strength - Bloom intensity (default: 0.2)
 * @param threshold - Luminosity threshold (default: 0.5)
 * @param radius - Bloom radius (default: 0.0)
 */
export function UnrealBloom({ strength = 0.2, threshold = 0.5, radius = 0.0 }: UnrealBloomProps) {
  const { registerEffect, unregisterEffect } = useEffectComposer()
  const effectRef = useRef<UnrealBloomEffect | null>(null)

  useEffect(() => {
    if (effectRef.current) {
      unregisterEffect(effectRef.current)
      effectRef.current.dispose()
    }

    const effect = new UnrealBloomEffect(undefined, strength, radius, threshold)
    effectRef.current = effect
    registerEffect(effect)

    return () => {
      if (effectRef.current) {
        unregisterEffect(effectRef.current)
        effectRef.current.dispose()
      }
    }
  }, [strength, threshold, radius, registerEffect, unregisterEffect])

  return null
}
