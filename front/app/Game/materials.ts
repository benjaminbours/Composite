import { getRange } from '@benjaminbours/composite-core';
import {
    DoubleSide,
    MeshBasicMaterial,
    ShaderMaterial,
    Vector2,
    Vector3,
} from 'three';
// shaders
import playerShadowVS from './glsl/playerShadow_vs.glsl';
import playerShadowFS from './glsl/playerShadow_fs.glsl';
import basicVS from './glsl/basic_postprod_vs.glsl';
import pulseFS from './glsl/pulse_fs.glsl';
import bounceShadowVS from './glsl/boxShadow_vs.glsl';
import bounceShadowFS from './glsl/boxShadow_fs.glsl';

export const playerMeshMaterial = new MeshBasicMaterial({
    color: 0xffffff,
    fog: false,
    name: 'player-mesh-material',
});

export const playerShadowMaterial = new ShaderMaterial({
    uniforms: {
        time: { value: 0.0 },
        opacity: { value: 0.5 },
        uPowerRotationGlobal: {
            value: getRange(0.0, 10.0),
        },
        uAngleGlobal: { value: getRange(1, Math.PI) },
        shadowLastPosition: { value: new Vector3(0.5, 0.5, 0.5) },
    },
    vertexShader: playerShadowVS,
    fragmentShader: playerShadowFS,
    // side: DoubleSide,
    transparent: true,
    name: 'player-shadow-material',
});

export const pulseMaterial = new ShaderMaterial({
    uniforms: {
        time: { value: 0.0 },
        lightPosition: { value: new Vector2(0.5, 0.5) },
    },
    transparent: true,
    side: DoubleSide,
    vertexShader: basicVS,
    fragmentShader: pulseFS,
    name: 'pulse-material',
});

export const bounceShadowMaterial = new ShaderMaterial({
    uniforms: {
        time: { value: 0.0 },
    },
    vertexShader: bounceShadowVS,
    fragmentShader: bounceShadowFS,
    name: 'bounce-shadow-material',
});

export const bounceShadowMaterialInteractive = bounceShadowMaterial.clone();
bounceShadowMaterialInteractive.name = 'bounce-shadow-material-interactive';
