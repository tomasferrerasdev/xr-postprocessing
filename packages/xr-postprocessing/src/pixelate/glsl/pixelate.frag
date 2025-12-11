varying vec2 vUv;

uniform sampler2D readBuffer;
uniform vec2 resolution;
uniform float pixelSize;

void main() {
    vec2 pixelatedUv = floor(vUv * resolution / pixelSize) * pixelSize / resolution;
    vec4 color = texture2D(readBuffer, pixelatedUv);
    gl_FragColor = color;
}

