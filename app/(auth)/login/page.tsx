'use client';

import React, { useState, useEffect, useRef } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { Eye, EyeOff, Lock, Mail, ShieldAlert, Globe, User, Sparkles } from 'lucide-react';
import Link from 'next/link';

export default function LoginPage() {
  const router = useRouter();
  
  // Login States
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [totpCode, setTotpCode] = useState('');
  
  // Login Process Stages
  const [is2FARequired, setIs2FARequired] = useState(false);
  const [magicLinkSent, setMagicLinkSent] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  
  // Three.js Canvas Reference
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Background Interactive Mesh in Three.js
  useEffect(() => {
    if (typeof window === 'undefined') return;
    
    let THREE;
    try {
      THREE = require('three');
    } catch (e) {
      console.warn('Three.js not loaded yet');
      return;
    }

    const canvas = canvasRef.current;
    if (!canvas) return;

    const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(canvas.clientWidth, canvas.clientHeight);

    const scene = new THREE.Scene();

    const camera = new THREE.PerspectiveCamera(45, canvas.clientWidth / canvas.clientHeight, 0.1, 100);
    camera.position.z = 12;

    // Create drifting particle cloud
    const count = 120;
    const geometry = new THREE.BufferGeometry();
    const positions = new Float32Array(count * 3);
    const originalPositions = new Float32Array(count * 3);
    const sizes = new Float32Array(count);

    for (let i = 0; i < count; i++) {
      // Points distributed inside sphere
      const u = Math.random();
      const v = Math.random();
      const theta = u * 2.0 * Math.PI;
      const phi = Math.acos(2.0 * v - 1.0);
      const r = Math.cbrt(Math.random()) * 8; // Sphere radius 8

      const x = r * Math.sin(phi) * Math.cos(theta);
      const y = r * Math.sin(phi) * Math.sin(theta);
      const z = r * Math.cos(phi);

      positions[i * 3] = x;
      positions[i * 3 + 1] = y;
      positions[i * 3 + 2] = z;

      originalPositions[i * 3] = x;
      originalPositions[i * 3 + 1] = y;
      originalPositions[i * 3 + 2] = z;

      sizes[i] = Math.random() * 2 + 1;
    }

    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));

    // Custom shader material or simple points
    const material = new THREE.PointsMaterial({
      color: 0xC8FF00, // Acid green points
      size: 0.12,
      transparent: true,
      opacity: 0.45,
      blending: THREE.AdditiveBlending,
    });

    const points = new THREE.Points(geometry, material);
    scene.add(points);

    // Drifting lines connecting nearby points
    const lineMaterial = new THREE.LineBasicMaterial({
      color: 0xF0EDE6,
      transparent: true,
      opacity: 0.08,
    });

    // Create wireframe geometric background helper
    const gridGeometry = new THREE.IcosahedronGeometry(6, 1);
    const gridMaterial = new THREE.MeshBasicMaterial({
      color: 0x111111,
      wireframe: true,
      transparent: true,
      opacity: 0.25,
    });
    const wireframeMesh = new THREE.Mesh(gridGeometry, gridMaterial);
    scene.add(wireframeMesh);

    // Handle mouse movement for repulsion
    const mouse = { x: 0, y: 0, targetX: 0, targetY: 0 };

    const handleMouseMove = (event: MouseEvent) => {
      mouse.targetX = (event.clientX / window.innerWidth) * 2 - 1;
      mouse.targetY = -(event.clientY / window.innerHeight) * 2 + 1;
    };

    window.addEventListener('mousemove', handleMouseMove);

    // Resize
    const handleResize = () => {
      if (!canvas) return;
      camera.aspect = canvas.clientWidth / canvas.clientHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(canvas.clientWidth, canvas.clientHeight);
    };
    window.addEventListener('resize', handleResize);

    // Animation Loop
    let animationFrameId: number;
    let clock = new THREE.Clock();

    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);
      const elapsed = clock.getElapsedTime();

      // Smooth mouse interpolation
      mouse.x += (mouse.targetX - mouse.x) * 0.08;
      mouse.y += (mouse.targetY - mouse.y) * 0.08;

      // Rotate whole scene
      points.rotation.y = elapsed * 0.03;
      points.rotation.x = elapsed * 0.01;
      wireframeMesh.rotation.y = -elapsed * 0.02;

      // repulse points based on mouse coordinates projected in 3D
      const positionAttr = geometry.getAttribute('position') as any;
      const posArray = positionAttr.array;

      for (let i = 0; i < count; i++) {
        const idx = i * 3;
        // Apply tiny drift
        posArray[idx] = originalPositions[idx] + Math.sin(elapsed * 0.5 + i) * 0.2;
        posArray[idx + 1] = originalPositions[idx + 1] + Math.cos(elapsed * 0.3 + i) * 0.2;

        // Mouse Repulsion logic
        const dx = posArray[idx] - mouse.x * 5;
        const dy = posArray[idx + 1] - mouse.y * 5;
        const dist = Math.sqrt(dx * dx + dy * dy);
        
        if (dist < 3) {
          const force = (3 - dist) / 3 * 0.8;
          posArray[idx] += (dx / dist) * force;
          posArray[idx + 1] += (dy / dist) * force;
        }
      }
      positionAttr.needsUpdate = true;

      renderer.render(scene, camera);
    };

    animate();

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  const handleCredentialsLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMessage('');

    try {
      const res = await signIn('credentials', {
        email,
        password,
        totpCode,
        redirect: false,
      });

      if (res?.error) {
        if (res.error.includes('2FA_REQUIRED')) {
          setIs2FARequired(true);
        } else {
          setErrorMessage(res.error.toUpperCase());
        }
      } else {
        router.push('/');
        router.refresh();
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'LOGIN FAILURE');
    } finally {
      setIsLoading(false);
    }
  };

  const handleMagicLink = async (e: React.MouseEvent) => {
    e.preventDefault();
    if (!email) {
      setErrorMessage('EMAIL REQUIRED FOR MAGIC LINK');
      return;
    }
    setIsLoading(true);
    setErrorMessage('');
    
    // Simulate API request to route magic links via Resend
    setTimeout(() => {
      setIsLoading(false);
      setMagicLinkSent(true);
    }, 1200);
  };

  return (
    <div className="relative flex-grow flex items-center justify-center min-h-[calc(100vh-4rem)] bg-[#0a0a0a] overflow-hidden px-4 font-mono select-none">
      
      {/* ThreeJS Background Canvas */}
      <canvas ref={canvasRef} className="absolute inset-0 w-full h-full pointer-events-none opacity-50 z-0" />

      {/* Main Login Card */}
      <div className="relative z-10 w-full max-w-md bg-[#111111]/80 border border-[rgba(240,237,230,0.08)] backdrop-blur-md p-8 sm:p-10 shadow-2xl">
        
        {/* Branding block emblem */}
        <div className="flex flex-col items-center mb-8">
          <div className="bg-[#F0EDE6] text-[#0a0a0a] px-3 py-1.5 flex flex-col items-center justify-center font-bold tracking-tighter leading-none border border-[#F0EDE6] mb-3">
            <span className="text-[12px] tracking-[0.2em] font-extrabold -mb-0.5">N</span>
            <span className="text-[15px] tracking-[0.1em] font-black -my-0.5">HR</span>
            <span className="text-[12px] tracking-[0.15em] font-extrabold -mt-0.5">D.</span>
          </div>
          <h1 className="text-lg font-bold tracking-[0.2em] text-[#F0EDE6]">SYSTEM OPERATIONS</h1>
          <p className="text-[9px] text-[#888880] tracking-widest uppercase mt-1">Authenticate credentials to continue</p>
        </div>

        {errorMessage && (
          <div className="bg-red-950/40 border border-red-500/30 text-red-400 p-3 mb-6 text-[10px] flex items-center gap-2 uppercase font-bold">
            <ShieldAlert className="h-4 w-4 text-red-500 flex-shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        {magicLinkSent ? (
          <div className="bg-[#C8FF00]/10 border border-[#C8FF00]/30 text-[#C8FF00] p-4 text-[10px] text-center space-y-3 uppercase">
            <p className="font-bold">⚡ ONE-TIME SIGNIN TOKEN SENT</p>
            <p className="text-[9px] text-[#888880]">CHECK YOUR INBOX FOR THE SECURE LOGIN HYPERLINK.</p>
            <button
              onClick={() => setMagicLinkSent(false)}
              className="text-white hover:text-[#C8FF00] underline tracking-widest text-[9px] uppercase"
            >
              BACK TO CREDENTIALS
            </button>
          </div>
        ) : (
          <form onSubmit={handleCredentialsLogin} className="space-y-4">
            
            {/* Phase 1: Basic Email / Password */}
            {!is2FARequired ? (
              <>
                <div className="space-y-1">
                  <label className="text-[9px] tracking-widest text-[#888880] uppercase block">email address</label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-3 h-4 w-4 text-[#444440]" />
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="OPERATOR@UNHRD.LAB"
                      className="w-full bg-[#171717] border border-[rgba(240,237,230,0.18)] text-xs text-[#F0EDE6] pl-10 pr-3 py-3 outline-none focus:border-[#C8FF00] transition-colors placeholder-[#444440] uppercase"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <div className="flex justify-between items-center">
                    <label className="text-[9px] tracking-widest text-[#888880] uppercase block">password</label>
                    <a href="#" className="text-[8px] tracking-widest text-[#888880] hover:text-[#C8FF00] uppercase">Forgot?</a>
                  </div>
                  <div className="relative">
                    <Lock className="absolute left-3 top-3 h-4 w-4 text-[#444440]" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••••••"
                      className="w-full bg-[#171717] border border-[rgba(240,237,230,0.18)] text-xs text-[#F0EDE6] pl-10 pr-10 py-3 outline-none focus:border-[#C8FF00] transition-colors placeholder-[#444440]"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-3.5 text-[#888880] hover:text-[#C8FF00]"
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>
              </>
            ) : (
              /* Phase 2: 2FA Prompt */
              <div className="space-y-3 p-4 bg-[#171717] border border-[#C8FF00]/20 text-center">
                <span className="text-[#C8FF00] font-extrabold text-[10px] tracking-widest block uppercase">🔐 TWO-FACTOR SECURITY ENFORCED</span>
                <p className="text-[9px] text-[#888880] uppercase">Input the 6-digit verification code from your authenticator app.</p>
                <input
                  type="text"
                  required
                  maxLength={6}
                  value={totpCode}
                  onChange={(e) => setTotpCode(e.target.value.replace(/\D/g, ''))}
                  placeholder="000 000"
                  className="w-full bg-[#0a0a0a] border border-[#C8FF00]/40 text-center text-lg tracking-[0.5em] text-[#C8FF00] py-2 outline-none focus:border-[#C8FF00]"
                />
              </div>
            )}

            <button
              type="submit"
              disabled={isLoading}
              className="w-full brutalist-button text-xs py-3.5 mt-2 flex items-center justify-center gap-2"
            >
              {isLoading ? 'ESTABLISHING HANDSHAKE...' : is2FARequired ? 'VERIFY & SECURE SIGNIN' : 'INITIALIZE SESSION'}
            </button>

            {/* Magic Link / Guest / OAuth Row */}
            {!is2FARequired && (
              <div className="space-y-4 pt-4 border-t border-[rgba(240,237,230,0.08)]">
                
                {/* Social Login Button */}
                <button
                  type="button"
                  onClick={() => signIn('google')}
                  className="w-full bg-[#171717] hover:bg-[#1a1a1a] border border-[rgba(240,237,230,0.08)] text-xs text-[#F0EDE6] py-3 flex items-center justify-center gap-2 font-bold uppercase transition-colors"
                >
                  <Globe className="h-4 w-4 text-[#C8FF00]" /> Continue with Google
                </button>

                <div className="flex gap-2 justify-between">
                  {/* Magic Link Trigger */}
                  <button
                    type="button"
                    onClick={handleMagicLink}
                    className="text-[9px] uppercase tracking-widest text-[#888880] hover:text-[#C8FF00] underline"
                  >
                    Send Magic Link
                  </button>

                  {/* Guest Checkout Trigger */}
                  <Link
                    href="/catalog"
                    className="text-[9px] uppercase tracking-widest text-[#C8FF00] hover:underline flex items-center gap-1 font-bold"
                  >
                    Continue as Guest <User className="h-3 w-3" />
                  </Link>
                </div>
              </div>
            )}
            
            {is2FARequired && (
              <button
                type="button"
                onClick={() => setIs2FARequired(false)}
                className="w-full text-center text-[9px] uppercase tracking-widest text-[#888880] hover:text-white mt-2"
              >
                Back to credentials
              </button>
            )}

          </form>
        )}

      </div>
    </div>
  );
}
