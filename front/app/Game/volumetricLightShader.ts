import { Vector2 } from 'three';
import volumetricLightVS from './glsl/volumetricLight_vs.glsl';
import volumetricLightFS from './glsl/volumetricLight_fs.glsl';

export const volumetricLightShader = {
    uniforms: {
        tDiffuse: { value: null },
        lightPosition: { value: new Vector2(0.5, 0.5) },
        exposure: { value: 0.18 },
        decay: { value: 0.97 },
        density: { value: 0.8 },
        weight: { value: 0.5 },
        samples: { value: 100 },
    },

    vertexShader: volumetricLightVS,
    fragmentShader: volumetricLightFS,
};

export const additiveBlendingShader = {
    uniforms: {
        tDiffuse: { value: null },
        tAdd: { value: null },
    },

    vertexShader: [
        'varying vec2 vUv;',
        'void main() {',
        'vUv = uv;',
        'gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );',
        '}',
    ].join('\n'),

    fragmentShader: [
        'uniform sampler2D tDiffuse;',
        'uniform sampler2D tAdd;',
        'varying vec2 vUv;',
        'void main() {',
        'vec4 color = texture2D( tDiffuse, vUv );',
        'vec4 add = texture2D( tAdd, vUv );',
        'gl_FragColor = color + vec4( 1.0 ) * add;',
        '}',
    ].join('\n'),
};

export const mixShader = {
    uniforms: {
        baseTexture: { value: null },
        addTexture: { value: null },
    },

    vertexShader: [
        'varying vec2 vUv;',
        'void main() {',
        'vUv = uv;',
        'gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );',
        '}',
    ].join('\n'),

    fragmentShader: [
        'uniform sampler2D baseTexture;',
        'uniform sampler2D addTexture;',
        'varying vec2 vUv;',
        'void main() {',
        'gl_FragColor = ( texture2D( baseTexture, vUv ) + vec4( 1.0 ) * texture2D( addTexture, vUv ) );',
        '}',
    ].join('\n'),
};

// vec2 fUv = vUv * 2.0 - 1.0;
// float distance = length(fUv);
// vec4 vignette = vec4(vec3(clamp((1. - distance)*2.,0.,1.)), 1.);
// vec4 vignetteMask = mix(vignette,vec4(1.),min(amount,1.));

// THREE.showPlayerInLight = {
//     uniforms: {
//         tDiffuse: { type: 't', value: null },
//         tex: { type: 't', value: null },
//         width: { value: 0 },
//     },

//     vertexShader: [
//         'varying vec2 vUv;',
//         'void main() {',
//         'vUv = uv;',
//         'gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);',
//         '}',
//     ].join('\n'),

//     fragmentShader: [
//         'uniform sampler2D tDiffuse;',
//         'uniform sampler2D tex;',
//         'uniform float width;',
//         'varying vec2 vUv;',
//         'void main() {',
//         'vec4 color = texture2D (tDiffuse, vUv);',
//         'vec4 sum = vec4(0.);',
//         'sum += texture2D( tex, vec2( vUv.x - 3.2307692308 * width, vUv.y ) ) * 0.0702702703;',
//         'sum += texture2D( tex, vec2( vUv.x - 1.3846153846 * width, vUv.y ) ) * 0.3162162162;',
//         'sum += texture2D( tex, vec2( vUv.x, vUv.y ) ) * 0.2270270270;',
//         'sum += texture2D( tex, vec2( vUv.x + 1.3846153846 * width, vUv.y ) ) * 0.3162162162;',
//         'sum += texture2D( tex, vec2( vUv.x + 3.2307692308 * width, vUv.y ) ) * 0.0702702703;',
//         'vec4 sphereColor = vec4(vec3(.5),1.);',
//         'gl_FragColor = mix(color,sphereColor,sum.r * .7);',
//         // "gl_FragColor = vecTex;",
//         '}',
//     ].join('\n'),
// };

export const passThroughShader = {
    uniforms: {
        tDiffuse: { value: null },
    },

    vertexShader: [
        'varying vec2 vUv;',
        'void main() {',
        'vUv = uv;',
        'gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );',
        '}',
    ].join('\n'),

    fragmentShader: [
        'uniform sampler2D tDiffuse;',
        'varying vec2 vUv;',
        'void main() {',
        'gl_FragColor = texture2D( tDiffuse, vec2( vUv.x, vUv.y ) );',
        '}',
    ].join('\n'),
};
