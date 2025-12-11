import { useEffect, useRef } from 'react'
import { SobelEffect } from '../sobel/sobel-effect'
import { useEffectComposer } from '../EffectComposer'

/**
 * Sobel edge detection effect component
 */
export function Sobel() {
  const { registerEffect, unregisterEffect } = useEffectComposer()
  const effectRef = useRef<SobelEffect | null>(null)

  useEffect(() => {
    const effect = new SobelEffect()
    effectRef.current = effect
    registerEffect(effect)

    return () => {
      unregisterEffect(effect)
      effect.dispose()
    }
  }, [registerEffect, unregisterEffect])

  return null
}
