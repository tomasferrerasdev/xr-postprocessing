# xr-postprocessing

WebXR-compatible postprocessing effects for React Three Fiber.

## Installation

```bash
npm install xr-postprocessing
```

## Usage

```tsx
import { XREffectComposer, Bloom } from 'xr-postprocessing'
;<XREffectComposer>
  <Bloom strength={1.5} />
</XREffectComposer>
```

See the [main repository](../../README.md) for complete documentation and examples.

## Exports

- `XREffectComposer` - Main composer component
- `useEffectComposer` - Hook for accessing the effect composer context
- `Bloom` - Bloom effect component
- `UnrealBloom` - Unreal-style bloom effect
- `Sobel` - Edge detection effect
- `Blur` - Blur effect
- `Pixelate` - Pixelation effect

## License

MIT
