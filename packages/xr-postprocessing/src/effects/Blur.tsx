import { useEffect, useRef } from 'react'
import { BlurEffect } from '../blur/blur-effect'
import { useEffectComposer } from '../EffectComposer'

/**
 * Blur effect component using dual-filter downsampling/upsampling
 *
 * Note: The blur effect currently has fixed parameters.
 * intensity is controlled by the shader implementation.
 */
export function Blur() {
  const { registerEffect, unregisterEffect } = useEffectComposer()
  const effectRef = useRef<BlurEffect | null>(null)

  useEffect(() => {
    const effect = new BlurEffect()
    effectRef.current = effect
    registerEffect(effect)

    return () => {
      unregisterEffect(effect)
      effect.dispose()
    }
  }, [registerEffect, unregisterEffect])

  return null
}
