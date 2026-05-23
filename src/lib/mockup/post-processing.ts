/**
 * Post-Processing Pipeline for Stigmator
 * 
 * Provides tone mapping, bloom, color grading, and other effects
 * using Three.js post-processing system.
 */

import * as THREE from 'three';
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/examples/jsm/postprocessing/UnrealBloomPass.js';
import { OutputPass } from 'three/examples/jsm/postprocessing/OutputPass.js';
import { ShaderPass } from 'three/examples/jsm/postprocessing/ShaderPass.js';

export type ToneMappingType = 'natural' | 'vivid' | 'dramatic' | 'flat';

export interface ToneMappingPreset {
  exposure: number;
  toneMapping: THREE.ToneMapping;
}

export interface BloomSettings {
  strength: number;
  radius: number;
  threshold: number;
}

export interface ColorGradeSettings {
  contrast: number;
  saturation: number;
  brightness: number;
}

export interface VignetteSettings {
  enabled: boolean;
  strength: number;
  radius: number;
}

export interface SharpenSettings {
  enabled: boolean;
  strength: number;
}

// Tone mapping presets
export const TONE_MAPPING_PRESETS: Record<ToneMappingType, ToneMappingPreset> = {
  natural: { 
    exposure: 1.0, 
    toneMapping: THREE.ACESFilmicToneMapping 
  },
  vivid: { 
    exposure: 1.2, 
    toneMapping: THREE.ReinhardToneMapping 
  },
  dramatic: { 
    exposure: 0.8, 
    toneMapping: THREE.CineonToneMapping 
  },
  flat: { 
    exposure: 1.0, 
    toneMapping: THREE.LinearToneMapping 
  },
};

// Default settings
const DEFAULT_BLOOM: BloomSettings = {
  strength: 0.5,
  radius: 0.5,
  threshold: 0.85,
};

const DEFAULT_COLOR_GRADE: ColorGradeSettings = {
  contrast: 1.0,
  saturation: 1.0,
  brightness: 1.0,
};

const DEFAULT_VIGNETTE: VignetteSettings = {
  enabled: true,
  strength: 0.3,
  radius: 1.5,
};

const DEFAULT_SHARPEN: SharpenSettings = {
  enabled: false,
  strength: 0.5,
};

/**
 * Post-Processing Chain
 * 
 * Manages the EffectComposer and all post-processing passes.
 */
export interface PostProcessChain {
  readonly composer: EffectComposer;
  
  /** Initialize the chain with scene and camera */
  setup(scene: THREE.Scene, camera: THREE.Camera, renderer: THREE.WebGLRenderer): void;
  
  /** Render the chain */
  render(): void;
  
  /** Set bloom effect parameters */
  setBloom(intensity: number, radius: number, threshold: number): void;
  
  /** Enable/disable bloom */
  setBloomEnabled(enabled: boolean): void;
  
  /** Set tone mapping type */
  setToneMapping(type: ToneMappingType): void;
  
  /** Set color grading parameters */
  setColorGrade(settings: Partial<ColorGradeSettings>): void;
  
  /** Set vignette effect */
  setVignette(settings: Partial<VignetteSettings>): void;
  
  /** Set sharpening effect */
  setSharpen(settings: Partial<SharpenSettings>): void;
  
  /** Resize the composer */
  setSize(width: number, height: number): void;
  
  /** Dispose of all resources */
  dispose(): void;
}

/**
 * Color Grading Shader
 * 
 * Applies contrast, saturation, and brightness adjustments.
 */
const ColorGradeShader = {
  uniforms: {
    tDiffuse: { value: null },
    contrast: { value: 1.0 },
    saturation: { value: 1.0 },
    brightness: { value: 1.0 },
  },

  vertexShader: /* glsl */`
    varying vec2 vUv;
    void main() {
      vUv = uv;
      gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }
  `,

  fragmentShader: /* glsl */`
    uniform sampler2D tDiffuse;
    uniform float contrast;
    uniform float saturation;
    uniform float brightness;
    varying vec2 vUv;

    void main() {
      vec4 texel = texture2D(tDiffuse, vUv);
      vec3 color = texel.rgb;

      // Brightness
      color *= brightness;

      // Contrast (centered at 0.5)
      color = (color - 0.5) * contrast + 0.5;

      // Saturation
      float luminance = dot(color, vec3(0.299, 0.587, 0.114));
      color = mix(vec3(luminance), color, saturation);

      gl_FragColor = vec4(color, texel.a);
    }
  `,
};

/**
 * Vignette Shader
 * 
 * Darkens the edges of the image to focus attention on the center.
 */
const VignetteShader = {
  uniforms: {
    tDiffuse: { value: null },
    strength: { value: 0.3 },
    radius: { value: 1.5 },
  },

  vertexShader: /* glsl */`
    varying vec2 vUv;
    void main() {
      vUv = uv;
      gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }
  `,

  fragmentShader: /* glsl */`
    uniform sampler2D tDiffuse;
    uniform float strength;
    uniform float radius;
    varying vec2 vUv;

    void main() {
      vec4 texel = texture2D(tDiffuse, vUv);
      
      // Calculate distance from center
      vec2 center = vUv - 0.5;
      float dist = length(center) * radius;
      
      // Apply vignette
      float vignette = 1.0 - smoothstep(0.5, 1.0, dist) * strength;
      
      gl_FragColor = vec4(texel.rgb * vignette, texel.a);
    }
  `,
};

/**
 * Sharpen Shader
 * 
 * Applies a subtle sharpening filter.
 */
const SharpenShader = {
  uniforms: {
    tDiffuse: { value: null },
    strength: { value: 0.5 },
    pixelSize: { value: new THREE.Vector2(1.0 / 1024.0, 1.0 / 1024.0) },
  },

  vertexShader: /* glsl */`
    varying vec2 vUv;
    void main() {
      vUv = uv;
      gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }
  `,

  fragmentShader: /* glsl */`
    uniform sampler2D tDiffuse;
    uniform float strength;
    uniform vec2 pixelSize;
    varying vec2 vUv;

    void main() {
      vec4 center = texture2D(tDiffuse, vUv);
      
      // Sample neighbors
      vec4 left = texture2D(tDiffuse, vUv - vec2(pixelSize.x, 0.0));
      vec4 right = texture2D(tDiffuse, vUv + vec2(pixelSize.x, 0.0));
      vec4 top = texture2D(tDiffuse, vUv - vec2(0.0, pixelSize.y));
      vec4 bottom = texture2D(tDiffuse, vUv + vec2(0.0, pixelSize.y));
      
      // Laplacian sharpen
      vec4 sharpened = center * (1.0 + 4.0 * strength) - (left + right + top + bottom) * strength;
      
      gl_FragColor = sharpened;
    }
  `,
};

/**
 * Internal implementation of PostProcessChain
 */
class PostProcessChainImpl implements PostProcessChain {
  public readonly composer: EffectComposer;
  
  private renderer: THREE.WebGLRenderer | null = null;
  private renderPass: RenderPass | null = null;
  private bloomPass: UnrealBloomPass | null = null;
  private colorGradePass: ShaderPass | null = null;
  private vignettePass: ShaderPass | null = null;
  private sharpenPass: ShaderPass | null = null;
  private outputPass: OutputPass;
  
  private bloomEnabled = false;
  private currentToneMapping: ToneMappingType = 'natural';

  constructor(renderer: THREE.WebGLRenderer) {
    this.composer = new EffectComposer(renderer);
    this.outputPass = new OutputPass();
  }

  public setup(
    scene: THREE.Scene,
    camera: THREE.Camera,
    renderer: THREE.WebGLRenderer
  ): void {
    this.renderer = renderer;
    this.composer.renderer = renderer;

    // Clear existing passes
    this.composer.passes = [];

    // Add render pass
    this.renderPass = new RenderPass(scene, camera);
    this.composer.addPass(this.renderPass);

    // Add bloom pass if enabled
    if (this.bloomEnabled) {
      this.bloomPass = new UnrealBloomPass(
        new THREE.Vector2(renderer.domElement.width, renderer.domElement.height),
        DEFAULT_BLOOM.strength,
        DEFAULT_BLOOM.radius,
        DEFAULT_BLOOM.threshold
      );
      this.composer.addPass(this.bloomPass);
    }

    // Add color grading pass
    this.colorGradePass = new ShaderPass(ColorGradeShader);
    this.colorGradePass.uniforms.contrast.value = DEFAULT_COLOR_GRADE.contrast;
    this.colorGradePass.uniforms.saturation.value = DEFAULT_COLOR_GRADE.saturation;
    this.colorGradePass.uniforms.brightness.value = DEFAULT_COLOR_GRADE.brightness;
    this.composer.addPass(this.colorGradePass);

    // Add vignette pass
    this.vignettePass = new ShaderPass(VignetteShader);
    this.vignettePass.uniforms.strength.value = DEFAULT_VIGNETTE.strength;
    this.vignettePass.uniforms.radius.value = DEFAULT_VIGNETTE.radius;
    this.vignettePass.enabled = DEFAULT_VIGNETTE.enabled;
    this.composer.addPass(this.vignettePass);

    // Add sharpen pass
    this.sharpenPass = new ShaderPass(SharpenShader);
    this.sharpenPass.uniforms.strength.value = DEFAULT_SHARPEN.strength;
    this.sharpenPass.uniforms.pixelSize.value.set(
      1.0 / renderer.domElement.width,
      1.0 / renderer.domElement.height
    );
    this.sharpenPass.enabled = DEFAULT_SHARPEN.enabled;
    this.composer.addPass(this.sharpenPass);

    // Add output pass (tone mapping)
    this.composer.addPass(this.outputPass);

    // Apply initial tone mapping
    this.applyToneMapping(this.currentToneMapping);
  }

  public render(): void {
    this.composer.render();
  }

  public setBloom(intensity: number, radius: number, threshold: number): void {
    if (!this.bloomPass) return;

    this.bloomPass.strength = intensity;
    this.bloomPass.radius = radius;
    this.bloomPass.threshold = threshold;
  }

  public setBloomEnabled(enabled: boolean): void {
    if (this.bloomPass) {
      this.bloomPass.enabled = enabled;
    }
    this.bloomEnabled = enabled;
  }

  public setToneMapping(type: ToneMappingType): void {
    this.currentToneMapping = type;
    this.applyToneMapping(type);
  }

  public setColorGrade(settings: Partial<ColorGradeSettings>): void {
    if (!this.colorGradePass) return;

    if (settings.contrast !== undefined) {
      this.colorGradePass.uniforms.contrast.value = settings.contrast;
    }
    if (settings.saturation !== undefined) {
      this.colorGradePass.uniforms.saturation.value = settings.saturation;
    }
    if (settings.brightness !== undefined) {
      this.colorGradePass.uniforms.brightness.value = settings.brightness;
    }
  }

  public setVignette(settings: Partial<VignetteSettings>): void {
    if (!this.vignettePass) return;

    if (settings.enabled !== undefined) {
      this.vignettePass.enabled = settings.enabled;
    }
    if (settings.strength !== undefined) {
      this.vignettePass.uniforms.strength.value = settings.strength;
    }
    if (settings.radius !== undefined) {
      this.vignettePass.uniforms.radius.value = settings.radius;
    }
  }

  public setSharpen(settings: Partial<SharpenSettings>): void {
    if (!this.sharpenPass) return;

    if (settings.enabled !== undefined) {
      this.sharpenPass.enabled = settings.enabled;
    }
    if (settings.strength !== undefined) {
      this.sharpenPass.uniforms.strength.value = settings.strength;
    }
  }

  public setSize(width: number, height: number): void {
    this.composer.setSize(width, height);

    // Update pixel size for sharpen pass
    if (this.sharpenPass) {
      this.sharpenPass.uniforms.pixelSize.value.set(1.0 / width, 1.0 / height);
    }

    // Update bloom resolution
    if (this.bloomPass) {
      this.bloomPass.resolution.set(width, height);
    }
  }

  public dispose(): void {
    this.composer.dispose();
    this.renderPass?.dispose();
    this.bloomPass?.dispose();
    this.outputPass.dispose();
    this.colorGradePass?.dispose();
    this.vignettePass?.dispose();
    this.sharpenPass?.dispose();
  }

  private applyToneMapping(type: ToneMappingType): void {
    const preset = TONE_MAPPING_PRESETS[type];
    
    if (this.renderer) {
      this.renderer.toneMapping = preset.toneMapping;
      this.renderer.toneMappingExposure = preset.exposure;
    }
  }
}

/**
 * Create a post-processing pipeline
 * 
 * @param renderer - The Three.js WebGL renderer
 * @param preset - Tone mapping preset to use
 * @returns PostProcessChain instance
 */
export function createPostProcessPipeline(
  renderer: THREE.WebGLRenderer,
  preset: ToneMappingType = 'natural'
): PostProcessChain {
  const chain = new PostProcessChainImpl(renderer);
  chain.setToneMapping(preset);
  return chain;
}

/**
 * Create a post-processing pipeline with full setup
 * 
 * @param scene - The Three.js scene
 * @param camera - The Three.js camera
 * @param renderer - The Three.js WebGL renderer
 * @param options - Configuration options
 */
export function createFullPipeline(
  scene: THREE.Scene,
  camera: THREE.Camera,
  renderer: THREE.WebGLRenderer,
  options?: {
    toneMapping?: ToneMappingType;
    bloom?: Partial<BloomSettings> & { enabled?: boolean };
    colorGrade?: Partial<ColorGradeSettings>;
    vignette?: Partial<VignetteSettings>;
    sharpen?: Partial<SharpenSettings>;
  }
): PostProcessChain {
  const chain = new PostProcessChainImpl(renderer);
  
  // Setup with scene and camera
  chain.setup(scene, camera, renderer);
  
  // Apply options
  if (options?.toneMapping) {
    chain.setToneMapping(options.toneMapping);
  }
  
  if (options?.bloom) {
    chain.setBloomEnabled(options.bloom.enabled ?? false);
    chain.setBloom(
      options.bloom.strength ?? DEFAULT_BLOOM.strength,
      options.bloom.radius ?? DEFAULT_BLOOM.radius,
      options.bloom.threshold ?? DEFAULT_BLOOM.threshold
    );
  }
  
  if (options?.colorGrade) {
    chain.setColorGrade(options.colorGrade);
  }
  
  if (options?.vignette) {
    chain.setVignette(options.vignette);
  }
  
  if (options?.sharpen) {
    chain.setSharpen(options.sharpen);
  }
  
  return chain;
}

/**
 * Quick render with post-processing
 * 
 * One-shot function for simple use cases.
 */
export function renderWithPostProcess(
  scene: THREE.Scene,
  camera: THREE.Camera,
  renderer: THREE.WebGLRenderer,
  options?: {
    toneMapping?: ToneMappingType;
    bloom?: boolean;
  }
): void {
  const chain = createFullPipeline(scene, camera, renderer, {
    toneMapping: options?.toneMapping ?? 'natural',
    bloom: { enabled: options?.bloom ?? false },
  });
  
  chain.render();
  chain.dispose();
}

/**
 * Get available tone mapping presets
 */
export function getToneMappingPresets(): { name: ToneMappingType; description: string }[] {
  return [
    { name: 'natural', description: 'Realistic ACES Filmic tone mapping' },
    { name: 'vivid', description: 'Enhanced contrast for vibrant images' },
    { name: 'dramatic', description: 'Cinematic Cineon tone mapping' },
    { name: 'flat', description: 'Linear tone mapping without curves' },
  ];
}

/**
 * Estimate performance impact of post-processing settings
 */
export function estimatePerformanceImpact(
  width: number,
  height: number,
  settings: {
    bloom: boolean;
    colorGrade: boolean;
    vignette: boolean;
    sharpen: boolean;
  }
): 'low' | 'medium' | 'high' {
  const pixelCount = width * height;
  let score = 0;
  
  // Base score from resolution
  if (pixelCount > 4096 * 4096) score += 3;
  else if (pixelCount > 2048 * 2048) score += 2;
  else score += 1;
  
  // Effect costs
  if (settings.bloom) score += 3;
  if (settings.sharpen) score += 1;
  if (settings.colorGrade) score += 1;
  if (settings.vignette) score += 1;
  
  if (score <= 3) return 'low';
  if (score <= 6) return 'medium';
  return 'high';
}
