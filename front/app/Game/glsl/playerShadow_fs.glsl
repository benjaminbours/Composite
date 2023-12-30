uniform float opacity;

void main(){
    vec2 position = gl_PointCoord - vec2(.5,.5);
    float r = sqrt(dot(position*2.0, position*2.0));
    r = 1.0-r;
    if (r > 0.0){
        // if(vSelection > 512. / 2.0){
        //     gl_FragColor = vec4(vec3(0.0),1.- vPosition.y/30.);
        // }else{
        //     gl_FragColor = vec4(0.,0.,0.,1.);
        // }

        gl_FragColor = vec4(vec3(0.),1.0);

    }

    // if(lastPosition.y < 0.0 && vSelection > 1024.0) {
    //
    //     discard;
    //
    // }

}
