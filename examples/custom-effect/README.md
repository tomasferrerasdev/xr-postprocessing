# Custom Effect Example

This example demonstrates how to create a **custom postprocessing effect** for XR applications. The effect implemented here is a **Chromatic Aberration** effect that splits RGB channels to create a glitchy, retro look.

## What's Inside

### Custom Effect Implementation

The example includes two main files for the custom effect:

1. **`ChromaticAberrationEffect.ts`** - The core effect class that:

   - Extends the standard Three.js postprocessing pattern
   - Uses custom GLSL shaders for the visual effect
   - Implements the required methods: `render()`, `setSize()`, `dispose()`
   - Provides configurable parameters: `offset` and `angle`

2. **`ChromaticAberration.tsx`** - A React component wrapper that:
   - Integrates with the XREffectComposer
   - Manages effect lifecycle (creation, updates, disposal)
   - Provides a declarative API for use in React Three Fiber

### How It Works

The chromatic aberration effect works by:

1. Rendering the scene to a render target
2. Sampling the texture at slightly different UV coordinates for each color channel (R, G, B)
3. The offset is calculated based on distance from center, creating a radial effect
4. The angle parameter allows rotating the direction of the aberration

## Running the Example

```bash
# From the root of the monorepo
pnpm install
pnpm --filter custom-effect-example dev
```

Then open your browser to the URL shown in the terminal (usually `http://localhost:5173`).

## Creating Your Own Custom Effect

To create your own custom effect, follow this pattern:

### 1. Create the Effect Class

```typescript
import { Camera, Scene, ShaderMaterial, WebGLRenderer, WebGLRenderTarget } from 'three'
import { FullScreenQuad } from 'three/addons/postprocessing/Pass.js'

export class MyCustomEffect {
  private renderTarget: WebGLRenderTarget
  private shaderMaterial: ShaderMaterial
  private fsQuad: FullScreenQuad = new FullScreenQuad()

  constructor(/* your parameters */) {
    // Initialize render target
    this.renderTarget = new WebGLRenderTarget(width, height)

    // Create shader material with your custom shaders
    this.shaderMaterial = new ShaderMaterial({
      uniforms: {
        /* your uniforms */
      },
      vertexShader: YOUR_VERTEX_SHADER,
      fragmentShader: YOUR_FRAGMENT_SHADER,
    })

    this.fsQuad.material = this.shaderMaterial
  }

  dispose() {
    this.renderTarget.dispose()
    this.shaderMaterial.dispose()
    this.fsQuad.dispose()
  }

  setSize(width: number, height: number) {
    this.renderTarget.setSize(width, height)
  }

  render(renderer: WebGLRenderer, scene: Scene, camera: Camera) {
    // 1. Render scene to render target
    renderer.setRenderTarget(this.renderTarget)
    renderer.render(scene, camera)

    // 2. Disable XR and prepare for post-processing
    const oldXrEnabled = renderer.xr.enabled
    renderer.xr.enabled = false

    // 3. Apply your effect
    renderer.setRenderTarget(null)
    this.fsQuad.render(renderer)

    // 4. Restore settings
    renderer.xr.enabled = oldXrEnabled
  }
}
```

### 2. Create the React Component

```typescript
import { useEffect, useRef } from 'react'
import { MyCustomEffect } from './MyCustomEffect'
import { useEffectComposer } from 'xr-postprocessing'

export function MyEffect(
  {
    /* props */
  },
) {
  const { registerEffect, unregisterEffect } = useEffectComposer()
  const effectRef = useRef<MyCustomEffect | null>(null)

  useEffect(() => {
    const effect = new MyCustomEffect(/* params */)
    effectRef.current = effect
    registerEffect(effect)

    return () => {
      unregisterEffect(effect)
      effect.dispose()
    }
  }, [registerEffect, unregisterEffect])

  // Add useEffect hooks to update parameters

  return null
}
```

### 3. Use in Your App

```tsx
<Canvas>
  <XREffectComposer>
    <MyEffect />
  </XREffectComposer>
</Canvas>
```

## Key Concepts

- **Render Target**: A texture that the scene is rendered to before applying effects
- **Shader Material**: Contains your custom GLSL code for the visual effect
- **FullScreenQuad**: Renders the effect as a full-screen quad
- **XR Compatibility**: The effect handles XR mode by temporarily disabling `renderer.xr.enabled`

## Learn More

- Check out the other built-in effects in the library for more patterns
- Read the [Three.js postprocessing documentation](https://threejs.org/docs/#examples/en/postprocessing/EffectComposer)
- Experiment with different GLSL shaders to create unique effects
