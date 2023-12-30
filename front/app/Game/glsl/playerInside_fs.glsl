varying vec2 vUv;
uniform sampler2D tDiffuse;

void main() {
    vec2 texCoord = vUv;
    vec4 color = texture2D(tDiffuse, texCoord);

    // Mesh color linked to players are white, so we can use that to detect them
    if (color.r == 1. && color.g == 1. && color.b == 1.) {
        color = vec4(1., 0., 0., 1.);
    }

    gl_FragColor = color;
}