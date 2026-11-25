'use client';

import { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import {
  ChevronLeft,
  ChevronRight,
  Compass,
  Moon,
  RotateCcw,
  Sun,
  ZoomIn,
  ZoomOut,
} from 'lucide-react';
import type { AppLocale } from '@/lib/i18n';
import type { ManualStep } from './manual-data';
import { createStepBoardTexture } from './canvas-board-texture';

interface LivingWorldCanvasProps {
  locale: AppLocale;
  steps: ManualStep[];
  focusedIndex: number | null;
  onSelectStep: (index: number | null) => void;
  reducedMotion?: boolean;
}

type ProjectedPin = {
  index: number;
  x: number;
  y: number;
  visible: boolean;
};

const POI_ANCHORS = [
  { x: -2.2, z: 1.9 },
  { x: 2.4, z: 1.5 },
  { x: 2.1, z: -2.3 },
  { x: -1.7, z: -2.1 },
];

function heightAt(x: number, z: number): number {
  const r = Math.sqrt(x * x + z * z);
  const peak = 2.65 * Math.exp(-(r * r) / 7.8);
  const ridge =
    0.42 * Math.sin(x * 0.9 + 0.4) * Math.cos(z * 0.85) +
    0.2 * Math.cos(x * 1.8 - z * 1.4);
  const skirt = Math.max(0, 1 - r / 6.2);
  return (peak + ridge * skirt) * skirt;
}

export function LivingWorldCanvas({
  locale,
  steps,
  focusedIndex,
  onSelectStep,
  reducedMotion = false,
}: LivingWorldCanvasProps) {
  const mountRef = useRef<HTMLDivElement>(null);
  const [nightMode, setNightMode] = useState(false);
  const [webglError, setWebglError] = useState(false);
  const [pins, setPins] = useState<ProjectedPin[]>([]);

  const focusedRef = useRef<number | null>(focusedIndex);
  const nightRef = useRef<boolean>(nightMode);
  const zoomRef = useRef<number>(1);
  const manualOrbitRef = useRef<number>(0);

  const boardMeshesRef = useRef<THREE.Mesh[]>([]);
  const texturesRef = useRef<THREE.CanvasTexture[]>([]);

  useEffect(() => {
    focusedRef.current = focusedIndex;
  }, [focusedIndex]);

  useEffect(() => {
    nightRef.current = nightMode;
  }, [nightMode]);

  // Refresh 3D CanvasTextures whenever locale, nightMode, or steps change
  useEffect(() => {
    const meshes = boardMeshesRef.current;
    if (meshes.length === 0) return;

    const theme = nightMode ? 'mountain-night' : 'mountain-day';
    const nextTextures: THREE.CanvasTexture[] = [];

    meshes.forEach((mesh, idx) => {
      const step = steps[idx];
      if (!step) return;
      const tex = createStepBoardTexture(step, idx, locale, theme, 'POI');
      nextTextures.push(tex);
      const mat = mesh.material as THREE.MeshBasicMaterial;
      mat.map = tex;
      mat.needsUpdate = true;
    });

    const prevTextures = texturesRef.current;
    texturesRef.current = nextTextures;
    prevTextures.forEach((t) => t.dispose());
  }, [locale, nightMode, steps]);

  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    let renderer: THREE.WebGLRenderer;
    try {
      renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    } catch {
      queueMicrotask(() => setWebglError(true));
      return;
    }

    const width = container.clientWidth || 720;
    const height = container.clientHeight || 520;
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    container.innerHTML = '';
    container.appendChild(renderer.domElement);

    const scene = new THREE.Scene();
    const dayBg = new THREE.Color('#dff2e6');
    const nightBg = new THREE.Color('#071310');
    scene.background = nightRef.current ? nightBg : dayBg;
    scene.fog = new THREE.FogExp2(nightRef.current ? '#071310' : '#dff2e6', 0.036);

    const camera = new THREE.PerspectiveCamera(42, width / height, 0.1, 100);
    camera.position.set(0, 4.8, 9.2);

    const ambientLight = new THREE.AmbientLight('#ffffff', 0.72);
    scene.add(ambientLight);

    const sunLight = new THREE.DirectionalLight('#fff5dc', 1.25);
    sunLight.position.set(6, 9, 5);
    scene.add(sunLight);

    const rimLight = new THREE.DirectionalLight('#7dd3fc', 0.45);
    rimLight.position.set(-6, 4, -5);
    scene.add(rimLight);

    // Mountain terrain
    const geo = new THREE.PlaneGeometry(11, 11, 64, 64);
    geo.rotateX(-Math.PI / 2);
    const posAttr = geo.attributes.position as THREE.BufferAttribute;
    const colors: number[] = [];

    for (let i = 0; i < posAttr.count; i++) {
      const x = posAttr.getX(i);
      const z = posAttr.getZ(i);
      const y = heightAt(x, z);
      posAttr.setY(i, y);

      const c = new THREE.Color();
      if (y > 2.05) {
        c.set('#e2ece7');
      } else if (y > 1.2) {
        c.set('#2e6b48');
      } else if (y > 0.45) {
        c.set('#3f8259');
      } else {
        c.set('#25563b');
      }
      colors.push(c.r, c.g, c.b);
    }

    geo.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3));
    geo.computeVertexNormals();

    const mountainMat = new THREE.MeshStandardMaterial({
      vertexColors: true,
      roughness: 0.88,
      metalness: 0.05,
      flatShading: true,
    });
    const mountain = new THREE.Mesh(geo, mountainMat);
    scene.add(mountain);

    // Procedural forest cones around slopes
    const treeGeo = new THREE.ConeGeometry(0.11, 0.34, 6);
    const treeMat = new THREE.MeshStandardMaterial({
      color: '#1b4d32',
      roughness: 0.9,
      flatShading: true,
    });
    for (let i = 0; i < 42; i++) {
      const angle = (i / 42) * Math.PI * 2 + (i % 3) * 0.2;
      const rad = 1.4 + ((i * 37) % 28) / 10;
      const tx = Math.cos(angle) * rad;
      const tz = Math.sin(angle) * rad;
      const ty = heightAt(tx, tz);
      if (ty > 0.25 && ty < 1.85) {
        const tree = new THREE.Mesh(treeGeo, treeMat);
        tree.position.set(tx, ty + 0.14, tz);
        scene.add(tree);
      }
    }

    // POI clearings, glowing crystals, and 3D CanvasTexture boards
    const crystalGeo = new THREE.OctahedronGeometry(0.16, 0);
    const padGeo = new THREE.CylinderGeometry(0.46, 0.56, 0.12, 16);
    const padMat = new THREE.MeshStandardMaterial({
      color: '#1f4f38',
      roughness: 0.75,
      flatShading: true,
    });
    const boardGeo = new THREE.PlaneGeometry(2.4, 1.54);

    const crystals: THREE.Mesh[] = [];
    const boards: THREE.Mesh[] = [];
    const initialTextures: THREE.CanvasTexture[] = [];
    const theme = nightRef.current ? 'mountain-night' : 'mountain-day';

    POI_ANCHORS.forEach((anchor, idx) => {
      const baseY = heightAt(anchor.x, anchor.z);

      // Landing pad ("daratan")
      const pad = new THREE.Mesh(padGeo, padMat);
      pad.position.set(anchor.x, baseY + 0.04, anchor.z);
      scene.add(pad);

      // Glowing crystal marker
      const crystalMat = new THREE.MeshStandardMaterial({
        color: '#f59e0b',
        emissive: '#d97706',
        emissiveIntensity: 0.55,
        roughness: 0.25,
      });
      const crystal = new THREE.Mesh(crystalGeo, crystalMat);
      crystal.position.set(anchor.x, baseY + 0.3, anchor.z);
      scene.add(crystal);
      crystals.push(crystal);

      // In-world 3D CanvasTexture board
      const step = steps[idx];
      const tex = step
        ? createStepBoardTexture(step, idx, locale, theme, 'POI')
        : new THREE.CanvasTexture(document.createElement('canvas'));
      initialTextures.push(tex);

      const boardMat = new THREE.MeshBasicMaterial({
        map: tex,
      });
      const board = new THREE.Mesh(boardGeo, boardMat);
      board.position.set(anchor.x, baseY + 0.68, anchor.z);
      board.scale.set(0.22, 0.22, 0.22);
      scene.add(board);
      boards.push(board);
    });

    boardMeshesRef.current = boards;
    texturesRef.current = initialTextures;

    // Drag to orbit
    let isDragging = false;
    let lastX = 0;

    const onPointerDown = (e: PointerEvent) => {
      if (focusedRef.current !== null) return;
      isDragging = true;
      lastX = e.clientX;
    };
    const onPointerMove = (e: PointerEvent) => {
      if (!isDragging || focusedRef.current !== null) return;
      const dx = e.clientX - lastX;
      lastX = e.clientX;
      manualOrbitRef.current -= dx * 0.0065;
    };
    const onPointerUp = () => {
      isDragging = false;
    };

    const dom = renderer.domElement;
    dom.addEventListener('pointerdown', onPointerDown);
    window.addEventListener('pointermove', onPointerMove);
    window.addEventListener('pointerup', onPointerUp);

    const lookTarget = new THREE.Vector3(0, 1.0, 0);
    const desiredLook = new THREE.Vector3(0, 1.0, 0);
    const desiredCam = new THREE.Vector3(0, 4.8, 9.2);
    let autoOrbit = 0;
    let animId = 0;
    let frameCount = 0;

    const animate = () => {
      animId = requestAnimationFrame(animate);
      frameCount++;

      // Smooth day/night transition
      const isNight = nightRef.current;
      scene.background = isNight ? nightBg : dayBg;
      if (scene.fog) {
        scene.fog.color.copy(isNight ? nightBg : dayBg);
      }
      ambientLight.intensity = isNight ? 0.38 : 0.75;
      sunLight.intensity = isNight ? 0.48 : 1.25;

      const focused = focusedRef.current;

      if (focused === null) {
        if (!reducedMotion && !isDragging) {
          autoOrbit += 0.0022;
        }
        const angle = autoOrbit + manualOrbitRef.current;
        const dist = 9.2 / zoomRef.current;
        const camH = 4.6 / Math.sqrt(zoomRef.current);
        desiredCam.set(Math.sin(angle) * dist, camH, Math.cos(angle) * dist);
        desiredLook.set(0, 1.0, 0);
      } else {
        const anchor = POI_ANCHORS[focused] ?? POI_ANCHORS[0];
        const baseY = heightAt(anchor.x, anchor.z);
        const len = Math.hypot(anchor.x, anchor.z) || 1;
        const nx = anchor.x / len;
        const nz = anchor.z / len;

        // Zoom all the way in to face the 3D canvas board on the mountain slope
        desiredCam.set(
          anchor.x + nx * 2.25,
          baseY + 1.08,
          anchor.z + nz * 2.25
        );
        desiredLook.set(anchor.x, baseY + 0.96, anchor.z);
      }

      camera.position.lerp(desiredCam, 0.075);
      lookTarget.lerp(desiredLook, 0.09);
      camera.lookAt(lookTarget);

      // Update crystals & 3D boards
      crystals.forEach((crystal, idx) => {
        const isSel = focused === idx;
        if (!reducedMotion) {
          crystal.rotation.y += isSel ? 0.045 : 0.018;
        }
        const s = isSel ? 1.25 : 1.0;
        crystal.scale.set(s, s, s);
      });

      boards.forEach((board, idx) => {
        const anchor = POI_ANCHORS[idx];
        const baseY = heightAt(anchor.x, anchor.z);
        const isSel = focused === idx;
        const targetScale = isSel ? 1.0 : focused === null ? 0.22 : 0.14;
        const targetY = isSel ? baseY + 0.96 : baseY + 0.68;

        board.scale.lerp(
          new THREE.Vector3(targetScale, targetScale, targetScale),
          0.1
        );
        board.position.y += (targetY - board.position.y) * 0.1;
        board.lookAt(camera.position);
      });

      renderer.render(scene, camera);

      // Project 2D POI pin buttons every 2 frames when in overview
      if (frameCount % 2 === 0) {
        const w = container.clientWidth || width;
        const h = container.clientHeight || height;
        const nextPins: ProjectedPin[] = POI_ANCHORS.map((anchor, idx) => {
          const v = new THREE.Vector3(
            anchor.x,
            heightAt(anchor.x, anchor.z) + 0.35,
            anchor.z
          );
          v.project(camera);
          return {
            index: idx,
            x: (v.x * 0.5 + 0.5) * w,
            y: (-v.y * 0.5 + 0.5) * h,
            visible: v.z < 1,
          };
        });
        setPins(nextPins);
      }
    };

    animate();

    const handleResize = () => {
      if (!container) return;
      const w = container.clientWidth || 720;
      const h = container.clientHeight || 520;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };
    window.addEventListener('resize', handleResize);

    return () => {
      cancelAnimationFrame(animId);
      dom.removeEventListener('pointerdown', onPointerDown);
      window.removeEventListener('pointermove', onPointerMove);
      window.removeEventListener('pointerup', onPointerUp);
      window.removeEventListener('resize', handleResize);
      texturesRef.current.forEach((t) => t.dispose());
      texturesRef.current = [];
      boardMeshesRef.current = [];
      geo.dispose();
      treeGeo.dispose();
      crystalGeo.dispose();
      padGeo.dispose();
      boardGeo.dispose();
      mountainMat.dispose();
      treeMat.dispose();
      padMat.dispose();
      renderer.dispose();
    };
  }, [reducedMotion]); // eslint-disable-line react-hooks/exhaustive-deps

  if (webglError) {
    return (
      <div className="flex h-[min(520px,70dvh)] min-h-[340px] items-center justify-center rounded-2xl border border-emerald-500/20 bg-emerald-950/20 p-6 text-center text-sm text-muted-foreground">
        {locale === 'en'
          ? 'WebGL is unavailable in this browser. Use the quick-picker cards below to read each sub-chapter.'
          : 'WebGL tidak tersedia di browser ini. Gunakan kartu pilihan di bawah untuk membaca setiap sub-bab.'}
      </div>
    );
  }

  return (
    <div className="relative h-[min(520px,70dvh)] min-h-[340px] w-full overflow-hidden rounded-2xl border border-emerald-500/25 shadow-inner">
      <div
        ref={mountRef}
        className="h-full w-full cursor-grab active:cursor-grabbing"
      />

      {/* Top-left compass / status badge */}
      <div className="pointer-events-none absolute left-3 top-3 flex items-center gap-2 rounded-full bg-background/80 px-3 py-1.5 text-xs font-medium backdrop-blur-md">
        <Compass className="h-3.5 w-3.5 text-emerald-500" />
        <span>
          {focusedIndex !== null
            ? `POI 0${focusedIndex + 1} · ${steps[focusedIndex]?.heading[locale] ?? ''}`
            : locale === 'en'
              ? 'Drag to orbit · Click any POI pin to zoom into its 3D canvas'
              : 'Geser untuk putar · Klik pin POI untuk zoom ke kanvas 3D-nya'}
        </span>
      </div>

      {/* Top-right controls */}
      <div className="absolute right-3 top-3 flex items-center gap-1.5">
        {focusedIndex === null && (
          <>
            <button
              type="button"
              onClick={() => {
                zoomRef.current = Math.min(1.65, zoomRef.current + 0.18);
              }}
              aria-label="Zoom in"
              className="flex h-8 w-8 items-center justify-center rounded-full bg-background/80 text-foreground backdrop-blur-md transition hover:bg-background"
            >
              <ZoomIn className="h-4 w-4" />
            </button>
            <button
              type="button"
              onClick={() => {
                zoomRef.current = Math.max(0.75, zoomRef.current - 0.18);
              }}
              aria-label="Zoom out"
              className="flex h-8 w-8 items-center justify-center rounded-full bg-background/80 text-foreground backdrop-blur-md transition hover:bg-background"
            >
              <ZoomOut className="h-4 w-4" />
            </button>
          </>
        )}
        <button
          type="button"
          onClick={() => setNightMode((prev) => !prev)}
          aria-label={nightMode ? 'Switch to day' : 'Switch to night'}
          className="flex h-8 items-center gap-1.5 rounded-full bg-background/80 px-3 text-xs font-medium text-foreground backdrop-blur-md transition hover:bg-background"
        >
          {nightMode ? (
            <Sun className="h-3.5 w-3.5 text-amber-400" />
          ) : (
            <Moon className="h-3.5 w-3.5 text-indigo-500" />
          )}
          <span>{nightMode ? (locale === 'en' ? 'Day' : 'Siang') : locale === 'en' ? 'Night' : 'Malam'}</span>
        </button>
      </div>

      {/* Projected clickable 2D POI pins in Overview */}
      {focusedIndex === null &&
        pins.map((pin) => {
          if (!pin.visible) return null;
          const step = steps[pin.index];
          if (!step) return null;
          return (
            <button
              key={step.id}
              type="button"
              onClick={() => onSelectStep(pin.index)}
              style={{
                left: `${pin.x}px`,
                top: `${pin.y}px`,
                transform: 'translate(-50%, -100%)',
              }}
              className="absolute z-10 flex items-center gap-1.5 rounded-full border border-emerald-400/50 bg-emerald-950/85 px-2.5 py-1 text-xs font-semibold text-emerald-100 shadow-lg backdrop-blur-md transition hover:scale-105 hover:bg-emerald-800"
            >
              <span className="flex h-4 w-4 items-center justify-center rounded-full bg-amber-400 text-[10px] font-bold text-slate-950">
                {pin.index + 1}
              </span>
              <span className="max-w-[140px] truncate">{step.heading[locale]}</span>
            </button>
          );
        })}

      {/* Bottom navigation bar when zoomed into a 3D POI canvas */}
      {focusedIndex !== null && (
        <div className="absolute bottom-3 left-1/2 z-20 flex -translate-x-1/2 items-center gap-2 rounded-full border border-emerald-500/30 bg-background/85 px-3 py-1.5 shadow-xl backdrop-blur-md">
          <button
            type="button"
            onClick={() =>
              onSelectStep((focusedIndex - 1 + steps.length) % steps.length)
            }
            className="flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-medium transition hover:bg-muted"
          >
            <ChevronLeft className="h-3.5 w-3.5" />
            <span>{locale === 'en' ? 'Prev' : 'Seb'}</span>
          </button>
          <button
            type="button"
            onClick={() => onSelectStep(null)}
            className="flex items-center gap-1.5 rounded-full bg-emerald-600 px-3 py-1 text-xs font-semibold text-white transition hover:bg-emerald-500"
          >
            <RotateCcw className="h-3.5 w-3.5" />
            <span>{locale === 'en' ? 'Mountain Overview' : 'Lihat Gunung'}</span>
          </button>
          <button
            type="button"
            onClick={() => onSelectStep((focusedIndex + 1) % steps.length)}
            className="flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-medium transition hover:bg-muted"
          >
            <span>{locale === 'en' ? 'Next' : 'Lanjut'}</span>
            <ChevronRight className="h-3.5 w-3.5" />
          </button>
        </div>
      )}
    </div>
  );
}
