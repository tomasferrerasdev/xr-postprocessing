# xr-postprocessing

🎨 **Declarative WebXR-compatible postprocessing effects for React Three Fiber**

Bring stunning visual effects to your VR/AR experiences with stereo-aware postprocessing effects that work seamlessly in WebXR. Built for React Three Fiber and inspired by [@pmndrs/postprocessing](https://github.com/pmndrs/react-postprocessing).

## ✨ Features

- 🥽 **WebXR Compatible** - Works in VR, AR, and standard 3D rendering
- 👁️ **Stereo-Aware** - Effects render correctly for both eyes in immersive mode
- ⚛️ **Declarative** - Simple React components that integrate with React Three Fiber
- 🎛️ **Customizable** - Extensive parameters to tweak each effect
- 🔌 **Extensible** - Easy to create custom effects
- 🚀 **Performance** - Optimized for real-time rendering

## 📦 Installation

```bash
npm install three @react-three/fiber xr-postprocessing@latest 
# or
pnpm add three @react-three/fiber xr-postprocessing@latest
# or
yarn add three @react-three/fiber xr-postprocessing@latest
```

## 🎮 Quick Start

```tsx
import { Canvas } from '@react-three/fiber'
import { XR, createXRStore } from '@react-three/xr'
import { XREffectComposer, Bloom, Sobel } from 'xr-postprocessing'

const store = createXRStore()

function App() {
  return (
    <>
      <button onClick={() => store.enterVR()}>Enter VR</button>
      <Canvas>
        <XR store={store}>
          {/* your scene */}
          <mesh>
            <boxGeometry />
            <meshStandardMaterial />
          </mesh>

          {/* postprocessing effects */}
          <XREffectComposer>
            <Bloom strength={1.5} threshold={0.8} />
          </XREffectComposer>
        </XR>
      </Canvas>
    </>
  )
}
```

## 🎨 Available Effects

### Bloom

Adds a glow to bright areas of the scene.

```tsx
<Bloom
  strength={1.0} // Bloom intensity (default: 1.0)
  threshold={0.8} // Luminosity threshold (default: 0.8)
  radius={1.0} // Bloom radius (default: 1.0)
  steps={5} // Number of blur steps (default: 5)
/>
```

### UnrealBloom

Unreal Engine-style bloom with more artistic control.

```tsx
<UnrealBloom
  strength={0.2} // Bloom intensity (default: 0.2)
  radius={0.0} // Bloom radius (default: 0.0)
  threshold={0.5} // Luminosity threshold (default: 0.5)
/>
```

### Sobel

Edge detection effect for a cel-shaded or outlined look.

```tsx
<Sobel />
```

### Blur

Applies a blur effect to the entire scene.

```tsx
<Blur
  iterations={5} // Number of blur passes (default: 5)
/>
```

### Pixelate

Creates a pixelated/mosaic effect.

```tsx
<Pixelate
  pixelSize={8} // Size of pixels (default: 8)
/>
```

## 🔧 Advanced Usage

### Conditional Effects

```tsx
const [effectEnabled, setEffectEnabled] = useState(true)

<XREffectComposer enabled={effectEnabled}>
  <Bloom strength={1.5} />
</XREffectComposer>
```

### Combining Multiple Effects

Note: Currently only the first effect in the composer is rendered. For multiple effects, you'll need to create a custom effect that chains them.

```tsx
<XREffectComposer>
  <Bloom strength={1.5} threshold={0.8} />
  {/* Only one effect is applied at a time */}
</XREffectComposer>
```

### Creating Custom Effects

See the [custom-effect example](./examples/custom-effect/README.md) for a complete guide on creating your own effects.

Basic structure:

```tsx
// 1. Create effect class implementing XREffect interface
class MyEffect implements XREffect {
  render(renderer: WebGLRenderer, scene: Scene, camera: Camera) {
    // Your rendering logic
  }

  setSize(width: number, height: number) {
    // Handle resize
  }

  dispose() {
    // Cleanup resources
  }
}

// 2. Create React component
export function MyEffect() {
  const { registerEffect, unregisterEffect } = useEffectComposer()

  useEffect(() => {
    const effect = new MyEffect()
    registerEffect(effect)
    return () => {
      unregisterEffect(effect)
      effect.dispose()
    }
  }, [])

  return null
}
```

## 🧪 Examples

### Basic Example

A complete VR/AR demo with all built-in effects and UI controls.

```bash
cd examples/basic
pnpm install
pnpm dev
```

### Custom Effect Example

Learn how to create custom postprocessing effects with a chromatic aberration example.

```bash
cd examples/custom-effect
pnpm install
pnpm dev
```

## 🎯 Requirements

- React 18+
- Three.js 0.160+
- @react-three/fiber 8+
- @react-three/xr for WebXR functionality

## 🤔 How It Works

Unlike traditional postprocessing libraries that may break in WebXR stereo rendering, xr-postprocessing is designed from the ground up for XR:

1. **Stereo-Aware Rendering**: Effects correctly handle the left and right eye rendering passes in VR/AR
2. **XR Session Management**: Automatically adapts to XR session starts/ends and resizes
3. **Performance Optimized**: Minimal overhead for real-time VR/AR frame rates

## 🛠️ Development

```bash
# Install dependencies
pnpm install

# Build the library
pnpm build

# Run examples
pnpm dev
```

## 📄 License

MIT © 2025

## 🙏 Credits

Heavily inspired by [@pmndrs/postprocessing](https://github.com/pmndrs/react-postprocessing) and built for the amazing [@react-three/fiber](https://github.com/pmndrs/react-three-fiber) ecosystem.
