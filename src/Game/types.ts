import { Mesh, Group } from "three";

export interface IAsset {
    type: "jsonObj" | "texture";
    url: string;
    name: string;
}

export type ArrCollidingElem = Array<Mesh | Group>;

// TODO: revoir l'utilité de ce fichier, la façon de load les assets à changers.
