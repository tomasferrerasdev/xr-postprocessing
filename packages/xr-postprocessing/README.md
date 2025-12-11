# xr-postprocessing

🥽 WebXR-compatible postprocessing effects for React Three Fiber. Stereo-aware visual effects that work in VR, AR, and standard 3D.

## Installation

```bash
npm install xr-postprocessing
# or
pnpm add xr-postprocessing
```

## Quick Start

```tsx
import { Canvas } from '@react-three/fiber'
import { createXRStore, XR } from '@react-three/xr'
import { XREffectComposer, Bloom } from 'xr-postprocessing'

const store = createXRStore()

function App() {
  return (
    <>
      <button onClick={() => store.enterVR()}>Enter VR</button>
      <button onClick={() => store.enterAR()}>Enter AR</button>

      <Canvas>
        <XR store={store}>
          {/* your scene */}
          <ambientLight />
          <mesh>
            <boxGeometry />
            <meshStandardMaterial color="hotpink" />
          </mesh>

          {/* add effects inside XR */}
          <XREffectComposer>
            <Bloom strength={1.5} threshold={0.8} />
          </XREffectComposer>
        </XR>
      </Canvas>
    </>
  )
}
```

## Available Effects

### Bloom

```tsx
<Bloom strength={1.0} threshold={0.8} radius={1.0} steps={5} />
```

### UnrealBloom

unreal engine style bloom with more artistic control

```tsx
<UnrealBloom strength={0.2} radius={0.0} threshold={0.5} />
```

### Sobel

edge detection for a cel-shaded or outlined look

```tsx
<Sobel />
```

### Blur

```tsx
<Blur />
```

### Pixelate

```tsx
<Pixelate pixelSize={8} />
```

## Exports

- `XREffectComposer` - main composer component
- `useEffectComposer` - hook for custom effects
- `Bloom` - bloom effect
- `UnrealBloom` - unreal-style bloom
- `Sobel` - edge detection
- `Blur` - blur effect
- `Pixelate` - pixelation effect

## Requirements

- React 18+
- Three.js 0.160+
- @react-three/fiber 8+
- @react-three/xr (for WebXR)

## License

MIT
