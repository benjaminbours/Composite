void main(){
    vec2 position = gl_PointCoord-vec2(.5,.5);
    float r= sqrt(dot(position * 2., position * 2.));
    
    r = 1.0 - r;
    if(r > 0.0){
        gl_FragColor=vec4(vec3(0.),1.);
    } else {
        discard;
    }
}
