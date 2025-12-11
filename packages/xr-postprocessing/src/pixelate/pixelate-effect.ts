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

import VERTEX_SHADER from './glsl/default.vert'
import FRAGMENT_SHADER from './glsl/pixelate.frag'

export class PixelateEffect {
  private resolution: Vector2
  private renderTarget: WebGLRenderTarget

  private clearColor: Color = new Color(0, 0, 0)
  private shaderMaterial: ShaderMaterial

  private _oldClearColor: Color = new Color()
  private fsQuad: FullScreenQuad = new FullScreenQuad()

  constructor(pixelSize: number = 8, resolution?: Vector2) {
    this.resolution =
      resolution !== undefined ? new Vector2(resolution.x, resolution.y) : new Vector2(256, 256)

    // render target
    this.renderTarget = new WebGLRenderTarget(this.resolution.x, this.resolution.y, {
      colorSpace: SRGBColorSpace,
      samples: 4,
    })

    // pixelate material
    this.shaderMaterial = new ShaderMaterial({
      uniforms: {
        readBuffer: { value: this.renderTarget.texture },
        resolution: { value: new Vector2() },
        pixelSize: { value: pixelSize },
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

  setPixelSize(pixelSize: number) {
    this.shaderMaterial.uniforms['pixelSize'].value = pixelSize
  }

  render(renderer: WebGLRenderer, scene: Scene, camera: Camera) {
    const currentRenderTarget = renderer.getRenderTarget()

    //  main scene
    renderer.setRenderTarget(this.renderTarget)
    renderer.render(scene, camera)

    // disable XR rendering
    const oldXrEnabled = renderer.xr.enabled
    renderer.xr.enabled = false

    renderer.getClearColor(this._oldClearColor)
    const oldClearAlpha = renderer.getClearAlpha()
    const oldAutoClear = renderer.autoClear
    renderer.autoClear = false

    renderer.setClearColor(this.clearColor, 0)

    // render with pixelate effect into back buffer
    renderer.setRenderTarget(currentRenderTarget)
    if (renderer.xr.isPresenting) {
      renderer.setViewport(0, 0, currentRenderTarget!.width, currentRenderTarget!.height)
    }
    this.fsQuad.render(renderer)

    // restore renderer settings
    renderer.setClearColor(this._oldClearColor, oldClearAlpha)
    renderer.autoClear = oldAutoClear
    renderer.xr.enabled = oldXrEnabled
  }
}
