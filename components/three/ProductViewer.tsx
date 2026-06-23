'use client';

import React, { useRef, useEffect, useState } from 'react';
import { ZoomIn, RotateCw, Sparkles, Smartphone } from 'lucide-react';
import * as THREE from 'three';

interface ProductViewerProps {
  modelUrl?: string;
  colorName: string;
}

export default function ProductViewer({ modelUrl, colorName }: ProductViewerProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [webglSupported, setWebglSupported] = useState(true);
  const [autoRotate, setAutoRotate] = useState(true);
  const [zoomActive, setZoomActive] = useState(false);

  // References for camera adjustment
  const cameraRef = useRef<any>(null);
  const meshRef = useRef<any>(null);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const container = containerRef.current;
    const canvas = canvasRef.current;
    if (!container || !canvas) return;

    let scene: any, camera: any, renderer: any, particleSystem: any;
    let animationFrameId: number;

    try {
      scene = new THREE.Scene();
      camera = new THREE.PerspectiveCamera(40, container.clientWidth / container.clientHeight, 0.1, 100);
      camera.position.set(0, 0, 4.5);
      cameraRef.current = camera;

      renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
      renderer.setSize(container.clientWidth, container.clientHeight);
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

      // Lightings
      const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
      scene.add(ambientLight);

      const directional1 = new THREE.DirectionalLight(0xffffff, 1.2);
      directional1.position.set(5, 5, 5);
      scene.add(directional1);

      const directional2 = new THREE.DirectionalLight(0xC8FF00, 1.0); // Acid green point
      directional2.position.set(-5, -5, -2);
      scene.add(directional2);

      // Stylized Hoodie Fallback model using Capsule / Torus composite
      const group = new THREE.Group();
      
      // Hoodie Body (Capsule)
      const bodyGeo = new THREE.CapsuleGeometry(0.5, 0.8, 8, 32);
      const bodyMat = new THREE.MeshStandardMaterial({
        color: colorName.toLowerCase().includes('white') ? 0xdddddd : 0x111111,
        roughness: 0.8,
        metalness: 0.1,
        bumpScale: 0.05
      });
      const bodyMesh = new THREE.Mesh(bodyGeo, bodyMat);
      group.add(bodyMesh);

      // Hoodie hood (Sphere)
      const hoodGeo = new THREE.SphereGeometry(0.42, 32, 16);
      const hoodMesh = new THREE.Mesh(hoodGeo, bodyMat);
      hoodMesh.position.y = 0.55;
      group.add(hoodMesh);

      // Logo Plate (Brutalist stack emblem)
      const plateGeo = new THREE.BoxGeometry(0.15, 0.25, 0.05);
      const plateMat = new THREE.MeshBasicMaterial({ color: 0xC8FF00 }); // Acid green branding
      const plateMesh = new THREE.Mesh(plateGeo, plateMat);
      plateMesh.position.set(0, 0.25, 0.48);
      group.add(plateMesh);

      meshRef.current = group;
      scene.add(group);

      // Stars/particles floating in background
      const partGeo = new THREE.BufferGeometry();
      const pCount = 50;
      const pos = new Float32Array(pCount * 3);
      for (let i = 0; i < pCount; i++) {
        pos[i * 3] = (Math.random() - 0.5) * 5;
        pos[i * 3 + 1] = (Math.random() - 0.5) * 5;
        pos[i * 3 + 2] = (Math.random() - 0.5) * 5;
      }
      partGeo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
      const partMat = new THREE.PointsMaterial({
        color: 0xC8FF00,
        size: 0.02,
        transparent: true,
        opacity: 0.4
      });
      particleSystem = new THREE.Points(partGeo, partMat);
      scene.add(particleSystem);

      // Mouse control
      const mouse = { x: 0, y: 0, targetX: 0, targetY: 0 };
      const handleMouseMove = (e: MouseEvent) => {
        const rect = container.getBoundingClientRect();
        mouse.targetX = ((e.clientX - rect.left) / container.clientWidth) * 2 - 1;
        mouse.targetY = -((e.clientY - rect.top) / container.clientHeight) * 2 + 1;
      };
      container.addEventListener('mousemove', handleMouseMove);

      // Resize
      const handleResize = () => {
        if (!container || !camera || !renderer) return;
        camera.aspect = container.clientWidth / container.clientHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(container.clientWidth, container.clientHeight);
      };
      window.addEventListener('resize', handleResize);

      // Render loop
      const clock = new THREE.Clock();
      const tick = () => {
        const elapsed = clock.getElapsedTime();

        if (autoRotate && !zoomActive) {
          group.rotation.y = elapsed * 0.2;
        }

        // Float motion
        group.position.y = Math.sin(elapsed * 1.2) * 0.08;

        // Particle rotation
        particleSystem.rotation.y = elapsed * 0.02;

        // Mouse lag
        mouse.x += (mouse.targetX - mouse.x) * 0.06;
        mouse.y += (mouse.targetY - mouse.y) * 0.06;

        group.rotation.y += mouse.x * 0.3;
        group.rotation.x += -mouse.y * 0.3;

        renderer.render(scene, camera);
        animationFrameId = requestAnimationFrame(tick);
      };

      tick();

      return () => {
        cancelAnimationFrame(animationFrameId);
        container.removeEventListener('mousemove', handleMouseMove);
        window.removeEventListener('resize', handleResize);
        bodyGeo.dispose();
        bodyMat.dispose();
        hoodGeo.dispose();
        plateGeo.dispose();
        plateMat.dispose();
        partGeo.dispose();
        partMat.dispose();
      };
    } catch (err) {
      console.error(err);
      setWebglSupported(false);
    }
  }, [colorName, autoRotate, zoomActive]);

  // Dynamic Camera Close-up (Fabric Macro Zoom)
  const triggerMacroZoom = () => {
    if (!cameraRef.current || !meshRef.current) return;
    const camera = cameraRef.current;
    
    if (zoomActive) {
      // Zoom out back to normal
      camera.position.set(0, 0, 4.5);
      setZoomActive(false);
    } else {
      // Macro zoom onto clothing chest plate
      camera.position.set(0, 0.25, 1.2);
      setZoomActive(true);
    }
  };

  return (
    <div ref={containerRef} className="w-full aspect-square relative bg-[#111111] border border-[rgba(240,237,230,0.08)] flex items-center justify-center overflow-hidden">
      {webglSupported ? (
        <>
          <canvas ref={canvasRef} className="w-full h-full block" />
          
          {/* Controls Overlay */}
          <div className="absolute bottom-4 left-4 right-4 flex justify-between pointer-events-none z-10">
            <div className="flex gap-2">
              <button
                onClick={triggerMacroZoom}
                className="pointer-events-auto bg-black/90 hover:bg-[#C8FF00] hover:text-black border border-[rgba(240,237,230,0.18)] hover:border-[#C8FF00] p-2 text-[#F0EDE6] transition-colors flex items-center gap-1.5 text-[8px] uppercase tracking-widest font-bold"
              >
                <ZoomIn className="h-3.5 w-3.5" /> {zoomActive ? 'Reset Zoom' : 'Macro Zoom'}
              </button>
              
              <button
                onClick={() => setAutoRotate(!autoRotate)}
                className={`pointer-events-auto bg-black/90 border p-2 text-[8px] uppercase tracking-widest font-bold transition-colors flex items-center gap-1.5 ${
                  autoRotate && !zoomActive
                    ? 'border-[#C8FF00] text-[#C8FF00]'
                    : 'border-[rgba(240,237,230,0.18)] text-[#F0EDE6] hover:bg-[#C8FF00] hover:text-black hover:border-[#C8FF00]'
                }`}
              >
                <RotateCw className="h-3.5 w-3.5" /> Auto Rotate
              </button>
            </div>

            {/* Mobile AR View link */}
            <a
              href={`https://unhrd.lab/ar/try-on?model=${encodeURIComponent(modelUrl || '')}`}
              target="_blank"
              rel="noreferrer"
              className="pointer-events-auto bg-black/90 hover:bg-[#C8FF00] hover:text-black border border-[rgba(240,237,230,0.18)] hover:border-[#C8FF00] p-2 text-[#F0EDE6] transition-colors flex items-center gap-1.5 text-[8px] uppercase tracking-widest font-bold"
            >
              <Smartphone className="h-3.5 w-3.5" /> WebXR AR View
            </a>
          </div>
        </>
      ) : (
        /* Video / static image fallback */
        <div className="absolute inset-0 w-full h-full">
          <img
            src="https://images.unsplash.com/photo-1556821840-3a63f95609a7?auto=format&fit=crop&w=800&q=80"
            alt="Product static render"
            className="w-full h-full object-cover"
          />
        </div>
      )}
    </div>
  );
}
