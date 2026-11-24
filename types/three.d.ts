declare module "three" {
  export class WebGLRenderer {
    domElement: HTMLCanvasElement;
    constructor(params?: { antialias?: boolean; alpha?: boolean });
    setPixelRatio(ratio: number): void;
    setSize(width: number, height: number): void;
    render(scene: Scene, camera: PerspectiveCamera): void;
    dispose(): void;
  }
  export class Scene {
    fog: FogExp2;
    add(...objects: unknown[]): void;
  }
  export class FogExp2 {
    color: { setHex(hex: number): void };
    constructor(color: number, density?: number);
  }
  export class PerspectiveCamera {
    aspect: number;
    position: { x: number; y: number; z: number; set(x: number, y: number, z: number): void };
    constructor(fov: number, aspect: number, near: number, far: number);
    updateProjectionMatrix(): void;
    lookAt(x: number, y: number, z: number): void;
  }
  export class HemisphereLight {
    intensity: number;
    constructor(skyColor: number, groundColor: number, intensity?: number);
  }
  export class DirectionalLight {
    intensity: number;
    color: { setHex(hex: number): void };
    position: { set(x: number, y: number, z: number): void };
    constructor(color: number, intensity?: number);
  }
  export class Group {
    position: { x: number; y: number; z: number; set(x: number, y: number, z: number): void };
    scale: { set(x: number, y: number, z: number): void };
    add(...objects: unknown[]): void;
  }
  export class PlaneGeometry {
    attributes: {
      position: { count: number; getX(i: number): number; getZ(i: number): number; setY(i: number, y: number): void };
    };
    constructor(width: number, height: number, widthSegments?: number, heightSegments?: number);
    rotateX(angle: number): void;
    setAttribute(name: string, attr: Float32BufferAttribute): void;
    computeVertexNormals(): void;
  }
  export class Float32BufferAttribute {
    constructor(array: number[], itemSize: number);
  }
  export class MeshStandardMaterial {
    opacity: number;
    constructor(params?: Record<string, unknown>);
  }
  export class MeshBasicMaterial {
    constructor(params?: Record<string, unknown>);
  }
  export class CylinderGeometry {
    constructor(rt: number, rb: number, h: number, segs?: number);
  }
  export class ConeGeometry {
    constructor(r: number, h: number, segs?: number);
  }
  export class DodecahedronGeometry {
    constructor(r: number, detail?: number);
  }
  export class SphereGeometry {
    constructor(r: number, ws?: number, hs?: number);
  }
  export class Mesh {
    position: { x: number; y: number; z: number; set(x: number, y: number, z: number): void };
    constructor(geometry: unknown, material: unknown);
  }
  export class Clock {
    getElapsedTime(): number;
  }
}
