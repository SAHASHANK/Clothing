'use client';

import React, { useRef, useEffect, useState } from 'react';
import * as THREE from 'three';

export default function HeroCanvas() {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [webglSupported, setWebglSupported] = useState(true);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const container = containerRef.current;
    const canvas = canvasRef.current;
    if (!container || !canvas) return;

    let scene: any, camera: any, renderer: any, mesh: any, particles: any;
    let animationFrameId: number;

    try {
      // 1. Scene Setup
      scene = new THREE.Scene();

      // 2. Camera Setup
      camera = new THREE.PerspectiveCamera(
        45,
        container.clientWidth / container.clientHeight,
        0.1,
        100
      );
      camera.position.z = 5;

      // 3. Renderer Setup
      renderer = new THREE.WebGLRenderer({
        canvas,
        antialias: true,
        alpha: true,
        powerPreference: 'high-performance'
      });
      renderer.setSize(container.clientWidth, container.clientHeight);
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

      // 4. Lights
      const ambientLight = new THREE.AmbientLight(0xffffff, 0.4);
      scene.add(ambientLight);

      const directionalLight = new THREE.DirectionalLight(0xC8FF00, 1.5); // Acid green spotlight
      directionalLight.position.set(5, 5, 5);
      scene.add(directionalLight);

      const pointLight = new THREE.PointLight(0xffffff, 1, 100);
      pointLight.position.set(-5, -5, -2);
      scene.add(pointLight);

      // 5. Create clothing model geometry fallback (a stylized streetwear mesh)
      // We'll create a composite brutalist geometry: Torus Knot + floating rings to look futuristic
      const geometry = new THREE.TorusKnotGeometry(0.8, 0.28, 120, 16);
      const material = new THREE.MeshStandardMaterial({
        color: 0x111111,
        roughness: 0.2,
        metalness: 0.9,
        bumpScale: 0.05,
        wireframe: false
      });
      
      mesh = new THREE.Mesh(geometry, material);
      scene.add(mesh);

      // Add hovering wireframe ring around the knot
      const ringGeo = new THREE.TorusGeometry(1.5, 0.03, 8, 64);
      const ringMat = new THREE.MeshBasicMaterial({
        color: 0xC8FF00,
        transparent: true,
        opacity: 0.6,
        wireframe: true
      });
      const orbitRing = new THREE.Mesh(ringGeo, ringMat);
      orbitRing.rotation.x = Math.PI / 2.5;
      mesh.add(orbitRing);

      // Drifting dust particles inside zero-gravity space
      const partGeo = new THREE.BufferGeometry();
      const pCount = 80;
      const pPositions = new Float32Array(pCount * 3);
      for (let i = 0; i < pCount; i++) {
        pPositions[i * 3] = (Math.random() - 0.5) * 6;
        pPositions[i * 3 + 1] = (Math.random() - 0.5) * 6;
        pPositions[i * 3 + 2] = (Math.random() - 0.5) * 6;
      }
      partGeo.setAttribute('position', new THREE.BufferAttribute(pPositions, 3));
      const partMat = new THREE.PointsMaterial({
        color: 0xC8FF00,
        size: 0.04,
        transparent: true,
        opacity: 0.5
      });
      particles = new THREE.Points(partGeo, partMat);
      scene.add(particles);

      // Mouse movements
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

      // 6. Animation Loop
      const clock = new THREE.Clock();
      
      const tick = () => {
        const elapsed = clock.getElapsedTime();

        // Slow rotations
        mesh.rotation.y = elapsed * 0.15;
        mesh.rotation.x = Math.sin(elapsed * 0.2) * 0.4;
        orbitRing.rotation.z = -elapsed * 0.5;

        // Dynamic float
        mesh.position.y = Math.sin(elapsed * 1.5) * 0.12;

        // Particle drift
        particles.rotation.y = elapsed * 0.05;

        // Interactive mouse lag rotation
        mouse.x += (mouse.targetX - mouse.x) * 0.05;
        mouse.y += (mouse.targetY - mouse.y) * 0.05;

        mesh.rotation.y += mouse.x * 0.5;
        mesh.rotation.x += -mouse.y * 0.5;

        renderer.render(scene, camera);
        animationFrameId = requestAnimationFrame(tick);
      };

      tick();

      return () => {
        cancelAnimationFrame(animationFrameId);
        container.removeEventListener('mousemove', handleMouseMove);
        window.removeEventListener('resize', handleResize);
        geometry.dispose();
        material.dispose();
        ringGeo.dispose();
        ringMat.dispose();
        partGeo.dispose();
        partMat.dispose();
      };
    } catch (error) {
      console.error('WebGL Context creation error:', error);
      setWebglSupported(false);
    }
  }, []);

  return (
    <div ref={containerRef} className="w-full h-full relative flex items-center justify-center">
      {webglSupported ? (
        <canvas ref={canvasRef} className="w-full h-full block" />
      ) : (
        /* Video Fallback / Static Render */
        <div className="absolute inset-0 w-full h-full overflow-hidden flex items-center justify-center bg-[#111] border border-[rgba(240,237,230,0.08)]">
          <video
            autoPlay
            loop
            muted
            playsInline
            className="w-full h-full object-cover opacity-60"
            src="https://assets.mixkit.co/videos/preview/mixkit-guy-in-neon-hoodie-standing-alone-32865-large.mp4"
          />
          <div className="absolute bottom-4 left-4 bg-black/80 px-2 py-1 text-[8px] font-mono tracking-widest text-[#888880] uppercase">
            WebGL Unavailable. Fallback Loop Active.
          </div>
        </div>
      )}
    </div>
  );
}
