uniform vec3 color;
varying vec4 vPosition;

void main() {
    vec2 position = gl_PointCoord - vec2(.5, .5);
    float size = 4.0;
    float r = sqrt(dot(position * size, position * size));
    r = 1.0 - r;

    if(r < 0.0) {
        discard;
    }

    vec4 color = vec4(color.x, color.y, color.z, r);
    gl_FragColor = color;
}
