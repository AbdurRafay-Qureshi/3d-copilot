import { CircuitSpec, KiCadPCB } from '@/types/circuit';
import { generateKiCadPCB } from './kicad-parser';

export interface ThreeJSModel {
  id: string;
  type: 'component' | 'trace' | 'via' | 'pad';
  position: { x: number; y: number; z: number };
  rotation: { x: number; y: number; z: number };
  scale: { x: number; y: number; z: number };
  geometry: string;
  material: string;
  visible: boolean;
}

export interface ThreeJSScene {
  models: ThreeJSModel[];
  camera: {
    position: { x: number; y: number; z: number };
    target: { x: number; y: number; z: number };
  };
  lighting: {
    ambient: { color: string; intensity: number };
    directional: { color: string; intensity: number; position: { x: number; y: number; z: number } };
  };
}

export function generate3DScene(circuitSpec: CircuitSpec): ThreeJSScene {
  const pcb = generateKiCadPCB(circuitSpec);
  const models: ThreeJSModel[] = [];

  // Add PCB base
  models.push({
    id: 'pcb_base',
    type: 'component',
    position: { x: 0, y: 0, z: 0 },
    rotation: { x: 0, y: 0, z: 0 },
    scale: { x: pcb.dimensions.width, y: pcb.dimensions.height, z: 1.6 },
    geometry: 'box',
    material: 'pcb_green',
    visible: true
  });

  // Add components
  pcb.components.forEach(component => {
    const componentModel = generateComponent3DModel(component);
    models.push(componentModel);
  });

  // Add traces
  pcb.traces.forEach(trace => {
    const traceModel = generateTrace3DModel(trace);
    models.push(traceModel);
  });

  // Add vias
  pcb.vias.forEach(via => {
    const viaModel = generateVia3DModel(via);
    models.push(viaModel);
  });

  return {
    models,
    camera: {
      position: { x: 50, y: 50, z: 100 },
      target: { x: 0, y: 0, z: 0 }
    },
    lighting: {
      ambient: { color: '#404040', intensity: 0.4 },
      directional: { color: '#ffffff', intensity: 0.8, position: { x: 10, y: 10, z: 10 } }
    }
  };
}

function generateComponent3DModel(component: any): ThreeJSModel {
  const { id, position, footprint } = component;
  
  // Map footprint types to 3D models
  const modelMap: Record<string, { geometry: string; scale: { x: number; y: number; z: number } }> = {
    'DIP-8': { geometry: 'dip8', scale: { x: 1, y: 1, z: 1 } },
    'R_0805_2012Metric': { geometry: 'resistor_0805', scale: { x: 1, y: 1, z: 1 } },
    'C_0805_2012Metric': { geometry: 'capacitor_0805', scale: { x: 1, y: 1, z: 1 } },
    'LED_D5.0mm': { geometry: 'led_5mm', scale: { x: 1, y: 1, z: 1 } }
  };

  const modelInfo = modelMap[footprint] || { geometry: 'box', scale: { x: 1, y: 1, z: 1 } };

  return {
    id: `component_${id}`,
    type: 'component',
    position: { x: position.x, y: position.y, z: 1.6 },
    rotation: { x: 0, y: 0, z: 0 },
    scale: modelInfo.scale,
    geometry: modelInfo.geometry,
    material: 'component_default',
    visible: true
  };
}

function generateTrace3DModel(trace: any): ThreeJSModel {
  return {
    id: `trace_${trace.net}`,
    type: 'trace',
    position: { x: 0, y: 0, z: 0.1 },
    rotation: { x: 0, y: 0, z: 0 },
    scale: { x: 1, y: 1, z: 1 },
    geometry: 'trace',
    material: 'copper',
    visible: true
  };
}

function generateVia3DModel(via: any): ThreeJSModel {
  return {
    id: `via_${via.position.x}_${via.position.y}`,
    type: 'via',
    position: { x: via.position.x, y: via.position.y, z: 0 },
    rotation: { x: 0, y: 0, z: 0 },
    scale: { x: via.diameter, y: via.diameter, z: 1.6 },
    geometry: 'cylinder',
    material: 'copper',
    visible: true
  };
}

export function generateThreeJSCode(scene: ThreeJSScene): string {
  return `
import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';

export class Circuit3DRenderer {
  private scene: THREE.Scene;
  private camera: THREE.PerspectiveCamera;
  private renderer: THREE.WebGLRenderer;
  private loader: GLTFLoader;

  constructor(container: HTMLElement) {
    this.scene = new THREE.Scene();
    this.camera = new THREE.PerspectiveCamera(75, container.clientWidth / container.clientHeight, 0.1, 1000);
    this.renderer = new THREE.WebGLRenderer({ antialias: true });
    this.loader = new GLTFLoader();

    this.renderer.setSize(container.clientWidth, container.clientHeight);
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    container.appendChild(this.renderer.domElement);

    this.setupLighting();
    this.setupCamera();
    this.loadModels();
    this.animate();
  }

  private setupLighting() {
    // Ambient light
    const ambientLight = new THREE.AmbientLight(
      new THREE.Color('${scene.lighting.ambient.color}'),
      ${scene.lighting.ambient.intensity}
    );
    this.scene.add(ambientLight);

    // Directional light
    const directionalLight = new THREE.DirectionalLight(
      new THREE.Color('${scene.lighting.directional.color}'),
      ${scene.lighting.directional.intensity}
    );
    directionalLight.position.set(
      ${scene.lighting.directional.position.x},
      ${scene.lighting.directional.position.y},
      ${scene.lighting.directional.position.z}
    );
    directionalLight.castShadow = true;
    this.scene.add(directionalLight);
  }

  private setupCamera() {
    this.camera.position.set(
      ${scene.camera.position.x},
      ${scene.camera.position.y},
      ${scene.camera.position.z}
    );
    this.camera.lookAt(
      ${scene.camera.target.x},
      ${scene.camera.target.y},
      ${scene.camera.target.z}
    );
  }

  private loadModels() {
    ${scene.models.map(model => generateModelLoadingCode(model)).join('\n    ')}
  }

  private animate() {
    requestAnimationFrame(() => this.animate());
    this.renderer.render(this.scene, this.camera);
  }

  public dispose() {
    this.renderer.dispose();
  }
}
`;
}

function generateModelLoadingCode(model: ThreeJSModel): string {
  if (model.type === 'component') {
    return `
    // Load ${model.id}
    const ${model.id}Geometry = this.getGeometry('${model.geometry}');
    const ${model.id}Material = this.getMaterial('${model.material}');
    const ${model.id}Mesh = new THREE.Mesh(${model.id}Geometry, ${model.id}Material);
    ${model.id}Mesh.position.set(${model.position.x}, ${model.position.y}, ${model.position.z});
    ${model.id}Mesh.rotation.set(${model.rotation.x}, ${model.rotation.y}, ${model.rotation.z});
    ${model.id}Mesh.scale.set(${model.scale.x}, ${model.scale.y}, ${model.scale.z});
    ${model.id}Mesh.castShadow = true;
    ${model.id}Mesh.receiveShadow = true;
    this.scene.add(${model.id}Mesh);
    `;
  } else if (model.type === 'trace') {
    return `
    // Load ${model.id}
    const ${model.id}Geometry = new THREE.BoxGeometry(0.1, 0.1, 0.1);
    const ${model.id}Material = new THREE.MeshLambertMaterial({ color: 0x8B4513 });
    const ${model.id}Mesh = new THREE.Mesh(${model.id}Geometry, ${model.id}Material);
    ${model.id}Mesh.position.set(${model.position.x}, ${model.position.y}, ${model.position.z});
    this.scene.add(${model.id}Mesh);
    `;
  } else if (model.type === 'via') {
    return `
    // Load ${model.id}
    const ${model.id}Geometry = new THREE.CylinderGeometry(0.5, 0.5, 1.6, 8);
    const ${model.id}Material = new THREE.MeshLambertMaterial({ color: 0x8B4513 });
    const ${model.id}Mesh = new THREE.Mesh(${model.id}Geometry, ${model.id}Material);
    ${model.id}Mesh.position.set(${model.position.x}, ${model.position.y}, ${model.position.z});
    this.scene.add(${model.id}Mesh);
    `;
  }
  return '';
}

export function generateSTLExport(scene: ThreeJSScene): string {
  // This would generate STL file content for 3D printing
  // For now, return a placeholder
  return `# STL Export for Circuit 3D Model
# Generated by Real Circuit Image Copilot
# This is a placeholder - actual STL generation would require Three.js STL exporter

solid circuit_model
  # PCB Base
  facet normal 0 0 1
    outer loop
      vertex 0 0 0
      vertex 100 0 0
      vertex 100 80 0
    endloop
  endfacet
  
  # Components would be added here
  # Traces would be added here
  # Vias would be added here

endsolid circuit_model
`;
}

export function generateOBJExport(scene: ThreeJSScene): string {
  // This would generate OBJ file content for 3D viewing
  let obj = `# OBJ Export for Circuit 3D Model
# Generated by Real Circuit Image Copilot

`;

  scene.models.forEach((model, index) => {
    obj += `# ${model.id}\n`;
    obj += `g ${model.id}\n`;
    
    if (model.geometry === 'box') {
      obj += generateBoxOBJ(model, index * 8);
    } else if (model.geometry === 'cylinder') {
      obj += generateCylinderOBJ(model, index * 8);
    }
    
    obj += `\n`;
  });

  return obj;
}

function generateBoxOBJ(model: ThreeJSModel, vertexOffset: number): string {
  const { position, scale } = model;
  const w = scale.x / 2;
  const h = scale.y / 2;
  const d = scale.z / 2;
  
  return `
v ${position.x - w} ${position.y - h} ${position.z - d}
v ${position.x + w} ${position.y - h} ${position.z - d}
v ${position.x + w} ${position.y + h} ${position.z - d}
v ${position.x - w} ${position.y + h} ${position.z - d}
v ${position.x - w} ${position.y - h} ${position.z + d}
v ${position.x + w} ${position.y - h} ${position.z + d}
v ${position.x + w} ${position.y + h} ${position.z + d}
v ${position.x - w} ${position.y + h} ${position.z + d}

f ${vertexOffset + 1} ${vertexOffset + 2} ${vertexOffset + 3} ${vertexOffset + 4}
f ${vertexOffset + 5} ${vertexOffset + 6} ${vertexOffset + 7} ${vertexOffset + 8}
f ${vertexOffset + 1} ${vertexOffset + 2} ${vertexOffset + 6} ${vertexOffset + 5}
f ${vertexOffset + 2} ${vertexOffset + 3} ${vertexOffset + 7} ${vertexOffset + 6}
f ${vertexOffset + 3} ${vertexOffset + 4} ${vertexOffset + 8} ${vertexOffset + 7}
f ${vertexOffset + 4} ${vertexOffset + 1} ${vertexOffset + 5} ${vertexOffset + 8}
`;
}

function generateCylinderOBJ(model: ThreeJSModel, vertexOffset: number): string {
  const { position, scale } = model;
  const radius = scale.x / 2;
  const height = scale.z;
  const segments = 8;
  
  let obj = '';
  
  // Generate vertices for top and bottom circles
  for (let i = 0; i < segments; i++) {
    const angle = (i / segments) * Math.PI * 2;
    const x = position.x + Math.cos(angle) * radius;
    const y = position.y + Math.sin(angle) * radius;
    
    obj += `v ${x} ${y} ${position.z}\n`;
    obj += `v ${x} ${y} ${position.z + height}\n`;
  }
  
  // Generate faces
  for (let i = 0; i < segments; i++) {
    const next = (i + 1) % segments;
    const v1 = vertexOffset + i * 2 + 1;
    const v2 = vertexOffset + i * 2 + 2;
    const v3 = vertexOffset + next * 2 + 2;
    const v4 = vertexOffset + next * 2 + 1;
    
    obj += `f ${v1} ${v2} ${v3} ${v4}\n`;
  }
  
  return obj;
}
