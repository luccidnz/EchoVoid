declare module 'expo-three' {
  import * as THREE from 'three';
  export class Renderer {
    constructor(params: any);
    setSize(width: number, height: number): void;
    render(scene: THREE.Scene, camera: THREE.Camera): void;
  }
}
