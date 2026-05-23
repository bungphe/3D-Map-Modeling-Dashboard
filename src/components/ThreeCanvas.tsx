import React, { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import { MapData, PointOfInterest } from "../types";

interface ThreeCanvasProps {
  mapData: MapData;
  heightMultiplier: number;
  selectedPoi: PointOfInterest | null;
  onSelectPoi: (poi: PointOfInterest | null) => void;
  showScanner: boolean;
  wireframeMode: boolean;
  mapTypeColor: string; // 'cyan' | 'green' | 'amber'
}

export default function ThreeCanvas({
  mapData,
  heightMultiplier,
  selectedPoi,
  onSelectPoi,
  showScanner,
  wireframeMode,
  mapTypeColor,
}: ThreeCanvasProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const controlsRef = useRef<OrbitControls | null>(null);
  const animationFrameRef = useRef<number | null>(null);

  // References to animate heights and pins
  const columnsGroupRef = useRef<THREE.Group | null>(null);
  const pinsGroupRef = useRef<THREE.Group | null>(null);
  const compassRingRef = useRef<THREE.Mesh | null>(null);
  const scannerLineRef = useRef<THREE.Mesh | null>(null);

  // Keep latest props in refs to avoid rebuilding the scene on every small slide adjust
  const propsRef = useRef({ mapData, heightMultiplier, selectedPoi, onSelectPoi, wireframeMode, mapTypeColor });
  
  useEffect(() => {
    propsRef.current = { mapData, heightMultiplier, selectedPoi, onSelectPoi, wireframeMode, mapTypeColor };
  }, [mapData, heightMultiplier, selectedPoi, onSelectPoi, wireframeMode, mapTypeColor]);

  // Handle building/rebuilding scene on target structures change
  useEffect(() => {
    if (!containerRef.current) return;

    // 1. Initial Scene Setup
    const width = containerRef.current.clientWidth || 600;
    const height = containerRef.current.clientHeight || 450;

    const scene = new THREE.Scene();
    // Cyberpunk dark background gradient is simulated via container style, Three.js is transparent
    scene.background = null;

    // 2. Camera Setup
    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);
    camera.position.set(0, 15, 20);

    // 3. Renderer Setup
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    containerRef.current.replaceChildren(renderer.domElement);
    rendererRef.current = renderer;

    // 4. Orbit Controls
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.maxPolarAngle = Math.PI / 2 - 0.05; // don't go below ground
    controls.minDistance = 5;
    controls.maxDistance = 60;
    controlsRef.current = controls;

    // 5. Lighting Setup
    const ambientLight = new THREE.AmbientLight(0x0a1a3a, 1.5);
    scene.add(ambientLight);

    // Cyan key light
    const keyLight = new THREE.DirectionalLight(0x00f0ff, 2.0);
    keyLight.position.set(10, 20, 10);
    scene.add(keyLight);

    // Purple fill light
    const fillLight = new THREE.DirectionalLight(0xbd00ff, 1.2);
    fillLight.position.set(-10, 15, -10);
    scene.add(fillLight);

    // 6. Base Sci-Fi Grid and Compass
    const gridHelper = new THREE.GridHelper(24, 24, 0x00f0ff, 0x072d5c);
    gridHelper.position.y = -0.5;
    scene.add(gridHelper);

    // Base glowing circle compass
    const ringGeo = new THREE.RingGeometry(11, 11.2, 64);
    const ringMat = new THREE.MeshBasicMaterial({
      color: 0x00f0ff,
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0.35,
    });
    const compassRing = new THREE.Mesh(ringGeo, ringMat);
    compassRing.rotation.x = Math.PI / 2;
    compassRing.position.y = -0.48;
    scene.add(compassRing);
    compassRingRef.current = compassRing;

    // Dynamic scale helper circle
    const innerRingGeo = new THREE.RingGeometry(8, 8.1, 4);
    const innerRingMat = new THREE.MeshBasicMaterial({
      color: 0xbd00ff,
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0.25,
    });
    const innerRing = new THREE.Mesh(innerRingGeo, innerRingMat);
    innerRing.rotation.x = Math.PI / 2;
    innerRing.rotation.z = Math.PI / 4;
    innerRing.position.y = -0.48;
    scene.add(innerRing);

    // 7. Interactive Column Terrain Construction
    const columnsGroup = new THREE.Group();
    scene.add(columnsGroup);
    columnsGroupRef.current = columnsGroup;

    // Create 100 meshes representing the 10x10 matrix
    const gridRows = 10;
    const gridCols = 10;
    const cellSize = 1.6;
    const spacing = 0.1;
    const sizeWithSpacing = cellSize + spacing;
    const centerOffset = (gridRows * sizeWithSpacing) / 2 - sizeWithSpacing / 2;

    const columnMeshes: {
      mesh: THREE.Mesh;
      wire: THREE.LineSegments;
      targetHeight: number;
      currentHeight: number;
      row: number;
      col: number;
    }[] = [];

    // Helper to determine active color hex based on mapTypeColor props
    const getThemeColorHex = (typeStr: string) => {
      if (typeStr === "green") return 0x10b981; // emerald
      if (typeStr === "amber") return 0xf59e0b; // amber
      return 0x00f0ff; // cyan default
    };

    const themeColorHex = getThemeColorHex(propsRef.current.mapTypeColor);

    for (let r = 0; r < gridRows; r++) {
      for (let c = 0; c < gridCols; c++) {
        const value = mapData.heightGrid[r]?.[c] || 0;
        const initialHeight = Math.max(0.1, value * heightMultiplier * 0.05);

        const geo = new THREE.BoxGeometry(cellSize, 1, cellSize);
        
        // Custom cyber material with colored top, dark sides
        const capColor = themeColorHex;
        const sidesColor = 0x0f172a; // dark slate

        const cubeMaterials = [
          new THREE.MeshPhongMaterial({ color: sidesColor, transparent: true, opacity: 0.8 }), // px
          new THREE.MeshPhongMaterial({ color: sidesColor, transparent: true, opacity: 0.8 }), // nx
          new THREE.MeshPhongMaterial({ color: capColor, emissive: capColor, emissiveIntensity: 0.5, shininess: 80 }), // py (top)
          new THREE.MeshPhongMaterial({ color: sidesColor }), // ny
          new THREE.MeshPhongMaterial({ color: sidesColor, transparent: true, opacity: 0.8 }), // pz
          new THREE.MeshPhongMaterial({ color: sidesColor, transparent: true, opacity: 0.8 }), // nz
        ];

        const mesh = new THREE.Mesh(geo, cubeMaterials);
        mesh.position.set(
          c * sizeWithSpacing - centerOffset,
          initialHeight / 2 - 0.45,
          r * sizeWithSpacing - centerOffset
        );
        mesh.scale.set(1, initialHeight, 1);
        columnsGroup.add(mesh);

        // Cyber outline borders
        const edges = new THREE.EdgesGeometry(geo);
        const lineMat = new THREE.LineBasicMaterial({
          color: themeColorHex,
          transparent: true,
          opacity: 0.4,
        });
        const wire = new THREE.LineSegments(edges, lineMat);
        mesh.add(wire);

        columnMeshes.push({
          mesh,
          wire,
          targetHeight: initialHeight,
          currentHeight: initialHeight,
          row: r,
          col: c,
        });
      }
    }

    // 8. Visual POI Pins Rendering
    const pinsGroup = new THREE.Group();
    scene.add(pinsGroup);
    pinsGroupRef.current = pinsGroup;

    const pinObjects: {
      mesh: THREE.Mesh;
      poi: PointOfInterest;
      originalY: number;
    }[] = [];

    const buildPins = () => {
      // Clear pins
      pinsGroup.clear();
      pinObjects.length = 0;

      mapData.pointsOfInterest.forEach((poi) => {
        // Calculate cell normalized index
        const colIdx = Math.min(9, Math.max(0, Math.floor((poi.x / 100) * 10)));
        const rowIdx = Math.min(9, Math.max(0, Math.floor((poi.y / 100) * 10)));
        const heightVal = mapData.heightGrid[rowIdx]?.[colIdx] || 0;
        const localHeight = Math.max(0.1, heightVal * heightMultiplier * 0.05);

        // Convert page coordinate % to 3D workspace coordinate
        const pinX = (poi.x / 100) * (gridCols * sizeWithSpacing) - centerOffset - 0.5;
        const pinZ = (poi.y / 100) * (gridRows * sizeWithSpacing) - centerOffset - 0.5;
        const pinBaseY = localHeight - 0.45;

        // Create a dual pyramid octahedron for sci-fi look
        const pinGeo = new THREE.OctahedronGeometry(0.35, 0);
        
        let pinColor = 0x00f0ff; // active cyan
        if (poi.status === "warning") pinColor = 0xf59e0b; // amber
        if (poi.status === "error") pinColor = 0xef4444; // red
        if (selectedPoi && selectedPoi.name === poi.name) {
          pinColor = 0xec4899; // active selection magenta
        }

        const pinMat = new THREE.MeshPhongMaterial({
          color: pinColor,
          emissive: pinColor,
          emissiveIntensity: 0.8,
          transparent: true,
          opacity: 0.9,
          flatShading: true,
        });

        const pinMesh = new THREE.Mesh(pinGeo, pinMat);
        pinMesh.position.set(pinX, pinBaseY + 0.8, pinZ);
        pinsGroup.add(pinMesh);

        // Add small pointing cone below pins
        const bottomConeGeo = new THREE.ConeGeometry(0.08, 0.3, 4);
        const bottomConeMat = new THREE.MeshBasicMaterial({ color: pinColor });
        const bottomCone = new THREE.Mesh(bottomConeGeo, bottomConeMat);
        bottomCone.position.y = -0.4;
        bottomCone.rotation.x = Math.PI;
        pinMesh.add(bottomCone);

        // Add dynamic light ring under pins
        const anchorRingGeo = new THREE.RingGeometry(0.2, 0.25, 8);
        const anchorRingMat = new THREE.MeshBasicMaterial({
          color: pinColor,
          side: THREE.DoubleSide,
          transparent: true,
          opacity: 0.5
        });
        const anchorRing = new THREE.Mesh(anchorRingGeo, anchorRingMat);
        anchorRing.rotation.x = Math.PI / 2;
        anchorRing.position.set(pinX, pinBaseY + 0.05, pinZ);
        pinsGroup.add(anchorRing);

        pinObjects.push({
          mesh: pinMesh,
          poi,
          originalY: pinBaseY + 0.8,
        });

        // Store POI ref on mesh data for Raycasting clicks
        pinMesh.userData = { poi };
      });
    };

    buildPins();

    // 9. Scanning Radar Laser Plane
    const scanPlaneGeo = new THREE.BoxGeometry(gridCols * sizeWithSpacing, 0.05, 0.4);
    const scanPlaneMat = new THREE.MeshBasicMaterial({
      color: themeColorHex,
      transparent: true,
      opacity: 0.6,
      blending: THREE.AdditiveBlending,
    });
    const scannerLine = new THREE.Mesh(scanPlaneGeo, scanPlaneMat);
    scannerLine.position.set(0, 0, 0);
    scene.add(scannerLine);
    scannerLineRef.current = scannerLine;

    // 10. Click Raycaster implementation to select pins in 3D
    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2();

    const onCanvasClick = (event: MouseEvent) => {
      // Get relative coords
      const rect = renderer.domElement.getBoundingClientRect();
      mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
      mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

      raycaster.setFromCamera(mouse, camera);
      const intersects = raycaster.intersectObjects(pinsGroup.children, true);

      if (intersects.length > 0) {
        // Find the top octahedron mesh
        let hitObj = intersects[0].object;
        while (hitObj.parent && hitObj.parent !== pinsGroup && hitObj.parent !== scene) {
          hitObj = hitObj.parent;
        }
        
        if (hitObj.userData && hitObj.userData.poi) {
          propsRef.current.onSelectPoi(hitObj.userData.poi);
        }
      } else {
        // Check if map background was clicked
        const terrainIntersects = raycaster.intersectObjects(columnsGroup.children);
        if (terrainIntersects.length === 0) {
          // Clicked empty space: clear selection
          propsRef.current.onSelectPoi(null);
        }
      }
    };

    renderer.domElement.addEventListener("click", onCanvasClick);

    // 11. Animation Main loop definer
    let scanDirection = 1;
    let scanZ = 0;
    const clock = new THREE.Clock();

    const animate = () => {
      const elapsedTime = clock.getElapsedTime();
      const currentProps = propsRef.current;

      // Rotate compass deco
      if (compassRingRef.current) {
        compassRingRef.current.rotation.z = elapsedTime * 0.08;
      }

      // Scanner laser visual movement
      if (scannerLineRef.current) {
        if (showScanner) {
          scannerLineRef.current.visible = true;
          scanZ += 0.05 * scanDirection;
          const limit = centerOffset + 1;
          if (scanZ > limit) {
            scanZ = limit;
            scanDirection = -1;
          } else if (scanZ < -limit) {
            scanZ = -limit;
            scanDirection = 1;
          }
          scannerLineRef.current.position.set(0, currentProps.heightMultiplier * 0.8, scanZ);
        } else {
          scannerLineRef.current.visible = false;
        }
      }

      // Smooth wireframe mode toggling
      columnMeshes.forEach((colData) => {
        if (colData.wire) {
          colData.wire.visible = true;
          const mat = colData.wire.material as THREE.LineBasicMaterial;
          mat.opacity = currentProps.wireframeMode ? 0.8 : 0.25;
        }
      });

      // Height Interpolation (LERP) for satisfying terrain transition animations
      let heightsNeedRebuild = false;
      columnMeshes.forEach((colData) => {
        const lookupVal = currentProps.mapData.heightGrid[colData.row]?.[colData.col] || 0;
        const target = Math.max(0.1, lookupVal * currentProps.heightMultiplier * 0.05);
        
        // Lerp step
        if (Math.abs(colData.currentHeight - target) > 0.01) {
          colData.currentHeight += (target - colData.currentHeight) * 0.12;
          colData.mesh.scale.set(1, colData.currentHeight, 1);
          colData.mesh.position.y = colData.currentHeight / 2 - 0.45;
          heightsNeedRebuild = true;
        }
      });

      if (heightsNeedRebuild) {
        // Pin layout must adjust dynamically to matching shifting columns heights
        pinObjects.forEach((po) => {
          const colIdx = Math.min(9, Math.max(0, Math.floor((po.poi.x / 100) * 10)));
          const rowIdx = Math.min(9, Math.max(0, Math.floor((po.poi.y / 100) * 10)));
          const currentTerrainHeight = columnMeshes[rowIdx * 10 + colIdx]?.currentHeight || 0.1;
          
          po.originalY = currentTerrainHeight + 0.35;
        });
      }

      // Floating sine wave animation for pins
      pinObjects.forEach((po, idx) => {
        const hoverOffset = Math.sin(elapsedTime * 3 + idx) * 0.12;
        po.mesh.position.y = po.originalY + hoverOffset;
        po.mesh.rotation.y = elapsedTime * 1.2 + idx;

        // Apply visual scale when selected
        if (currentProps.selectedPoi && currentProps.selectedPoi.name === po.poi.name) {
          const pulse = 1.0 + Math.sin(elapsedTime * 6) * 0.1;
          po.mesh.scale.set(pulse * 1.3, pulse * 1.3, pulse * 1.3);
        } else {
          po.mesh.scale.set(1.0, 1.0, 1.0);
        }
      });

      controls.update();
      renderer.render(scene, camera);
      animationFrameRef.current = requestAnimationFrame(animate);
    };

    animate();

    // 12. Safe resize observer
    const handleResize = () => {
      if (!containerRef.current || !rendererRef.current) return;
      const w = containerRef.current.clientWidth;
      const h = containerRef.current.clientHeight;

      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      rendererRef.current.setSize(w, h);
    };

    const resizeObserver = new ResizeObserver(() => {
      handleResize();
    });
    resizeObserver.observe(containerRef.current);

    // 13. Component Cleanup on unmount
    return () => {
      resizeObserver.disconnect();
      if (rendererRef.current && rendererRef.current.domElement) {
        rendererRef.current.domElement.removeEventListener("click", onCanvasClick);
      }
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
      scene.clear();
      renderer.dispose();
      controls.dispose();
    };
  }, [mapData]); // trigger full scene rebuild only when changing core maps structures

  return (
    <div className="relative w-full h-full min-h-[460px] md:min-h-[500px]" id="webgl-container-parent">
      {/* 3D Viewport container */}
      <div
        ref={containerRef}
        className="w-full h-full rounded-2xl overflow-hidden bg-radial from-slate-900/50 via-slate-950 to-black/90 border border-slate-800/80 shadow-2xl"
        id="webgl-canvas-viewport"
      />

      {/* Cyber compass labels */}
      <div className="absolute top-4 left-1/2 -translate-x-1/2 flex items-center gap-16 text-[10px] font-mono text-cyan-400/60 pointer-events-none tracking-[0.2em] uppercase select-none">
        <span>[ N ]</span>
        <div className="w-1 h-1 rounded-full bg-cyan-400 animate-ping" />
        <span>[ 360° ]</span>
      </div>

      {/* Grid status tags */}
      <div className="absolute bottom-4 left-4 font-mono text-[10px] text-slate-400 bg-slate-950/80 px-2.5 py-1.5 rounded border border-slate-800/60 flex items-center gap-2 select-none pointer-events-none shadow-md backdrop-blur">
        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
        <span>SYSTEM: ONLINE (100 PPS)</span>
      </div>

      {/* Quick rotation reset helper */}
      <button
        id="btn-recenter-3d"
        onClick={() => {
          if (controlsRef.current) {
            controlsRef.current.reset();
          }
        }}
        className="absolute bottom-4 right-4 bg-slate-900/90 text-xs px-3 py-1.5 rounded border border-slate-700 hover:border-cyan-400 hover:text-cyan-400 text-slate-300 font-mono transition-all pointer-events-auto cursor-pointer shadow-lg active:scale-95"
        title="Quay góc camera về vị trí ban đầu"
      >
        RECENTER CAMERA
      </button>
    </div>
  );
}
