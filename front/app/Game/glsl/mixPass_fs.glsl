uniform sampler2D baseTexture;
uniform sampler2D addTexture;
varying vec2 vUv;

void main() {
    vec4 baseColor = texture2D( baseTexture, vUv );
    vec4 addColor = texture2D( addTexture, vUv );

    vec4 mixedColor = ( baseColor + vec4( 1.0 ) * addColor );

    // if the color is pure red, which means that it is the player inside helper
    // we do not want to mix the color, we want to keep the pure red
    if ( addColor.r == 1. ) {
        mixedColor = addColor;
    }
    gl_FragColor = mixedColor;
}