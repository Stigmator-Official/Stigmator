// Type declarations for three.js examples modules
// These modules don't have proper TypeScript declarations in @types/three

declare module 'three/examples/jsm/loaders/GLTFLoader' {
  import * as THREE from 'three';
  
  export interface GLTF {
    scene: THREE.Group;
    scenes: THREE.Group[];
    cameras: THREE.Camera[];
    animations: THREE.AnimationClip[];
    asset: {
      copyright?: string;
      generator?: string;
      version?: string;
      minVersion?: string;
      extensions?: Record<string, unknown>;
      extras?: unknown;
    };
    parser: unknown;
    userData: Record<string, unknown>;
  }
  
  export class GLTFLoader extends THREE.Loader {
    constructor(manager?: THREE.LoadingManager);
    load(
      url: string,
      onLoad: (gltf: GLTF) => void,
      onProgress?: (event: ProgressEvent) => void,
      onError?: (event: ErrorEvent) => void
    ): void;
    loadAsync(url: string, onProgress?: (event: ProgressEvent) => void): Promise<GLTF>;
    setDRACOLoader(dracoLoader: unknown): this;
    setKTX2Loader(ktx2Loader: unknown): this;
    setMeshoptDecoder(meshoptDecoder: unknown): this;
    parse(
      data: ArrayBuffer | string,
      path: string,
      onLoad: (gltf: GLTF) => void,
      onError?: (event: ErrorEvent) => void
    ): void;
  }
}

declare module 'three/examples/jsm/loaders/DRACOLoader' {
  import * as THREE from 'three';
  
  export class DRACOLoader extends THREE.Loader {
    constructor(manager?: THREE.LoadingManager);
    load(
      url: string,
      onLoad: (geometry: THREE.BufferGeometry) => void,
      onProgress?: (event: ProgressEvent) => void,
      onError?: (event: ErrorEvent) => void
    ): void;
    loadAsync(url: string, onProgress?: (event: ProgressEvent) => void): Promise<THREE.BufferGeometry>;
    setDecoderPath(path: string): this;
    setDecoderConfig(config: Record<string, unknown>): this;
    setWorkerLimit(limit: number): this;
    dispose(): void;
  }
}

declare module 'three/examples/jsm/loaders/KTX2Loader' {
  import * as THREE from 'three';
  
  export class KTX2Loader extends THREE.Loader {
    constructor(manager?: THREE.LoadingManager);
    load(
      url: string,
      onLoad: (texture: THREE.Texture) => void,
      onProgress?: (event: ProgressEvent) => void,
      onError?: (event: ErrorEvent) => void
    ): void;
    setTranscoderPath(path: string): this;
    setWorkerLimit(limit: number): this;
    detectSupport(renderer: THREE.WebGLRenderer): this;
    dispose(): void;
  }
}

declare module 'three/examples/jsm/libs/meshopt_decoder.module' {
  export const MeshoptDecoder: {
    ready: Promise<void>;
    decodeVertexBuffer: (buffer: Uint8Array, count: number, size: number, data: Uint8Array) => void;
    decodeIndexBuffer: (buffer: Uint8Array, count: number, size: number, data: Uint8Array) => void;
    decodeIndexSequence: (buffer: Uint8Array, count: number, size: number, data: Uint8Array) => void;
  };
}

declare module 'three/examples/jsm/utils/BufferGeometryUtils' {
  import * as THREE from 'three';
  
  export function mergeGeometries(
    geometries: THREE.BufferGeometry[],
    useGroups?: boolean
  ): THREE.BufferGeometry;
  
  export function computeMorphedAttributes(
    object: THREE.Mesh | THREE.Line | THREE.Points
  ): { position: Float32Array; normal?: Float32Array };
}

// UUID module declaration
declare module 'uuid' {
  export function v4(): string;
  export function v1(): string;
  export function v3(name: string | Buffer, namespace: string | Buffer): string;
  export function v5(name: string | Buffer, namespace: string | Buffer): string;
  export function parse(uuid: string): Buffer;
  export function unparse(buffer: Buffer): string;
  export function validate(uuid: string): boolean;
  export function version(uuid: string): number;
}

// Prisma Client fallback - provide minimal types for build
// The actual Prisma client will be available at runtime
declare module '@prisma/client' {
  export class PrismaClient {
    user: {
      findMany: (args?: unknown) => Promise<unknown[]>;
      findFirst: (args?: unknown) => Promise<unknown | null>;
      findUnique: (args?: unknown) => Promise<unknown | null>;
      create: (args?: unknown) => Promise<unknown>;
      update: (args?: unknown) => Promise<unknown>;
      delete: (args?: unknown) => Promise<unknown>;
      count: (args?: unknown) => Promise<number>;
    };
    design: {
      findMany: (args?: unknown) => Promise<unknown[]>;
      findFirst: (args?: unknown) => Promise<unknown | null>;
      findUnique: (args?: unknown) => Promise<unknown | null>;
      create: (args?: unknown) => Promise<unknown>;
      update: (args?: unknown) => Promise<unknown>;
      delete: (args?: unknown) => Promise<unknown>;
    };
    $connect: () => Promise<void>;
    $disconnect: () => Promise<void>;
  }
}
