/**
 * Stigmator Procedural Garment Generator
 * 
 * Generates simple procedural 3D garment models as fallbacks when
 * external GLTF models fail to load.
 */

import * as THREE from 'three';
import { GarmentType, GarmentVariant, FabricProperties } from './model-variants';

// ============== TYPES ==============

interface GarmentGeometry {
  geometry: THREE.BufferGeometry;
  seamGeometry?: THREE.BufferGeometry;
}

// ============== MATERIAL GENERATORS ==============

function createFabricMaterial(properties: FabricProperties, color: string): THREE.MeshStandardMaterial {
  return new THREE.MeshStandardMaterial({
    color: new THREE.Color(color),
    roughness: properties.roughness,
    metalness: properties.metalness,
    side: THREE.DoubleSide,
  });
}

function createSeamMaterial(): THREE.MeshBasicMaterial {
  return new THREE.MeshBasicMaterial({
    color: 0x888888,
    transparent: true,
    opacity: 0.3,
  });
}

// ============== T-SHIRT GENERATOR ==============

function generateTShirt(variant: GarmentVariant): THREE.Group {
  const group = new THREE.Group();
  group.name = `procedural_${variant.name}`;

  // Body dimensions
  const width = 0.5;
  const height = 0.7;
  const depth = 0.12;
  const shoulderDrop = 0.08;

  // Create body shape
  const bodyShape = new THREE.Shape();
  
  // Start at bottom left
  bodyShape.moveTo(-width * 0.4, -height * 0.5);
  
  // Left side up to armpit
  bodyShape.lineTo(-width * 0.45, height * 0.1);
  
  // Left sleeve connection
  bodyShape.lineTo(-width * 0.6, height * 0.15);
  bodyShape.lineTo(-width * 0.65, height * 0.25); // Sleeve outer
  bodyShape.lineTo(-width * 0.5, height * 0.28);  // Sleeve top
  bodyShape.lineTo(-width * 0.4, height * 0.2);   // Shoulder
  
  // Neck
  bodyShape.lineTo(-width * 0.15, height * 0.45);
  bodyShape.quadraticCurveTo(0, height * 0.35, width * 0.15, height * 0.45);
  
  // Right shoulder and sleeve
  bodyShape.lineTo(width * 0.4, height * 0.2);
  bodyShape.lineTo(width * 0.5, height * 0.28);
  bodyShape.lineTo(width * 0.65, height * 0.25);
  bodyShape.lineTo(width * 0.6, height * 0.15);
  bodyShape.lineTo(width * 0.45, height * 0.1);
  
  // Right side down
  bodyShape.lineTo(width * 0.4, -height * 0.5);
  
  // Bottom curve
  bodyShape.quadraticCurveTo(0, -height * 0.52, -width * 0.4, -height * 0.5);

  const extrudeSettings: THREE.ExtrudeGeometryOptions = {
    depth: depth,
    bevelEnabled: true,
    bevelThickness: 0.01,
    bevelSize: 0.005,
    bevelSegments: 2,
    steps: 1,
  };

  const bodyGeometry = new THREE.ExtrudeGeometry(bodyShape, extrudeSettings);
  bodyGeometry.translate(0, 0, -depth / 2);

  // Center the geometry
  bodyGeometry.computeBoundingBox();
  const centerOffset = new THREE.Vector3();
  bodyGeometry.boundingBox!.getCenter(centerOffset).multiplyScalar(-1);
  bodyGeometry.translate(centerOffset.x, centerOffset.y, centerOffset.z);

  // Apply fabric material
  const material = createFabricMaterial(variant.fabricProperties, variant.defaultColor);
  const bodyMesh = new THREE.Mesh(bodyGeometry, material);
  bodyMesh.name = 'body';
  bodyMesh.castShadow = true;
  bodyMesh.receiveShadow = true;
  group.add(bodyMesh);

  // Add collar
  const collarGeometry = generateCollar(width * 0.18, 0.02, depth * 0.9);
  collarGeometry.translate(0, height * 0.38, 0);
  const collarMaterial = new THREE.MeshStandardMaterial({
    color: new THREE.Color(variant.defaultColor).multiplyScalar(0.9),
    roughness: variant.fabricProperties.roughness * 1.1,
    side: THREE.DoubleSide,
  });
  const collarMesh = new THREE.Mesh(collarGeometry, collarMaterial);
  collarMesh.name = 'collar';
  group.add(collarMesh);

  // Add seams
  addSeams(group, bodyGeometry, 0.002);

  return group;
}

// ============== HOODIE GENERATOR ==============

function generateHoodie(variant: GarmentVariant): THREE.Group {
  const group = new THREE.Group();
  group.name = `procedural_${variant.name}`;

  const width = 0.52;
  const height = 0.75;
  const depth = 0.15;

  // Body (similar to t-shirt but thicker)
  const bodyShape = new THREE.Shape();
  
  bodyShape.moveTo(-width * 0.4, -height * 0.5);
  bodyShape.lineTo(-width * 0.48, height * 0.05);
  bodyShape.lineTo(-width * 0.62, height * 0.1);
  bodyShape.lineTo(-width * 0.68, height * 0.22);
  bodyShape.lineTo(-width * 0.52, height * 0.25);
  bodyShape.lineTo(-width * 0.42, height * 0.15);
  
  // Hood opening
  bodyShape.lineTo(-width * 0.22, height * 0.42);
  bodyShape.quadraticCurveTo(0, height * 0.38, width * 0.22, height * 0.42);
  
  bodyShape.lineTo(width * 0.42, height * 0.15);
  bodyShape.lineTo(width * 0.52, height * 0.25);
  bodyShape.lineTo(width * 0.68, height * 0.22);
  bodyShape.lineTo(width * 0.62, height * 0.1);
  bodyShape.lineTo(width * 0.48, height * 0.05);
  bodyShape.lineTo(width * 0.4, -height * 0.5);
  bodyShape.quadraticCurveTo(0, -height * 0.53, -width * 0.4, -height * 0.5);

  const extrudeSettings: THREE.ExtrudeGeometryOptions = {
    depth: depth,
    bevelEnabled: true,
    bevelThickness: 0.015,
    bevelSize: 0.008,
    bevelSegments: 3,
    steps: 2,
  };

  const bodyGeometry = new THREE.ExtrudeGeometry(bodyShape, extrudeSettings);
  bodyGeometry.translate(0, 0, -depth / 2);

  // Center
  bodyGeometry.computeBoundingBox();
  const centerOffset = new THREE.Vector3();
  bodyGeometry.boundingBox!.getCenter(centerOffset).multiplyScalar(-1);
  bodyGeometry.translate(centerOffset.x, centerOffset.y, centerOffset.z);

  const material = createFabricMaterial(variant.fabricProperties, variant.defaultColor);
  const bodyMesh = new THREE.Mesh(bodyGeometry, material);
  bodyMesh.name = 'body';
  bodyMesh.castShadow = true;
  bodyMesh.receiveShadow = true;
  group.add(bodyMesh);

  // Hood
  const hoodGeometry = generateHood(width * 0.26, 0.3, depth * 1.1);
  hoodGeometry.translate(0, height * 0.45, -depth * 0.1);
  const hoodMesh = new THREE.Mesh(hoodGeometry, material);
  hoodMesh.name = 'hood';
  group.add(hoodMesh);

  // Kangaroo pocket
  const pocketGeometry = new THREE.BoxGeometry(width * 0.5, height * 0.25, depth * 0.3);
  pocketGeometry.translate(0, -height * 0.15, depth * 0.45);
  const pocketMesh = new THREE.Mesh(pocketGeometry, material);
  pocketMesh.name = 'pocket';
  group.add(pocketMesh);

  // Drawstrings
  const stringGeometry = new THREE.CylinderGeometry(0.003, 0.003, 0.25, 8);
  const stringMaterial = new THREE.MeshStandardMaterial({ color: 0xffffff });
  
  const leftString = new THREE.Mesh(stringGeometry, stringMaterial);
  leftString.position.set(-0.06, 0.32, 0.1);
  leftString.rotation.z = 0.1;
  leftString.name = 'drawstring_left';
  group.add(leftString);

  const rightString = new THREE.Mesh(stringGeometry, stringMaterial);
  rightString.position.set(0.06, 0.32, 0.1);
  rightString.rotation.z = -0.1;
  rightString.name = 'drawstring_right';
  group.add(rightString);

  addSeams(group, bodyGeometry, 0.0025);

  return group;
}

// ============== TANK TOP GENERATOR ==============

function generateTank(variant: GarmentVariant): THREE.Group {
  const group = new THREE.Group();
  group.name = `procedural_${variant.name}`;

  const width = 0.46;
  const height = 0.68;
  const depth = 0.08;

  const bodyShape = new THREE.Shape();
  
  bodyShape.moveTo(-width * 0.38, -height * 0.5);
  bodyShape.lineTo(-width * 0.4, height * 0.15);
  
  // Deep armholes
  bodyShape.lineTo(-width * 0.42, height * 0.35);
  bodyShape.lineTo(-width * 0.22, height * 0.4);
  
  // Neck
  bodyShape.lineTo(-width * 0.12, height * 0.48);
  bodyShape.quadraticCurveTo(0, height * 0.42, width * 0.12, height * 0.48);
  
  bodyShape.lineTo(width * 0.22, height * 0.4);
  bodyShape.lineTo(width * 0.42, height * 0.35);
  bodyShape.lineTo(width * 0.4, height * 0.15);
  bodyShape.lineTo(width * 0.38, -height * 0.5);
  bodyShape.quadraticCurveTo(0, -height * 0.52, -width * 0.38, -height * 0.5);

  const extrudeSettings: THREE.ExtrudeGeometryOptions = {
    depth: depth,
    bevelEnabled: true,
    bevelThickness: 0.008,
    bevelSize: 0.004,
    bevelSegments: 2,
    steps: 1,
  };

  const bodyGeometry = new THREE.ExtrudeGeometry(bodyShape, extrudeSettings);
  bodyGeometry.translate(0, 0, -depth / 2);

  bodyGeometry.computeBoundingBox();
  const centerOffset = new THREE.Vector3();
  bodyGeometry.boundingBox!.getCenter(centerOffset).multiplyScalar(-1);
  bodyGeometry.translate(centerOffset.x, centerOffset.y, centerOffset.z);

  const material = createFabricMaterial(variant.fabricProperties, variant.defaultColor);
  const bodyMesh = new THREE.Mesh(bodyGeometry, material);
  bodyMesh.name = 'body';
  group.add(bodyMesh);

  // Binding at neck and arms
  const bindingGeometry = generateBinding(width * 0.22, 0.015, depth * 1.1);
  bindingGeometry.translate(0, height * 0.42, 0);
  const bindingMaterial = new THREE.MeshStandardMaterial({
    color: new THREE.Color(variant.defaultColor).multiplyScalar(0.95),
    roughness: variant.fabricProperties.roughness,
    side: THREE.DoubleSide,
  });
  const bindingMesh = new THREE.Mesh(bindingGeometry, bindingMaterial);
  bindingMesh.name = 'binding';
  group.add(bindingMesh);

  addSeams(group, bodyGeometry, 0.0015);

  return group;
}

// ============== LONG SLEEVE GENERATOR ==============

function generateLongsleeve(variant: GarmentVariant): THREE.Group {
  const group = new THREE.Group();
  group.name = `procedural_${variant.name}`;

  const width = 0.48;
  const height = 0.72;
  const depth = 0.11;

  const bodyShape = new THREE.Shape();
  
  bodyShape.moveTo(-width * 0.38, -height * 0.5);
  bodyShape.lineTo(-width * 0.42, height * 0.1);
  
  // Shoulder slope
  bodyShape.lineTo(-width * 0.48, height * 0.2);
  bodyShape.lineTo(-width * 0.35, height * 0.25);
  
  // Neck
  bodyShape.lineTo(-width * 0.15, height * 0.46);
  bodyShape.quadraticCurveTo(0, height * 0.38, width * 0.15, height * 0.46);
  
  bodyShape.lineTo(width * 0.35, height * 0.25);
  bodyShape.lineTo(width * 0.48, height * 0.2);
  bodyShape.lineTo(width * 0.42, height * 0.1);
  bodyShape.lineTo(width * 0.38, -height * 0.5);
  bodyShape.quadraticCurveTo(0, -height * 0.53, -width * 0.38, -height * 0.5);

  const extrudeSettings: THREE.ExtrudeGeometryOptions = {
    depth: depth,
    bevelEnabled: true,
    bevelThickness: 0.01,
    bevelSize: 0.005,
    bevelSegments: 2,
    steps: 1,
  };

  const bodyGeometry = new THREE.ExtrudeGeometry(bodyShape, extrudeSettings);
  bodyGeometry.translate(0, 0, -depth / 2);

  bodyGeometry.computeBoundingBox();
  const centerOffset = new THREE.Vector3();
  bodyGeometry.boundingBox!.getCenter(centerOffset).multiplyScalar(-1);
  bodyGeometry.translate(centerOffset.x, centerOffset.y, centerOffset.z);

  const material = createFabricMaterial(variant.fabricProperties, variant.defaultColor);
  const bodyMesh = new THREE.Mesh(bodyGeometry, material);
  bodyMesh.name = 'body';
  group.add(bodyMesh);

  // Sleeves (separate cylinders for better sleeve articulation)
  const sleeveLength = 0.55;
  const sleeveWidth = 0.08;
  
  // Left sleeve
  const leftSleeveGeometry = new THREE.CylinderGeometry(
    sleeveWidth * 0.7, sleeveWidth, sleeveLength, 16, 4, true
  );
  leftSleeveGeometry.rotateZ(Math.PI / 2.5);
  leftSleeveGeometry.translate(-0.38, 0.15, 0);
  
  // Add thickness to sleeve
  const leftSleeveMesh = new THREE.Mesh(leftSleeveGeometry, material);
  leftSleeveMesh.name = 'sleeve_left';
  group.add(leftSleeveMesh);

  // Right sleeve
  const rightSleeveGeometry = new THREE.CylinderGeometry(
    sleeveWidth * 0.7, sleeveWidth, sleeveLength, 16, 4, true
  );
  rightSleeveGeometry.rotateZ(-Math.PI / 2.5);
  rightSleeveGeometry.translate(0.38, 0.15, 0);
  
  const rightSleeveMesh = new THREE.Mesh(rightSleeveGeometry, material);
  rightSleeveMesh.name = 'sleeve_right';
  group.add(rightSleeveMesh);

  // Cuffs
  const cuffGeometry = new THREE.TorusGeometry(sleeveWidth, 0.012, 8, 16);
  const cuffMaterial = new THREE.MeshStandardMaterial({
    color: new THREE.Color(variant.defaultColor).multiplyScalar(0.9),
    roughness: variant.fabricProperties.roughness * 1.1,
  });

  const leftCuff = new THREE.Mesh(cuffGeometry, cuffMaterial);
  leftCuff.position.set(-0.58, -0.05, 0);
  leftCuff.rotation.z = Math.PI / 2.5;
  leftCuff.scale.set(1, 1.2, 1);
  leftCuff.name = 'cuff_left';
  group.add(leftCuff);

  const rightCuff = new THREE.Mesh(cuffGeometry, cuffMaterial);
  rightCuff.position.set(0.58, -0.05, 0);
  rightCuff.rotation.z = -Math.PI / 2.5;
  rightCuff.scale.set(1, 1.2, 1);
  rightCuff.name = 'cuff_right';
  group.add(rightCuff);

  addSeams(group, bodyGeometry, 0.002);

  return group;
}

// ============== SWEATPANTS GENERATOR ==============

function generateSweatpants(variant: GarmentVariant): THREE.Group {
  const group = new THREE.Group();
  group.name = `procedural_${variant.name}`;

  const width = 0.42;
  const height = 1.0;
  const legWidth = 0.09;

  const material = createFabricMaterial(variant.fabricProperties, variant.defaultColor);

  // Left leg
  const leftLegGeometry = new THREE.CylinderGeometry(
    legWidth * 0.75, legWidth * 0.6, height, 16, 6, true
  );
  leftLegGeometry.translate(-width * 0.25, 0, 0);
  
  // Add slight curve to leg
  const leftLegPositions = leftLegGeometry.attributes.position.array as Float32Array;
  for (let i = 0; i < leftLegPositions.length; i += 3) {
    const y = leftLegPositions[i + 1];
    // Slight inward curve
    leftLegPositions[i] += (y / height) * 0.02;
  }
  leftLegGeometry.computeVertexNormals();
  
  const leftLegMesh = new THREE.Mesh(leftLegGeometry, material);
  leftLegMesh.name = 'leg_left';
  group.add(leftLegMesh);

  // Right leg
  const rightLegGeometry = new THREE.CylinderGeometry(
    legWidth * 0.75, legWidth * 0.6, height, 16, 6, true
  );
  rightLegGeometry.translate(width * 0.25, 0, 0);
  
  const rightLegPositions = rightLegGeometry.attributes.position.array as Float32Array;
  for (let i = 0; i < rightLegPositions.length; i += 3) {
    const y = rightLegPositions[i + 1];
    rightLegPositions[i] -= (y / height) * 0.02;
  }
  rightLegGeometry.computeVertexNormals();
  
  const rightLegMesh = new THREE.Mesh(rightLegGeometry, material);
  rightLegMesh.name = 'leg_right';
  group.add(rightLegMesh);

  // Waistband
  const waistGeometry = new THREE.CylinderGeometry(
    width * 0.55, width * 0.5, 0.08, 24, 2, true
  );
  waistGeometry.translate(0, height * 0.52, 0);
  
  // Flatten waistband
  waistGeometry.scale(1, 1, 0.7);
  
  const waistMaterial = new THREE.MeshStandardMaterial({
    color: new THREE.Color(variant.defaultColor).multiplyScalar(0.95),
    roughness: variant.fabricProperties.roughness * 1.1,
    side: THREE.DoubleSide,
  });
  const waistMesh = new THREE.Mesh(waistGeometry, waistMaterial);
  waistMesh.name = 'waistband';
  group.add(waistMesh);

  // Drawstrings
  const stringGeometry = new THREE.CylinderGeometry(0.003, 0.003, 0.18, 8);
  const stringMaterial = new THREE.MeshStandardMaterial({ color: 0xffffff });
  
  const leftString = new THREE.Mesh(stringGeometry, stringMaterial);
  leftString.position.set(-0.04, height * 0.52, 0.04);
  leftString.rotation.x = 0.3;
  leftString.name = 'drawstring_left';
  group.add(leftString);

  const rightString = new THREE.Mesh(stringGeometry, stringMaterial);
  rightString.position.set(0.04, height * 0.52, 0.04);
  rightString.rotation.x = 0.3;
  rightString.name = 'drawstring_right';
  group.add(rightString);

  // Cuffs
  const cuffGeometry = new THREE.TorusGeometry(legWidth * 0.6, 0.015, 8, 16);
  const cuffMaterial = new THREE.MeshStandardMaterial({
    color: new THREE.Color(variant.defaultColor).multiplyScalar(0.9),
    roughness: variant.fabricProperties.roughness * 1.05,
  });

  const leftCuff = new THREE.Mesh(cuffGeometry, cuffMaterial);
  leftCuff.position.set(-width * 0.25, -height * 0.5, 0);
  leftCuff.rotation.x = Math.PI / 2;
  leftCuff.scale.set(1, 0.7, 1);
  leftCuff.name = 'cuff_left';
  group.add(leftCuff);

  const rightCuff = new THREE.Mesh(cuffGeometry, cuffMaterial);
  rightCuff.position.set(width * 0.25, -height * 0.5, 0);
  rightCuff.rotation.x = Math.PI / 2;
  rightCuff.scale.set(1, 0.7, 1);
  rightCuff.name = 'cuff_right';
  group.add(rightCuff);

  return group;
}

// ============== SHORTS GENERATOR ==============

function generateShorts(variant: GarmentVariant): THREE.Group {
  const group = new THREE.Group();
  group.name = `procedural_${variant.name}`;

  const width = 0.40;
  const height = 0.45;
  const legWidth = 0.095;

  const material = createFabricMaterial(variant.fabricProperties, variant.defaultColor);

  // Left leg
  const leftLegGeometry = new THREE.CylinderGeometry(
    legWidth * 0.8, legWidth * 0.65, height, 16, 4, true
  );
  leftLegGeometry.translate(-width * 0.24, 0, 0);
  const leftLegMesh = new THREE.Mesh(leftLegGeometry, material);
  leftLegMesh.name = 'leg_left';
  group.add(leftLegMesh);

  // Right leg
  const rightLegGeometry = new THREE.CylinderGeometry(
    legWidth * 0.8, legWidth * 0.65, height, 16, 4, true
  );
  rightLegGeometry.translate(width * 0.24, 0, 0);
  const rightLegMesh = new THREE.Mesh(rightLegGeometry, material);
  rightLegMesh.name = 'leg_right';
  group.add(rightLegMesh);

  // Waistband
  const waistGeometry = new THREE.CylinderGeometry(
    width * 0.52, width * 0.48, 0.06, 20, 2, true
  );
  waistGeometry.translate(0, height * 0.55, 0);
  waistGeometry.scale(1, 1, 0.75);
  
  const waistMaterial = new THREE.MeshStandardMaterial({
    color: new THREE.Color(variant.defaultColor).multiplyScalar(0.95),
    roughness: variant.fabricProperties.roughness * 1.1,
    side: THREE.DoubleSide,
  });
  const waistMesh = new THREE.Mesh(waistGeometry, waistMaterial);
  waistMesh.name = 'waistband';
  group.add(waistMesh);

  // Drawstring
  const stringGeometry = new THREE.CylinderGeometry(0.003, 0.003, 0.12, 8);
  const stringMaterial = new THREE.MeshStandardMaterial({ color: 0xffffff });
  
  const leftString = new THREE.Mesh(stringGeometry, stringMaterial);
  leftString.position.set(-0.035, height * 0.55, 0.035);
  leftString.rotation.x = 0.3;
  leftString.name = 'drawstring_left';
  group.add(leftString);

  const rightString = new THREE.Mesh(stringGeometry, stringMaterial);
  rightString.position.set(0.035, height * 0.55, 0.035);
  rightString.rotation.x = 0.3;
  rightString.name = 'drawstring_right';
  group.add(rightString);

  return group;
}

// ============== HELPER FUNCTIONS ==============

function generateCollar(radius: number, thickness: number, depth: number): THREE.RingGeometry {
  const geometry = new THREE.RingGeometry(
    radius - thickness,
    radius + thickness,
    32,
    1,
    0,
    Math.PI * 2
  );
  
  // Add slight depth
  const positions = geometry.attributes.position.array as Float32Array;
  const newPositions = new Float32Array(positions.length * 2);
  const indices: number[] = [];
  
  for (let i = 0; i < positions.length; i += 3) {
    // Front face
    newPositions[i * 2] = positions[i];
    newPositions[i * 2 + 1] = positions[i + 1];
    newPositions[i * 2 + 2] = depth / 2;
    
    // Back face
    newPositions[i * 2 + 3] = positions[i];
    newPositions[i * 2 + 4] = positions[i + 1];
    newPositions[i * 2 + 5] = -depth / 2;
  }
  
  // Create side faces
  const vertexCount = positions.length / 3;
  for (let i = 0; i < vertexCount - 1; i++) {
    const a = i * 2;
    const b = a + 1;
    const c = ((i + 1) % vertexCount) * 2;
    const d = c + 1;
    
    indices.push(a, c, b);
    indices.push(b, c, d);
  }
  
  const result = new THREE.BufferGeometry();
  result.setAttribute('position', new THREE.BufferAttribute(newPositions, 3));
  result.setIndex(indices);
  result.computeVertexNormals();
  
  return result as unknown as THREE.RingGeometry;
}

function generateHood(width: number, height: number, depth: number): THREE.BufferGeometry {
  // Create a hood shape using a half-sphere with a flattened back
  const geometry = new THREE.SphereGeometry(width, 24, 18, 0, Math.PI, 0, Math.PI);
  
  // Flatten the back
  const positions = geometry.attributes.position.array as Float32Array;
  for (let i = 0; i < positions.length; i += 3) {
    const z = positions[i + 2];
    if (z < 0) {
      positions[i + 2] = z * 0.5; // Flatten back
    }
  }
  
  geometry.computeVertexNormals();
  geometry.scale(1, height / width, depth / width);
  
  return geometry;
}

function generateBinding(radius: number, thickness: number, depth: number): THREE.RingGeometry {
  return generateCollar(radius, thickness, depth);
}

function addSeams(group: THREE.Group, geometry: THREE.BufferGeometry, thickness: number): void {
  // Create seam lines along the edges
  const edges = new THREE.EdgesGeometry(geometry, 30);
  const lineGeometry = new THREE.BufferGeometry();
  
  const positions = edges.attributes.position.array as Float32Array;
  const seamPositions: number[] = [];
  
  // Convert edges to thicker lines (using small cylinders)
  for (let i = 0; i < positions.length; i += 6) {
    const x1 = positions[i];
    const y1 = positions[i + 1];
    const z1 = positions[i + 2];
    const x2 = positions[i + 3];
    const y2 = positions[i + 4];
    const z2 = positions[i + 5];
    
    const midX = (x1 + x2) / 2;
    const midY = (y1 + y2) / 2;
    const midZ = (z1 + z2) / 2;
    
    const length = Math.sqrt((x2 - x1) ** 2 + (y2 - y1) ** 2 + (z2 - z1) ** 2);
    
    const seamGeometry = new THREE.CylinderGeometry(thickness, thickness, length, 6);
    seamGeometry.rotateZ(Math.atan2(y2 - y1, x2 - x1) - Math.PI / 2);
    seamGeometry.rotateX(Math.atan2(z2 - z1, Math.sqrt((x2 - x1) ** 2 + (y2 - y1) ** 2)));
    seamGeometry.translate(midX, midY, midZ);
    
    const seamMaterial = createSeamMaterial();
    const seamMesh = new THREE.Mesh(seamGeometry, seamMaterial);
    seamMesh.name = 'seam';
    group.add(seamMesh);
  }
}

// ============== MAIN EXPORT ==============

export function generateProceduralGarment(variant: GarmentVariant): THREE.Group {
  switch (variant.type) {
    case 'tshirt':
      return generateTShirt(variant);
    case 'hoodie':
      return generateHoodie(variant);
    case 'tank':
      return generateTank(variant);
    case 'longsleeve':
      return generateLongsleeve(variant);
    case 'sweatpants':
      return generateSweatpants(variant);
    case 'shorts':
      return generateShorts(variant);
    default:
      throw new Error(`Unsupported garment type: ${variant.type}`);
  }
}

// Generate UV coordinates for procedural garments
export function generateGarmentUVs(geometry: THREE.BufferGeometry, variant: GarmentVariant): void {
  const positions = geometry.attributes.position.array as Float32Array;
  const uvs = new Float32Array((positions.length / 3) * 2);
  
  // Compute bounding box for normalization
  geometry.computeBoundingBox();
  const box = geometry.boundingBox!;
  const range = new THREE.Vector3();
  box.getSize(range);
  
  for (let i = 0; i < positions.length; i += 3) {
    const x = positions[i];
    const y = positions[i + 1];
    const z = positions[i + 2];
    
    // Simple planar projection from front
    const u = (x - box.min.x) / range.x;
    const v = (y - box.min.y) / range.y;
    
    uvs[i / 3 * 2] = u;
    uvs[i / 3 * 2 + 1] = v;
  }
  
  geometry.setAttribute('uv', new THREE.BufferAttribute(uvs, 2));
}

export default {
  generateProceduralGarment,
  generateGarmentUVs,
};
