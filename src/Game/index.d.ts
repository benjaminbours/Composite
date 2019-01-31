// declare interface THREE.Object3D {
//     // renderText(text, x, y, letterSpacing);
// }
// declare namespace "three" {
//     export interface Object3D {

//     }
// }

declare module "three" {
    interface Object3D {
        render(any): any;
    }
}

// declare interface THREE.Object3D {

// }