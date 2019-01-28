declare module "*.svg" {
  const value: any;
  export default value;
}
declare module "*.png" {
  const value: any;
  export default value;
}

declare interface CanvasRenderingContext2D {
  renderText(text, x, y, letterSpacing);
}