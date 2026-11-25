'use client';

import { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import {
  ChevronLeft,
  ChevronRight,
  Orbit,
  RotateCcw,
  ZoomIn,
  ZoomOut,
} from 'lucide-react';
import type { AppLocale } from '@/lib/i18n';
import type { ManualStep } from './manual-data';
import { createStepBoardTexture } from './canvas-board-texture';

interface SolarSystemCanvasProps {
  locale: AppLocale;
  steps: ManualStep[];
  focusedIndex: number | null;
  onSelectStep: (index: number | null) => void;
  reducedMotion?: boolean;
}

type PlanetConfig = {
  orbitRadius: number;
  size: number;
  speed: number;
  color: string;
  emissive: string;
  initialAngle: number;
  hasRing?: boolean;
};

type ProjectedPlanet = {
  index: number;
  x: number;
  y: number;
  visible: boolean;
};

const PLANETS: PlanetConfig[] = [
  {
    orbitRadius: 3.1,
    size: 0.42,
    speed: 0.72,
    color: '#38bdf8',
    emissive: '#0284c7',
    initialAngle: 0.4,
  },
  {
    orbitRadius: 4.7,
    size: 0.54,
    speed: 0.48,
    color: '#34d399',
    emissive: '#059669',
    initialAngle: 2.1,
    hasRing: true,
  },
  {
    orbitRadius: 6.4,
    size: 0.46,
    speed: 0.34,
    color: '#fb923c',
    emissive: '#ea580c',
    initialAngle: 3.9,
  },
  {
    orbitRadius: 8.1,
    size: 0.4,
    speed: 0.24,
    color: '#c084fc',
    emissive: '#9333ea',
    initialAngle: 5.3,
    hasRing: true,
  },
];

export function SolarSystemCanvas({
  locale,
  steps,
  focusedIndex,
  onSelectStep,
  reducedMotion = false,
}: SolarSystemCanvasProps) {
  const mountRef = useRef<HTMLDivElement>(null);
  const [webglError, setWebglError] = useState(false);
  const [labels, setLabels] = useState<ProjectedPlanet[]>([]);

  const focusedRef = useRef<number | null>(focusedIndex);
  const zoomRef = useRef<number>(1);
  const manualYawRef = useRef<number>(0);

  const boardMeshesRef = useRef<THREE.Mesh[]>([]);
  const texturesRef = useRef<THREE.CanvasTexture[]>([]);

  useEffect(() => {
    focusedRef.current = focusedIndex;
  }, [focusedIndex]);

  // Refresh 3D CanvasTextures whenever locale or steps change
  useEffect(() => {
    const meshes = boardMeshesRef.current;
    if (meshes.length === 0) return;

    const nextTextures: THREE.CanvasTexture[] = [];
    meshes.forEach((mesh, idx) => {
      const step = steps[idx];
      if (!step) return;
      const tex = createStepBoardTexture(step, idx, locale, 'space', 'PLANET');
      nextTextures.push(tex);
      const mat = mesh.material as THREE.MeshBasicMaterial;
      mat.map = tex;
      mat.needsUpdate = true;
    });

    const prevTextures = texturesRef.current;
    texturesRef.current = nextTextures;
    prevTextures.forEach((t) => t.dispose());
  }, [locale, steps]);

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
    scene.background = new THREE.Color('#040814');

    const camera = new THREE.PerspectiveCamera(42, width / height, 0.1, 150);
    camera.position.set(0, 7.6, 13.8);

    const ambientLight = new THREE.AmbientLight('#94a3b8', 0.65);
    scene.add(ambientLight);

    const sunLight = new THREE.PointLight('#fde68a', 2.4, 45);
    sunLight.position.set(0, 0, 0);
    scene.add(sunLight);

    // Starfield
    const starCount = 500;
    const starPositions = new Float32Array(starCount * 3);
    for (let i = 0; i < starCount; i++) {
      const r = 24 + ((i * 19) % 28);
      const theta = ((i * 73) % 360) * (Math.PI / 180);
      const phi = (((i * 41) % 180) - 90) * (Math.PI / 180);
      starPositions[i * 3] = r * Math.cos(phi) * Math.cos(theta);
      starPositions[i * 3 + 1] = r * Math.sin(phi);
      starPositions[i * 3 + 2] = r * Math.cos(phi) * Math.sin(theta);
    }
    const starGeo = new THREE.BufferGeometry();
    starGeo.setAttribute(
      'position',
      new THREE.BufferAttribute(starPositions, 3)
    );
    const starMat = new THREE.PointsMaterial({
      color: '#e2e8f0',
      size: 0.12,
      transparent: true,
      opacity: 0.8,
    });
    const stars = new THREE.Points(starGeo, starMat);
    scene.add(stars);

    // Central Sun
    const sunGeo = new THREE.SphereGeometry(1.15, 32, 32);
    const sunMat = new THREE.MeshBasicMaterial({ color: '#f59e0b' });
    const sun = new THREE.Mesh(sunGeo, sunMat);
    scene.add(sun);

    const coronaGeo = new THREE.SphereGeometry(1.38, 24, 24);
    const coronaMat = new THREE.MeshBasicMaterial({
      color: '#fbbf24',
      transparent: true,
      opacity: 0.22,
    });
    const corona = new THREE.Mesh(coronaGeo, coronaMat);
    scene.add(corona);

    // Orbit rings + planets + 3D CanvasTexture boards
    const orbitGeos: THREE.BufferGeometry[] = [];
    const planetGeos: THREE.BufferGeometry[] = [];
    const boardGeo = new THREE.PlaneGeometry(2.35, 1.5);

    const planetGroups: THREE.Group[] = [];
    const planetMeshes: THREE.Mesh[] = [];
    const boards: THREE.Mesh[] = [];
    const initialTextures: THREE.CanvasTexture[] = [];
    const angles = PLANETS.map((p) => p.initialAngle);

    PLANETS.forEach((cfg, idx) => {
      // Orbit ring
      const orbitGeo = new THREE.RingGeometry(
        cfg.orbitRadius - 0.025,
        cfg.orbitRadius + 0.025,
        96
      );
      orbitGeo.rotateX(-Math.PI / 2);
      orbitGeos.push(orbitGeo);
      const orbitMat = new THREE.MeshBasicMaterial({
        color: '#334155',
        side: THREE.DoubleSide,
        transparent: true,
        opacity: 0.55,
      });
      const orbitRing = new THREE.Mesh(orbitGeo, orbitMat);
      scene.add(orbitRing);

      // Planet group
      const group = new THREE.Group();
      const pGeo = new THREE.SphereGeometry(cfg.size, 28, 28);
      planetGeos.push(pGeo);
      const pMat = new THREE.MeshStandardMaterial({
        color: cfg.color,
        emissive: cfg.emissive,
        emissiveIntensity: 0.28,
        roughness: 0.55,
      });
      const pMesh = new THREE.Mesh(pGeo, pMat);
      group.add(pMesh);

      if (cfg.hasRing) {
        const ringGeo = new THREE.RingGeometry(
          cfg.size * 1.35,
          cfg.size * 1.85,
          40
        );
        ringGeo.rotateX(-Math.PI / 2.4);
        orbitGeos.push(ringGeo);
        const ringMat = new THREE.MeshBasicMaterial({
          color: cfg.color,
          side: THREE.DoubleSide,
          transparent: true,
          opacity: 0.45,
        });
        const ringMesh = new THREE.Mesh(ringGeo, ringMat);
        group.add(ringMesh);
      }

      group.position.set(
        Math.cos(angles[idx]) * cfg.orbitRadius,
        0,
        Math.sin(angles[idx]) * cfg.orbitRadius
      );
      scene.add(group);
      planetGroups.push(group);
      planetMeshes.push(pMesh);

      // In-world 3D CanvasTexture board anchored above the planet
      const step = steps[idx];
      const tex = step
        ? createStepBoardTexture(step, idx, locale, 'space', 'PLANET')
        : new THREE.CanvasTexture(document.createElement('canvas'));
      initialTextures.push(tex);

      const boardMat = new THREE.MeshBasicMaterial({ map: tex });
      const board = new THREE.Mesh(boardGeo, boardMat);
      board.position.set(
        group.position.x,
        cfg.size + 0.92,
        group.position.z
      );
      board.scale.set(0.14, 0.14, 0.14);
      scene.add(board);
      boards.push(board);
    });

    boardMeshesRef.current = boards;
    texturesRef.current = initialTextures;

    // Drag to orbit camera in Overview
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
      manualYawRef.current -= dx * 0.006;
    };
    const onPointerUp = () => {
      isDragging = false;
    };

    const dom = renderer.domElement;
    dom.addEventListener('pointerdown', onPointerDown);
    window.addEventListener('pointermove', onPointerMove);
    window.addEventListener('pointerup', onPointerUp);

    const lookTarget = new THREE.Vector3(0, 0, 0);
    const desiredLook = new THREE.Vector3(0, 0, 0);
    const desiredCam = new THREE.Vector3(0, 7.6, 13.8);
    let animId = 0;
    let frameCount = 0;

    const animate = () => {
      animId = requestAnimationFrame(animate);
      frameCount++;

      const focused = focusedRef.current;

      // Orbit planets in Overview; pause orbit when zoomed into a planet's 3D canvas
      PLANETS.forEach((cfg, idx) => {
        if (focused === null && !reducedMotion) {
          angles[idx] += cfg.speed * 0.006;
        }
        const px = Math.cos(angles[idx]) * cfg.orbitRadius;
        const pz = Math.sin(angles[idx]) * cfg.orbitRadius;
        planetGroups[idx].position.set(px, 0, pz);

        if (!reducedMotion) {
          planetMeshes[idx].rotation.y += 0.01;
        }
      });

      if (!reducedMotion) {
        stars.rotation.y += 0.0003;
      }

      if (focused === null) {
        const yaw = manualYawRef.current;
        const dist = 13.8 / zoomRef.current;
        const camH = 7.4 / Math.sqrt(zoomRef.current);
        desiredCam.set(Math.sin(yaw) * dist, camH, Math.cos(yaw) * dist);
        desiredLook.set(0, 0, 0);
      } else {
        const pGroup = planetGroups[focused] ?? planetGroups[0];
        const pCfg = PLANETS[focused] ?? PLANETS[0];
        const px = pGroup.position.x;
        const pz = pGroup.position.z;
        const len = Math.hypot(px, pz) || 1;
        const nx = px / len;
        const nz = pz / len;

        // Zoom all the way into the planet's 3D surface canvas
        desiredCam.set(px + nx * 2.25, pCfg.size + 1.0, pz + nz * 2.25);
        desiredLook.set(px, pCfg.size + 0.9, pz);
      }

      camera.position.lerp(desiredCam, 0.075);
      lookTarget.lerp(desiredLook, 0.09);
      camera.lookAt(lookTarget);

      boards.forEach((board, idx) => {
        const pGroup = planetGroups[idx];
        const pCfg = PLANETS[idx];
        const isSel = focused === idx;
        const targetScale = isSel ? 1.0 : focused === null ? 0.14 : 0.08;

        board.position.set(
          pGroup.position.x,
          pCfg.size + (isSel ? 0.92 : 0.65),
          pGroup.position.z
        );
        board.scale.lerp(
          new THREE.Vector3(targetScale, targetScale, targetScale),
          0.1
        );
        board.lookAt(camera.position);
      });

      renderer.render(scene, camera);

      if (frameCount % 2 === 0) {
        const w = container.clientWidth || width;
        const h = container.clientHeight || height;
        const nextLabels: ProjectedPlanet[] = planetGroups.map((grp, idx) => {
          const v = new THREE.Vector3(
            grp.position.x,
            PLANETS[idx].size + 0.4,
            grp.position.z
          );
          v.project(camera);
          return {
            index: idx,
            x: (v.x * 0.5 + 0.5) * w,
            y: (-v.y * 0.5 + 0.5) * h,
            visible: v.z < 1,
          };
        });
        setLabels(nextLabels);
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
      starGeo.dispose();
      starMat.dispose();
      sunGeo.dispose();
      sunMat.dispose();
      coronaGeo.dispose();
      coronaMat.dispose();
      boardGeo.dispose();
      orbitGeos.forEach((g) => g.dispose());
      planetGeos.forEach((g) => g.dispose());
      renderer.dispose();
    };
  }, [reducedMotion]); // eslint-disable-line react-hooks/exhaustive-deps

  if (webglError) {
    return (
      <div className="flex h-[520px] items-center justify-center rounded-2xl border border-sky-500/20 bg-slate-950/80 p-6 text-center text-sm text-slate-300">
        {locale === 'en'
          ? 'WebGL is unavailable in this browser. Use the planet cards below to read each sub-chapter.'
          : 'WebGL tidak tersedia di browser ini. Gunakan kartu planet di bawah untuk membaca setiap sub-bab.'}
      </div>
    );
  }

  return (
    <div className="relative h-[520px] w-full overflow-hidden rounded-2xl border border-sky-500/25 bg-slate-950 shadow-inner">
      <div
        ref={mountRef}
        className="h-full w-full cursor-grab active:cursor-grabbing"
      />

      {/* Top-left solar system status */}
      <div className="pointer-events-none absolute left-3 top-3 flex items-center gap-2 rounded-full bg-slate-900/80 px-3 py-1.5 text-xs font-medium text-sky-100 backdrop-blur-md">
        <Orbit className="h-3.5 w-3.5 text-sky-400" />
        <span>
          {focusedIndex !== null
            ? `Planet 0${focusedIndex + 1} · ${steps[focusedIndex]?.heading[locale] ?? ''}`
            : locale === 'en'
              ? 'Drag to orbit · Click any planet to zoom into its 3D canvas'
              : 'Geser untuk putar · Klik planet mana saja untuk zoom ke kanvas 3D-nya'}
        </span>
      </div>

      {/* Top-right zoom controls */}
      {focusedIndex === null && (
        <div className="absolute right-3 top-3 flex items-center gap-1.5">
          <button
            type="button"
            onClick={() => {
              zoomRef.current = Math.min(1.65, zoomRef.current + 0.18);
            }}
            aria-label="Zoom in"
            className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-900/80 text-sky-100 backdrop-blur-md transition hover:bg-slate-800"
          >
            <ZoomIn className="h-4 w-4" />
          </button>
          <button
            type="button"
            onClick={() => {
              zoomRef.current = Math.max(0.72, zoomRef.current - 0.18);
            }}
            aria-label="Zoom out"
            className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-900/80 text-sky-100 backdrop-blur-md transition hover:bg-slate-800"
          >
            <ZoomOut className="h-4 w-4" />
          </button>
        </div>
      )}

      {/* Projected clickable 2D planet pills in Overview */}
      {focusedIndex === null &&
        labels.map((lbl) => {
          if (!lbl.visible) return null;
          const step = steps[lbl.index];
          if (!step) return null;
          return (
            <button
              key={step.id}
              type="button"
              onClick={() => onSelectStep(lbl.index)}
              style={{
                left: `${lbl.x}px`,
                top: `${lbl.y}px`,
                transform: 'translate(-50%, -100%)',
              }}
              className="absolute z-10 flex items-center gap-1.5 rounded-full border border-sky-400/45 bg-slate-900/85 px-2.5 py-1 text-xs font-semibold text-sky-100 shadow-lg backdrop-blur-md transition hover:scale-105 hover:bg-sky-900"
            >
              <span className="flex h-4 w-4 items-center justify-center rounded-full bg-sky-400 text-[10px] font-bold text-slate-950">
                {lbl.index + 1}
              </span>
              <span className="max-w-[140px] truncate">{step.heading[locale]}</span>
            </button>
          );
        })}

      {/* Bottom navigation bar when zoomed into a planet's 3D canvas */}
      {focusedIndex !== null && (
        <div className="absolute bottom-3 left-1/2 z-20 flex -translate-x-1/2 items-center gap-2 rounded-full border border-sky-500/35 bg-slate-900/90 px-3 py-1.5 text-sky-100 shadow-xl backdrop-blur-md">
          <button
            type="button"
            onClick={() =>
              onSelectStep((focusedIndex - 1 + steps.length) % steps.length)
            }
            className="flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-medium transition hover:bg-slate-800"
          >
            <ChevronLeft className="h-3.5 w-3.5" />
            <span>{locale === 'en' ? 'Prev' : 'Seb'}</span>
          </button>
          <button
            type="button"
            onClick={() => onSelectStep(null)}
            className="flex items-center gap-1.5 rounded-full bg-sky-500 px-3 py-1 text-xs font-semibold text-slate-950 transition hover:bg-sky-400"
          >
            <RotateCcw className="h-3.5 w-3.5" />
            <span>
              {locale === 'en' ? 'Solar Overview' : 'Kembali ke Tata Surya'}
            </span>
          </button>
          <button
            type="button"
            onClick={() => onSelectStep((focusedIndex + 1) % steps.length)}
            className="flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-medium transition hover:bg-slate-800"
          >
            <span>{locale === 'en' ? 'Next' : 'Lanjut'}</span>
            <ChevronRight className="h-3.5 w-3.5" />
          </button>
        </div>
      )}
    </div>
  );
}
