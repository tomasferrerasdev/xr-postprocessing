import {
  Camera,
  Color,
  Scene,
  ShaderMaterial,
  SRGBColorSpace,
  Vector2,
  WebGLRenderer,
  WebGLRenderTarget,
} from 'three'
import { FullScreenQuad } from 'three/addons/postprocessing/Pass.js'

// Vertex shader - passes through UVs
const VERTEX_SHADER = `
varying vec2 vUv;

void main() {
  vUv = uv;
  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}
`

// Fragment shader - implements chromatic aberration effect
const FRAGMENT_SHADER = `
varying vec2 vUv;

uniform sampler2D readBuffer;
uniform vec2 resolution;
uniform float offset;
uniform float angle;

void main() {
  vec2 center = vec2(0.5, 0.5);
  vec2 direction = normalize(vUv - center);
  
  // Calculate offset based on distance from center
  float dist = length(vUv - center);
  
  // Rotate the direction by the angle
  float cosAngle = cos(angle);
  float sinAngle = sin(angle);
  vec2 rotatedDir = vec2(
    direction.x * cosAngle - direction.y * sinAngle,
    direction.x * sinAngle + direction.y * cosAngle
  );
  
  // Apply chromatic aberration by sampling at different offsets for each color channel
  float r = texture2D(readBuffer, vUv + rotatedDir * offset * dist * 0.02).r;
  float g = texture2D(readBuffer, vUv).g;
  float b = texture2D(readBuffer, vUv - rotatedDir * offset * dist * 0.02).b;
  
  gl_FragColor = vec4(r, g, b, 1.0);
}
`

/**
 * Custom Chromatic Aberration Effect
 * Splits RGB channels to create a glitchy, retro look
 * This is a completely custom effect not provided by the library
 */
export class ChromaticAberrationEffect {
  private resolution: Vector2
  private renderTarget: WebGLRenderTarget

  private clearColor: Color = new Color(0, 0, 0)
  private shaderMaterial: ShaderMaterial

  private _oldClearColor: Color = new Color()
  private fsQuad: FullScreenQuad = new FullScreenQuad()

  constructor(offset: number = 1.0, angle: number = 0, resolution?: Vector2) {
    this.resolution =
      resolution !== undefined ? new Vector2(resolution.x, resolution.y) : new Vector2(1024, 1024)

    // Create render target
    this.renderTarget = new WebGLRenderTarget(this.resolution.x, this.resolution.y, {
      colorSpace: SRGBColorSpace,
      samples: 4,
    })

    // Create shader material
    this.shaderMaterial = new ShaderMaterial({
      uniforms: {
        readBuffer: { value: this.renderTarget.texture },
        resolution: { value: new Vector2() },
        offset: { value: offset },
        angle: { value: angle },
      },
      vertexShader: VERTEX_SHADER,
      fragmentShader: FRAGMENT_SHADER,
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
    this.shaderMaterial.uniforms['readBuffer'].value = this.renderTarget.texture
    this.shaderMaterial.uniforms['resolution'].value.set(width, height)
  }

  setOffset(offset: number) {
    this.shaderMaterial.uniforms['offset'].value = offset
  }

  setAngle(angle: number) {
    this.shaderMaterial.uniforms['angle'].value = angle
  }

  render(renderer: WebGLRenderer, scene: Scene, camera: Camera) {
    const currentRenderTarget = renderer.getRenderTarget()

    // Render main scene
    renderer.setRenderTarget(this.renderTarget)
    renderer.render(scene, camera)

    // Disable XR rendering
    const oldXrEnabled = renderer.xr.enabled
    renderer.xr.enabled = false

    renderer.getClearColor(this._oldClearColor)
    const oldClearAlpha = renderer.getClearAlpha()
    const oldAutoClear = renderer.autoClear
    renderer.autoClear = false

    renderer.setClearColor(this.clearColor, 0)

    // Render with chromatic aberration effect into back buffer
    renderer.setRenderTarget(currentRenderTarget)
    if (renderer.xr.isPresenting) {
      renderer.setViewport(0, 0, currentRenderTarget!.width, currentRenderTarget!.height)
    }
    this.fsQuad.render(renderer)

    // Restore renderer settings
    renderer.setClearColor(this._oldClearColor, oldClearAlpha)
    renderer.autoClear = oldAutoClear
    renderer.xr.enabled = oldXrEnabled
  }
}
