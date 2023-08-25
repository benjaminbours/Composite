import { Mesh, Group } from "three";
import { MysticPlace } from "./Elements/MysticPlace";

export interface IAsset {
    type: "jsonObj" | "texture";
    url: string;
    name: string;
}

export type CollidingElem = Mesh | Group | MysticPlace;
// export type InteractElem = MysticPlace;

// TODO: revoir l'utilité de ce fichier, la façon de load les assets à changers.
