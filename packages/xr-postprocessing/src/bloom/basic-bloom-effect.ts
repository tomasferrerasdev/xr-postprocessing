import {
  Camera,
  Color,
  HalfFloatType,
  NoColorSpace,
  RGBAFormat,
  Scene,
  ShaderMaterial,
  Vector2,
  WebGLRenderer,
  WebGLRenderTarget,
} from 'three'
import { FullScreenQuad } from 'three/addons/postprocessing/Pass.js'

import VERTEX_SHADER from './glsl/default.vert'
import DOWNSAMPLE_FRAGMENT_SHADER from './glsl/dual-filter-downsample.frag'
import UPSAMPLE_FRAGMENT_SHADER from './glsl/dual-filter-upsample.frag'
import COMPOSITE_FRAGMENT_SHADER from './glsl/bloom-composite.frag'

const RENDER_TARGET_DEFAULTS = {
  type: HalfFloatType,
  format: RGBAFormat,
  depthBuffer: false,
} as const

export class BasicBloomEffect {
  private resolution: Vector2
  private resolutionFactor: number = 1.0

  public strength: number
  public radius: number
  public threshold: number

  private clearColor: Color = new Color(0, 0, 0)
  private steps: number = 5
  private downsampleRenderTargets: Array<WebGLRenderTarget> = []
  private upsampleRenderTargets: Array<WebGLRenderTarget> = []

  private downsampleMaterial: ShaderMaterial
  private upsampleMaterial: ShaderMaterial
  private compositeMaterial: ShaderMaterial

  private _oldClearColor: Color = new Color()
  private fsQuad: FullScreenQuad = new FullScreenQuad()

  constructor(
    resolution?: Vector2,
    strength?: number,
    radius?: number,
    threshold?: number,
    steps?: number,
  ) {
    this.strength = strength !== undefined ? strength : 1
    this.radius = radius !== undefined ? radius : 1
    this.threshold = threshold !== undefined ? threshold : 0.1
    this.steps = steps !== undefined ? steps : 5
    this.resolution =
      resolution !== undefined ? new Vector2(resolution.x, resolution.y) : new Vector2(256, 256)

    let resx = Math.round(this.resolution.x * this.resolutionFactor)
    let resy = Math.round(this.resolution.y * this.resolutionFactor)
    for (let i = 0; i < this.steps; i++) {
      const downsampleRenderTarget = new WebGLRenderTarget(resx, resy, {
        ...RENDER_TARGET_DEFAULTS,
        colorSpace: i === 0 ? NoColorSpace : NoColorSpace,
        depthBuffer: i === 0,
      })
      const upsampleRenderTarget = new WebGLRenderTarget(resx, resy, RENDER_TARGET_DEFAULTS)
      this.downsampleRenderTargets.push(downsampleRenderTarget)
      this.upsampleRenderTargets.push(upsampleRenderTarget)
      resx = Math.floor(resx / 2)
      resy = Math.floor(resy / 2)
    }

    this.downsampleMaterial = new ShaderMaterial({
      uniforms: {
        previousTexture: { value: null },
        previousTextureRes: { value: new Vector2() },
        luminosityThreshold: { value: 1.0 },
      },
      vertexShader: VERTEX_SHADER,
      fragmentShader: DOWNSAMPLE_FRAGMENT_SHADER,
    })
    this.upsampleMaterial = new ShaderMaterial({
      uniforms: {
        previousTexture: { value: null },
        previousTextureRes: { value: new Vector2() },
      },
      vertexShader: VERTEX_SHADER,
      fragmentShader: UPSAMPLE_FRAGMENT_SHADER,
    })
    this.compositeMaterial = new ShaderMaterial({
      uniforms: {
        blurTexture: { value: this.upsampleRenderTargets[0].texture },
        baseTexture: { value: this.downsampleRenderTargets[0].texture },
        bloomStrength: { value: strength },
      },
      vertexShader: VERTEX_SHADER,
      fragmentShader: COMPOSITE_FRAGMENT_SHADER,
    })
  }

  dispose() {
    for (let i = 0; i < this.steps; i++) {
      this.downsampleRenderTargets[i].dispose()
      this.upsampleRenderTargets[i].dispose()
    }

    this.downsampleMaterial.dispose()
    this.upsampleMaterial.dispose()

    this.fsQuad.dispose()
  }

  setSize(width: number, height: number) {
    let resx = Math.round(width * this.resolutionFactor)
    let resy = Math.round(height * this.resolutionFactor)

    for (let i = 0; i < this.steps; i++) {
      this.downsampleRenderTargets[i].setSize(resx, resy)
      this.upsampleRenderTargets[i].setSize(resx, resy)
      resx = Math.floor(resx / 2)
      resy = Math.floor(resy / 2)
    }
  }

  render(renderer: WebGLRenderer, scene: Scene, camera: Camera) {
    const currentRenderTarget = renderer.getRenderTarget()

    if (renderer.xr.isPresenting) {
      const xrCamera = renderer.xr.getCamera()
      if ('cameras' in xrCamera && Array.isArray(xrCamera.cameras)) {
        xrCamera.cameras.forEach((cam) => {
          if (cam.viewport) {
            cam.viewport.multiplyScalar(this.resolutionFactor)
          }
        })
      }
    }

    renderer.setRenderTarget(this.downsampleRenderTargets[0])
    renderer.render(scene, camera)

    if (renderer.xr.isPresenting) {
      const xrCamera = renderer.xr.getCamera()
      if ('cameras' in xrCamera && Array.isArray(xrCamera.cameras)) {
        xrCamera.cameras.forEach((cam) => {
          if (cam.viewport) {
            cam.viewport.divideScalar(this.resolutionFactor)
          }
        })
      }
    }

    const oldXrEnabled = renderer.xr.enabled
    renderer.xr.enabled = false

    renderer.getClearColor(this._oldClearColor)
    const oldClearAlpha = renderer.getClearAlpha()
    const oldAutoClear = renderer.autoClear
    renderer.autoClear = false

    renderer.setClearColor(this.clearColor, 0)

    this.fsQuad.material = this.downsampleMaterial
    this.downsampleMaterial.uniforms['previousTexture'].value =
      this.downsampleRenderTargets[0].texture
    this.downsampleMaterial.uniforms['previousTextureRes'].value.set(
      this.downsampleRenderTargets[0].width,
      this.downsampleRenderTargets[0].height,
    )
    this.downsampleMaterial.uniforms['luminosityThreshold'].value = this.threshold
    for (let i = 1; i < this.steps; i++) {
      renderer.setRenderTarget(this.downsampleRenderTargets[i])
      renderer.clear()
      this.fsQuad.render(renderer)

      this.downsampleMaterial.uniforms['previousTexture'].value =
        this.downsampleRenderTargets[i].texture
      this.downsampleMaterial.uniforms['previousTextureRes'].value.set(
        this.downsampleRenderTargets[i].width,
        this.downsampleRenderTargets[i].height,
      )
      this.downsampleMaterial.uniforms['luminosityThreshold'].value = 0.0
    }

    this.fsQuad.material = this.upsampleMaterial
    this.upsampleMaterial.uniforms['previousTexture'].value =
      this.downsampleRenderTargets[this.steps - 1].texture
    this.upsampleMaterial.uniforms['previousTextureRes'].value.set(
      this.downsampleRenderTargets[this.steps - 1].width,
      this.downsampleRenderTargets[this.steps - 1].height,
    )
    for (let i = this.steps - 2; i >= 0; i--) {
      renderer.setRenderTarget(this.upsampleRenderTargets[i])
      renderer.clear()
      this.fsQuad.render(renderer)

      this.upsampleMaterial.uniforms['previousTexture'].value =
        this.upsampleRenderTargets[i].texture
      this.upsampleMaterial.uniforms['previousTextureRes'].value.set(
        this.upsampleRenderTargets[i].width,
        this.upsampleRenderTargets[i].height,
      )
    }

    renderer.setRenderTarget(currentRenderTarget)
    renderer.clear()
    if (renderer.xr.isPresenting) {
      renderer.setViewport(0, 0, currentRenderTarget!.width, currentRenderTarget!.height)
    }
    this.fsQuad.material = this.compositeMaterial
    this.compositeMaterial.uniforms['bloomStrength'].value = this.strength
    this.fsQuad.render(renderer)

    renderer.setClearColor(this._oldClearColor, oldClearAlpha)
    renderer.autoClear = oldAutoClear
    renderer.xr.enabled = oldXrEnabled
  }
}
