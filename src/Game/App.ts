import * as THREE from "three";

export default class App {
    private scene = new THREE.Scene();
    private camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    private renderer: THREE.WebGLRenderer;

    private cube: THREE.Mesh;

    constructor(canvasDom: HTMLCanvasElement) {
        this.renderer = new THREE.WebGLRenderer({
            canvas: canvasDom,
        });
        this.renderer.setSize(window.innerWidth, window.innerHeight);

        const geometry = new THREE.BoxGeometry(1, 1, 1);
        const material = new THREE.MeshBasicMaterial({
            color: 0x00ff00,
        });

        this.cube = new THREE.Mesh(geometry, material);
        this.scene.add(this.cube);

        this.camera.position.z = 5;
    }

    public render = () => {
        requestAnimationFrame(this.render);
        this.renderer.render(this.scene, this.camera);

        this.cube.rotation.x += 0.01;
        this.cube.rotation.y += 0.01;
    }
}
