import { Mesh, Group } from "three";

export interface IAsset {
    type: "jsonObj" | "texture";
    url: string;
    name: string;
}

export type ArrCollidingElem = Array<Mesh | Group>;
