varying vec4 vLastPosition;

void main(){
    vec2 position = gl_PointCoord - vec2(.5, .5);
    float r = sqrt(dot(position * 2.0, position * 2.0));
    r = 1.0 - r;
    if(vLastPosition.y < 0.0) {
        discard;
    }

    // this condition is there to render only a circle in the middle of a group of pixel
    // Without it we have black rectangle around point
    if (r > 0.0){
        gl_FragColor = vec4(
            1.0,
            1.0,
            1.0,
            r
        );
    }


}
