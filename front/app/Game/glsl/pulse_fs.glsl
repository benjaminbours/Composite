varying vec2 vUv;
uniform sampler2D tDiffuse;
uniform float time;
uniform vec2 lightPosition;
const int MAX_SAMPLES = 100;

void main() {
    vec2 texCoord = vUv;
    vec2 deltaTextCoord = texCoord - lightPosition;

    float r = length(deltaTextCoord) * 8.;
    vec3 color = vec3(1., 1., 1.);

    float a = pow(r, 2.0);
    float b = sin(r * 0.8 - 100.6);
    float c = sin(r - 0.10);
    float s = sin(a - time * 1.5 + b) * c;

    color *= abs(0.5 / (s * 5.8)) + 0.01;
    float alpha = 0.5 - smoothstep(0., 5., r);
    if(alpha < 0.) {
        alpha = 0.;
    }
    gl_FragColor = vec4(color, alpha);
}