varying vec2 vUv;
uniform sampler2D iChannel0;
uniform float time;
uniform vec3 color;

const float RETICULATION = 3.;
const float NB_ARMS = 5.;
const float COMPR = .1;
const float SPEED = 0.1;
const float GALAXY_R = 1. / 5.;
const float BULB_R = 1. / 4.;
const vec4 GALAXY_COL = vec4(0., 0., 0., 1.);
const vec4 BULB_COL = vec4(1., .8, .8, 1.);
const vec4 SKY_COL = 0.5 * vec4(.1, .1, .1, 0.);

// --- base noise
float tex(vec2 uv) {
    float n = texture2D(iChannel0, uv).r;
    return 1. - abs(2. * n - 1.);
}

// --- perlin turbulent noise + rotation
float noise(vec2 uv, float t) {
    float v = 0.;
    float a = -SPEED * t;
    float co = cos(a);
    float si = sin(a);
    mat2 M = mat2(co, -si, si, co);
    const int L = 7;
    float s = 1.;
    for(int i = 0; i < L; i++) {
        uv = M * uv;
        float b = tex(uv * s);
        v += 1. / s * pow(b, RETICULATION);
        s *= 2.;
    }
    return v / 2.;
}

void main() {
    // hardcoded resolution
    vec2 channel0Resolution = vec2(256., 256.);

    float t = time;
    vec2 uv = vUv - vec2(.5, .5);
    vec4 col;
    float rho = length(uv);
    float ang = atan(uv.y, uv.x);
    float shear = 2. * log(rho);
    float c = cos(shear), s = sin(shear);
    mat2 R = mat2(c, -s, s, c);
    float r;
    r = rho / GALAXY_R;
    float dens = exp(-r * r);
    r = rho / BULB_R;
    float bulb = exp(-r * r);
    float phase = NB_ARMS * (ang - shear);
    ang = ang - COMPR * cos(phase) + SPEED * t;
    uv = rho * vec2(cos(ang), sin(ang));
    float spires = 3. + NB_ARMS * COMPR * sin(phase);
    dens *= 1. * spires;
    float gaz = noise(.09 * 1.2 * R * uv, t);
    float gaz_trsp = pow((1. - gaz * dens), 2.);
    // float ratio = .8 * uv.y / channel0Resolution.y;
    // float stars1 = texture2D(iChannel1, ratio * uv + .5).r;
    // float stars2 = texture2D(iChannel0, ratio * uv + .5).r;
    // float stars = pow(1. - (1. - stars1) * (1. - stars2), 5.);
    float stars = 0.;
    bulb = 0.;
    col = mix(vec4(0., 0., 0., 0.), gaz * vec4(color, 1.), dens);
    // col = mix(col, 1.2 * BULB_COL, bulb);

    vec2 position = uv;
    float r2 = sqrt(dot(uv * 2.0, uv * 2.0));
    r2 = 1.0 - r2;

    if(r2 > 0.0) {
        gl_FragColor = col;
    }
    // gl_FragColor = vec4(col.rgb, 1.);
    // gl_FragColor = col;

    // gl_FragColor = vec4(1., 0., 0., 1.);
}