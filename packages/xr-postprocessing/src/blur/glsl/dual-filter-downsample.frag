uniform sampler2D previousTexture;
uniform vec2 previousTextureRes;

varying vec2 vUv;

void main() {
    vec2 halfpixel = 0.5 / (previousTextureRes / 2.0);
    float offset = 3.0;

    vec4 sum = texture2D(previousTexture, vUv) * 4.0;
    sum += texture2D(previousTexture, vUv - halfpixel.xy * offset);
    sum += texture2D(previousTexture, vUv + halfpixel.xy * offset);
    sum += texture2D(previousTexture, vUv + vec2(halfpixel.x, -halfpixel.y) * offset);
    sum += texture2D(previousTexture, vUv - vec2(halfpixel.x, -halfpixel.y) * offset);

    gl_FragColor = sum / 8.0;
}

