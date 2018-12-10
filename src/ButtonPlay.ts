// interface ICoordinate {
//     x: number;
//     y: number;
// }
// export default class ButtonPlay {
//     public ray: number = 45;
//     public coordinate: ICoordinate = {
//         x: (window.innerWidth / 2),
//         y: (window.innerHeight / 100) * 75,
//     };

//     constructor() {
//         super();
//         this.drawCircle(0, 0, this.ray);
//         this.beginFill(0xFFFFFF);
//         this.drawCircle(0, 0, this.ray);
//         this.endFill();
//         this.x = this.coordinate.x;
//         this.y = this.coordinate.y;
//         this.interactive = true;
//         this.cursor = "hover";
//         this.on("pointerover", () => {
//             console.log("hover");
//         });

//         const style = new PIXI.TextStyle({
//             fontFamily: "Inconsolata",
//             fontWeight: "bold",
//             fontSize: 18,
//             letterSpacing: 5,
//         });
//         const message = new PIXI.Text("PLAY", style);
//         message.anchor.set(0.5, 0.5);
//         this.addChild(message);

//         window.addEventListener("resize", this.handleResize);
//     }

//     public render = () => {
//         return false;
//         // this.x = this.x + 0.1;
//     }

//     private handleResize = () => {
//         console.log("here");
//         this.coordinate = {
//             x: (window.innerWidth / 2),
//             y: (window.innerHeight / 100) * 75,
//         };

//         this.x = this.coordinate.x;
//         this.y = this.coordinate.y;
//     }
// }
