import { useEffect, useRef } from 'react'
import { PixelateEffect } from '../pixelate/pixelate-effect'
import { useEffectComposer } from '../EffectComposer'

interface PixelateProps {
  pixelSize?: number
}

/**
 * Pixelate effect component
 */
export function Pixelate({ pixelSize = 8 }: PixelateProps) {
  const { registerEffect, unregisterEffect } = useEffectComposer()
  const effectRef = useRef<PixelateEffect | null>(null)

  useEffect(() => {
    const effect = new PixelateEffect(pixelSize)
    effectRef.current = effect
    registerEffect(effect)

    return () => {
      unregisterEffect(effect)
      effect.dispose()
    }
  }, [registerEffect, unregisterEffect, pixelSize])

  useEffect(() => {
    if (effectRef.current) {
      effectRef.current.setPixelSize(pixelSize)
    }
  }, [pixelSize])

  return null
}
