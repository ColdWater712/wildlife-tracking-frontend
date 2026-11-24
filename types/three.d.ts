declare module "three" {
  export class Vector3 {
    x: number;
    y: number;
    z: number;
    constructor(x?: number, y?: number, z?: number);
    set(x: number, y: number, z: number): this;
    copy(v: Vector3): this;
    lerp(v: Vector3, alpha: number): this;
    project(camera: PerspectiveCamera): this;
    clone(): Vector3;
  }
  export class WebGLRenderer {
    domElement: HTMLCanvasElement;
    constructor(params?: { antialias?: boolean; alpha?: boolean });
    setPixelRatio(ratio: number): void;
    setSize(width: number, height: number): void;
    render(scene: Scene, camera: PerspectiveCamera): void;
    dispose(): void;
  }
  export class Scene {
    fog: FogExp2 | null;
    add(...objects: unknown[]): void;
  }
  export class FogExp2 {
    color: { setHex(hex: number): void };
    constructor(color: number, density?: number);
  }
  export class PerspectiveCamera {
    aspect: number;
    position: Vector3;
    constructor(fov: number, aspect: number, near: number, far: number);
    updateProjectionMatrix(): void;
    lookAt(x: number | Vector3, y?: number, z?: number): void;
  }
  export class AmbientLight {
    intensity: number;
    constructor(color?: number, intensity?: number);
  }
  export class HemisphereLight {
    intensity: number;
    constructor(skyColor: number, groundColor: number, intensity?: number);
  }
  export class DirectionalLight {
    intensity: number;
    color: { setHex(hex: number): void };
    position: Vector3;
    constructor(color: number, intensity?: number);
  }
  export class PointLight {
    intensity: number;
    position: Vector3;
    constructor(color?: number, intensity?: number, distance?: number);
  }
  export class Group {
    position: Vector3;
    rotation: { x: number; y: number; z: number };
    scale: Vector3;
    add(...objects: unknown[]): void;
  }
  export class BufferGeometry {
    setAttribute(name: string, attr: Float32BufferAttribute): void;
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
    emissiveIntensity: number;
    constructor(params?: Record<string, unknown>);
  }
  export class MeshBasicMaterial {
    opacity: number;
    constructor(params?: Record<string, unknown>);
  }
  export class PointsMaterial {
    constructor(params?: Record<string, unknown>);
  }
  export class LineBasicMaterial {
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
  export class OctahedronGeometry {
    constructor(r: number, detail?: number);
  }
  export class SphereGeometry {
    constructor(r: number, ws?: number, hs?: number);
  }
  export class TorusGeometry {
    constructor(r: number, tube: number, radialSegs?: number, tubularSegs?: number);
  }
  export class RingGeometry {
    rotateX(angle: number): void;
    constructor(innerR: number, outerR: number, thetaSegs?: number);
  }
  export class Mesh {
    position: Vector3;
    rotation: { x: number; y: number; z: number };
    scale: Vector3;
    material: MeshStandardMaterial | MeshBasicMaterial;
    constructor(geometry: unknown, material: unknown);
  }
  export class Points {
    rotation: { x: number; y: number; z: number };
    constructor(geometry: unknown, material: unknown);
  }
  export class LineLoop {
    rotation: { x: number; y: number; z: number };
    constructor(geometry: unknown, material: unknown);
  }
  export class Clock {
    getElapsedTime(): number;
  }
}
