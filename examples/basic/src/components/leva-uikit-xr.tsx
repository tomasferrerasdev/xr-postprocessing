import { Container, Text, Root } from '@react-three/uikit'
import { signal, computed, Signal } from '@preact/signals-core'
import {
  useState,
  useRef,
  useEffect,
  useMemo,
  useSyncExternalStore,
  memo,
  useCallback,
} from 'react'
import { Vector3 } from 'three'

// Custom hook to properly subscribe to Preact signals in React
function useSignal<T>(signalInstance: Signal<T>): T {
  return useSyncExternalStore(
    (callback) => {
      return signalInstance.subscribe(callback)
    },
    () => signalInstance.value,
    () => signalInstance.value,
  )
}

// Types for control configurations
type SelectConfig<T extends string = string> = {
  value: T
  options: readonly T[] | T[]
}

type SliderConfig = {
  value: number
  min: number
  max: number
  step: number
}

type ControlConfig = SelectConfig<any> | SliderConfig

type ControlsSchema = Record<string, ControlConfig>

// Extract the value type from a control config - improved inference
type ExtractValue<T> = T extends { options: any }
  ? T extends { value: infer V }
    ? V
    : string
  : T extends { value: infer V }
  ? V
  : never

// Helper to determine control type
function isSelectConfig(config: ControlConfig): config is SelectConfig {
  return 'options' in config
}

// Hook to create and manage XR controls with proper type inference
export function useXRControls<T extends ControlsSchema>(schema: T) {
  const controlsRef = useRef<Record<string, Signal<any>>>({})

  // Initialize signals once
  if (Object.keys(controlsRef.current).length === 0) {
    Object.entries(schema).forEach(([key, config]) => {
      controlsRef.current[key] = signal(config.value)
    })
  }

  // Create the return object with signal values
  const controls = useMemo(() => {
    const result: any = {}
    Object.keys(schema).forEach((key) => {
      result[key] = controlsRef.current[key]
    })
    return result as { [K in keyof T]: Signal<ExtractValue<T[K]>> }
  }, [schema])

  return controls
}

// Hook to get current values from controls with proper type inference
export function useXRControlValues<T extends ControlsSchema>(controls: {
  [K in keyof T]: Signal<ExtractValue<T[K]>>
}) {
  const result: Record<string, any> = {}

  for (const key in controls) {
    // eslint-disable-next-line react-hooks/rules-of-hooks
    result[key] = useSignal(controls[key])
  }

  return result as { [K in keyof T]: ExtractValue<T[K]> }
}

interface LevaUikitXrProps {
  schema: ControlsSchema
  controls: Record<string, Signal<any>>
  position?: [number, number, number]
  rotation?: [number, number, number]
}

export const LevaUikitXr = ({
  schema,
  controls,
  position = [2, 1, -1],
  rotation = [0, -1, 0],
}: LevaUikitXrProps) => {
  const formatValue = useCallback((v: number) => v.toFixed(2), [])

  return (
    <group position={position} rotation={rotation}>
      <Root pixelSize={0.001} sizeX={1.2} sizeY={1.08}>
        <Container
          width="100%"
          height="100%"
          backgroundColor="#292D39"
          flexDirection="column"
          borderRadius={40}
          padding={0}
        >
          <Container
            height={130}
            width={'100%'}
            backgroundColor="#292D39"
            borderRadius={40}
          ></Container>
          <Container
            flexGrow={1}
            width={'100%'}
            backgroundColor="#181C20"
            borderTopRadius={40}
            paddingY={48}
            flexDirection="column"
            gap={40}
          >
            {Object.entries(schema).map(([key, config]) => {
              if (isSelectConfig(config)) {
                return (
                  <Select
                    key={key}
                    defaultValue={config.value}
                    options={Array.from(config.options)}
                    label={key}
                    onValueChange={(value) => {
                      controls[key].value = value
                    }}
                  />
                )
              } else {
                const sliderConfig = config as SliderConfig
                return (
                  <Slider
                    key={key}
                    label={key}
                    min={sliderConfig.min}
                    max={sliderConfig.max}
                    step={sliderConfig.step}
                    defaultValue={sliderConfig.value}
                    onValueChange={(value) => {
                      controls[key].value = value
                    }}
                    format={formatValue}
                  />
                )
              }
            })}
          </Container>
        </Container>
      </Root>
    </group>
  )
}

const Select = ({
  label,
  options,
  defaultValue,
  onValueChange,
}: {
  label: string
  options: string[]
  defaultValue: string
  onValueChange?: (value: string) => void
}) => {
  const [isOpen, setIsOpen] = useState(false)
  const [selectedValue, setSelectedValue] = useState(defaultValue)

  const handleOptionClick = useCallback(
    (option: string) => {
      setSelectedValue(option)
      setIsOpen(false)
      onValueChange?.(option)
    },
    [onValueChange],
  )

  return (
    <Container paddingX={40} flexDirection="row">
      <Text fontSize={38} color={'#8C92A4'} width={'50%'}>
        {label}
      </Text>
      <Container onClick={() => setIsOpen(!isOpen)} width={'100%'} positionType="relative">
        <Container width={'100%'} backgroundColor={'#373C4B'} padding={16} borderRadius={10}>
          <Text fontSize={38} color={'#8C92A4'}>
            {selectedValue}
          </Text>
        </Container>
        {isOpen && (
          <Container
            positionType="absolute"
            backgroundColor={'#171717'}
            width={'100%'}
            positionTop={90}
            positionLeft={0}
            padding={16}
            borderRadius={10}
            flexDirection="column"
            gap={16}
          >
            {options.map((option) => (
              <Container
                key={option}
                onClick={(e: any) => {
                  e.stopPropagation()
                  handleOptionClick(option)
                }}
                padding={16}
                backgroundColor={'#373C4B'}
                borderRadius={10}
              >
                <Text fontSize={38} color={'#8C92A4'}>
                  {option}
                </Text>
              </Container>
            ))}
          </Container>
        )}
      </Container>
    </Container>
  )
}

interface SliderProps {
  label?: string
  min?: number
  max?: number
  step?: number
  defaultValue?: number
  onValueChange?: (value: number) => void
  format?: (value: number) => string
}

class SliderState {
  public valueSignal: Signal<number>
  public percentageSignal: Signal<number>
  private min: number
  private max: number
  private step: number
  private onValueChange?: (value: number) => void

  constructor(
    defaultValue: number,
    min: number,
    max: number,
    step: number,
    onValueChange?: (value: number) => void,
  ) {
    this.min = min
    this.max = max
    this.step = step
    this.onValueChange = onValueChange
    this.valueSignal = signal(defaultValue)
    this.percentageSignal = computed(() => {
      const range = this.max - this.min
      return (100 * (this.valueSignal.value - this.min)) / range
    })
  }

  setValue(point: Vector3, trackRef: any) {
    if (!trackRef) return

    const localPoint = new Vector3().copy(point)
    trackRef.worldToLocal(localPoint)

    const normalizedX = localPoint.x + 0.5
    const clampedX = Math.max(0, Math.min(1, normalizedX))

    const newValue =
      Math.round((clampedX * (this.max - this.min) + this.min) / this.step) * this.step
    const clampedValue = Math.max(this.min, Math.min(this.max, newValue))

    this.valueSignal.value = clampedValue
    this.onValueChange?.(clampedValue)
  }
}

const Slider = memo(
  ({
    label = 'value',
    min = 0,
    max = 100,
    step = 0.01,
    defaultValue = 50,
    onValueChange,
    format = (v) => v.toFixed(2),
  }: SliderProps) => {
    // Create a stable slider state instance that persists across renders
    const sliderState = useMemo(
      () => new SliderState(defaultValue, min, max, step, onValueChange),
      [], // Empty deps - created once and never recreated
    )

    // Update callback reference when it changes
    useEffect(() => {
      ;(sliderState as any).onValueChange = onValueChange
    }, [onValueChange, sliderState])

    // Subscribe to signal changes
    const currentValue = useSignal(sliderState.valueSignal)
    const currentPercentage = useSignal(sliderState.percentageSignal)

    // Refs for drag handling
    const trackRef = useRef<any>(null)
    const isDragging = useRef(false)
    const downPointerId = useRef<number | undefined>(undefined)

    const handlePointerDown = (e: any) => {
      if (downPointerId.current != null) return

      downPointerId.current = e.pointerId
      isDragging.current = true
      sliderState.setValue(e.point, trackRef.current)

      if (e.target?.setPointerCapture) {
        e.target.setPointerCapture(e.pointerId)
      }
    }

    const handlePointerMove = (e: any) => {
      if (!isDragging.current || downPointerId.current !== e.pointerId) return
      sliderState.setValue(e.point, trackRef.current)
    }

    const handlePointerUp = (e: any) => {
      if (downPointerId.current == null) return

      downPointerId.current = undefined
      isDragging.current = false
      e.stopPropagation?.()
    }

    return (
      <Container paddingX={40} flexDirection="row">
        <Text fontSize={38} color={'#8C92A4'} width={'50%'}>
          {label}
        </Text>

        <Container width={'100%'} flexDirection="row" gap={48}>
          <Container
            ref={trackRef}
            borderRadius={10}
            width={'80%'}
            positionType="relative"
            alignItems={'center'}
            justifyContent={'center'}
            onPointerDown={handlePointerDown}
            onPointerMove={handlePointerMove}
            onPointerUp={handlePointerUp}
          >
            {/* Progress Bar (animated based on value) */}
            <Container
              backgroundColor={'#3C93FF'}
              borderRadius={10}
              positionType="absolute"
              positionTop={30}
              positionLeft={0}
              width={`${currentPercentage}%`}
              height={10}
            >
              {/* Thumb/Handle */}
              <Container
                backgroundColor={'#3C93FF'}
                borderRadius={10}
                width={30}
                height={60}
                positionType="absolute"
                positionTop={-24}
                positionRight={0}
              ></Container>
            </Container>

            {/* Track Background */}
            <Container
              backgroundColor={'#373C4B'}
              borderRadius={10}
              positionType="absolute"
              positionTop={30}
              positionLeft={0}
              width={'100%'}
              height={10}
            ></Container>
          </Container>

          {/* Value Display */}
          <Container backgroundColor={'#373C4B'} padding={16} borderRadius={10}>
            <Text fontSize={38} color={'#8C92A4'}>
              {format(currentValue)}
            </Text>
          </Container>
        </Container>
      </Container>
    )
  },
  (prevProps, nextProps) => {
    // Since we're using uncontrolled signals, we don't need to re-render
    // when parent state changes - the slider manages its own state
    return (
      prevProps.min === nextProps.min &&
      prevProps.max === nextProps.max &&
      prevProps.step === nextProps.step &&
      prevProps.label === nextProps.label &&
      prevProps.defaultValue === nextProps.defaultValue
    )
    // Note: we deliberately ignore onValueChange and format changes
    // to prevent re-renders. The callback ref is updated via useEffect.
  },
)
