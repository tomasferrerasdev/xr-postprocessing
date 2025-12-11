import { useEffect, useRef } from 'react'
import { ChromaticAberrationEffect } from './ChromaticAberrationEffect'
import { useEffectComposer } from 'xr-postprocessing'

interface ChromaticAberrationProps {
  offset?: number
  angle?: number
}

/**
 * Chromatic Aberration effect component
 * Creates an RGB channel split effect for a glitchy retro look
 *
 * @example
 * ```tsx
 * <XREffectComposer>
 *   <ChromaticAberration offset={1.5} angle={0} />
 * </XREffectComposer>
 * ```
 */
export function ChromaticAberration({ offset = 1.0, angle = 0 }: ChromaticAberrationProps) {
  const { registerEffect, unregisterEffect } = useEffectComposer()
  const effectRef = useRef<ChromaticAberrationEffect | null>(null)

  useEffect(() => {
    const effect = new ChromaticAberrationEffect(offset, angle)
    effectRef.current = effect
    registerEffect(effect)

    return () => {
      unregisterEffect(effect)
      effect.dispose()
    }
  }, [registerEffect, unregisterEffect])

  // Update offset when it changes
  useEffect(() => {
    if (effectRef.current) {
      effectRef.current.setOffset(offset)
    }
  }, [offset])

  // Update angle when it changes
  useEffect(() => {
    if (effectRef.current) {
      effectRef.current.setAngle(angle)
    }
  }, [angle])

  return null
}
