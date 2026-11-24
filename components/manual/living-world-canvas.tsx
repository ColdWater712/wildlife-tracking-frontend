"use client";

import { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { Compass, Moon, RotateCcw, Sun, ZoomIn, ZoomOut } from "lucide-react";

import type { AppLocale } from "@/lib/i18n";
import { cn } from "@/lib/utils";
import type { ManualStep } from "./manual-data";

type PoiAnchor = {
  x: number;
  z: number;
  camDist: number;
  camHeight: number;
};

const POI_ANCHORS: PoiAnchor[] = [
  { x: -2.2, z: 1.9, camDist: 4.1, camHeight: 2.3 },
  { x: 2.4, z: 1.5, camDist: 4.2, camHeight: 2.1 },
  { x: 2.1, z: -2.3, camDist: 4.1, camHeight: 2.0 },
  { x: -1.7, z: -2.1, camDist: 4.0, camHeight: 2.5 },
];

type ProjectedPin = {
  index: number;
  x: number;
  y: number;
  visible: boolean;
};

export function LivingWorldCanvas({
  locale,
  steps,
  focusedIndex,
  onSelectStep,
  reducedMotion = false,
}: {
  locale: AppLocale;
  steps: ManualStep[];
  focusedIndex: number | null;
  onSelectStep: (index: number | null) => void;
  reducedMotion?: boolean;
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const pinRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const [nightMode, setNightMode] = useState(false);
  const [webglError, setWebglError] = useState(false);

  const nightRef = useRef(nightMode);
  const reducedRef = useRef(reducedMotion);
  const focusedRef = useRef<number | null>(focusedIndex);
  const orbitRef = useRef({ theta: 0.65, phi: 0.94, radius: 13.5, targetTheta: 0.65 });

  useEffect(() => {
    nightRef.current = nightMode;
  }, [nightMode]);

  useEffect(() => {
    reducedRef.current = reducedMotion;
  }, [reducedMotion]);

  useEffect(() => {
    focusedRef.current = focusedIndex;
  }, [focusedIndex]);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    let renderer: THREE.WebGLRenderer;
    try {
      renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    } catch {
      queueMicrotask(() => setWebglError(true));
      return;
    }

    const width = container.clientWidth || 680;
    const height = container.clientHeight || 420;
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    renderer.setSize(width, height);
    container.appendChild(renderer.domElement);

    const scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(0xd8ebe2, 0.028);

    const camera = new THREE.PerspectiveCamera(44, width / height, 0.1, 120);
    const camPos = new THREE.Vector3(9, 7, 9);
    const camLook = new THREE.Vector3(0, 0.7, 0);
    const desiredPos = new THREE.Vector3();
    const desiredLook = new THREE.Vector3();

    const hemiLight = new THREE.HemisphereLight(0xdff5ff, 0x1d3b2a, 1.1);
    scene.add(hemiLight);
    const dirLight = new THREE.DirectionalLight(0xfff4d6, 1.45);
    dirLight.position.set(8, 13, 6);
    scene.add(dirLight);

    const worldGroup = new THREE.Group();
    scene.add(worldGroup);

    const heightAt = (x: number, z: number) => {
      const dist = Math.sqrt(x * x + z * z);
      const peak1 = Math.exp(-((x + 1.4) ** 2 + (z + 0.9) ** 2) * 0.18) * 3.6;
      const peak2 = Math.exp(-((x - 2.1) ** 2 + (z - 1.2) ** 2) * 0.22) * 2.7;
      const ridge = Math.sin(x * 0.75) * Math.cos(z * 0.65) * 0.6;
      const riverCut = Math.exp(-((z - Math.sin(x * 0.45) * 1.4) ** 2) * 1.35) * 0.75;
      const islandMask = Math.max(0, 1 - (dist / 8.2) ** 2);
      return Math.max(-0.35, (peak1 + peak2 + ridge + 0.45 - riverCut) * islandMask - 0.15);
    };

    // Gunung & Lembah Leuser
    const terrainGeo = new THREE.PlaneGeometry(16, 16, 52, 52);
    terrainGeo.rotateX(-Math.PI / 2);
    const pos = terrainGeo.attributes.position;
    const colors: number[] = [];

    for (let i = 0; i < pos.count; i++) {
      const x = pos.getX(i);
      const z = pos.getZ(i);
      const y = heightAt(x, z);
      pos.setY(i, y);

      if (y < 0.05) {
        colors.push(0.14, 0.44, 0.48);
      } else if (y < 1.25) {
        colors.push(0.18, 0.48, 0.28);
      } else if (y < 2.3) {
        colors.push(0.25, 0.43, 0.3);
      } else {
        colors.push(0.52, 0.58, 0.55);
      }
    }
    terrainGeo.setAttribute("color", new THREE.Float32BufferAttribute(colors, 3));
    terrainGeo.computeVertexNormals();

    const terrain = new THREE.Mesh(
      terrainGeo,
      new THREE.MeshStandardMaterial({
        vertexColors: true,
        flatShading: true,
        roughness: 0.86,
        metalness: 0.06,
      }),
    );
    worldGroup.add(terrain);

    // Sungai
    const waterGeo = new THREE.PlaneGeometry(13.5, 13.5);
    waterGeo.rotateX(-Math.PI / 2);
    const water = new THREE.Mesh(
      waterGeo,
      new THREE.MeshStandardMaterial({
        color: 0x2c8da8,
        transparent: true,
        opacity: 0.72,
        roughness: 0.22,
        metalness: 0.25,
      }),
    );
    water.position.y = -0.02;
    worldGroup.add(water);

    // Pohon hutan hujan
    const trunkMat = new THREE.MeshStandardMaterial({ color: 0x4b3621, flatShading: true });
    const leafMat = new THREE.MeshStandardMaterial({ color: 0x2a663b, flatShading: true });
    const trunkGeo = new THREE.CylinderGeometry(0.05, 0.08, 0.35, 5);
    const crownGeo = new THREE.ConeGeometry(0.26, 0.65, 6);

    for (let i = 0; i < 44; i++) {
      const angle = i * 2.39996;
      const r = 1.15 + ((i * 0.73) % 4.6);
      const x = Math.cos(angle) * r;
      const z = Math.sin(angle) * r;
      const y = heightAt(x, z);
      if (y > 0.14 && y < 2.2) {
        const tree = new THREE.Group();
        const trunk = new THREE.Mesh(trunkGeo, trunkMat);
        trunk.position.y = 0.17;
        const crown = new THREE.Mesh(crownGeo, leafMat);
        crown.position.y = 0.55;
        tree.add(trunk, crown);
        tree.position.set(x, y, z);
        const s = 0.75 + (i % 5) * 0.12;
        tree.scale.set(s, s, s);
        worldGroup.add(tree);
      }
    }

    // Awan melayang
    const cloudMat = new THREE.MeshStandardMaterial({
      color: 0xffffff,
      transparent: true,
      opacity: 0.75,
      flatShading: true,
    });
    const clouds: THREE.Group[] = [];
    for (let c = 0; c < 4; c++) {
      const cloud = new THREE.Group();
      for (let b = 0; b < 3; b++) {
        const puff = new THREE.Mesh(new THREE.DodecahedronGeometry(0.45 - b * 0.08, 0), cloudMat);
        puff.position.set(b * 0.36 - 0.3, (b % 2) * 0.12, 0);
        cloud.add(puff);
      }
      cloud.position.set(-4 + c * 2.6, 4.3 + (c % 2) * 0.45, -2.5 + c * 1.4);
      clouds.push(cloud);
      worldGroup.add(cloud);
    }

    // 4 Beacon POI fisik di 4 sisi gunung
    const poiWorldPositions: THREE.Vector3[] = [];
    const poiCrystals: THREE.Mesh[] = [];
    const poiRings: THREE.Mesh[] = [];

    POI_ANCHORS.forEach((anchor, idx) => {
      const y = heightAt(anchor.x, anchor.z);
      const basePos = new THREE.Vector3(anchor.x, y, anchor.z);
      poiWorldPositions.push(new THREE.Vector3(anchor.x, y + 0.95, anchor.z));

      const beam = new THREE.Mesh(
        new THREE.CylinderGeometry(0.03, 0.03, 0.85, 8),
        new THREE.MeshBasicMaterial({ color: 0x34d399, transparent: true, opacity: 0.7 }),
      );
      beam.position.set(basePos.x, basePos.y + 0.42, basePos.z);
      worldGroup.add(beam);

      const crystal = new THREE.Mesh(
        new THREE.OctahedronGeometry(0.22, 0),
        new THREE.MeshStandardMaterial({
          color: idx % 2 === 0 ? 0xfbbf24 : 0x34d399,
          emissive: idx % 2 === 0 ? 0xd97706 : 0x059669,
          emissiveIntensity: 0.65,
          flatShading: true,
        }),
      );
      crystal.position.set(basePos.x, basePos.y + 0.92, basePos.z);
      poiCrystals.push(crystal);
      worldGroup.add(crystal);

      const ringGeo = new THREE.RingGeometry(0.24, 0.34, 24);
      ringGeo.rotateX(-Math.PI / 2);
      const ring = new THREE.Mesh(
        ringGeo,
        new THREE.MeshBasicMaterial({ color: 0xfef08a, transparent: true, opacity: 0.75 }),
      );
      ring.position.set(basePos.x, basePos.y + 0.06, basePos.z);
      poiRings.push(ring);
      worldGroup.add(ring);
    });

    // Interaksi drag orbit & scroll zoom
    let dragging = false;
    let prevX = 0;
    let prevY = 0;

    const onPointerDown = (e: PointerEvent) => {
      dragging = true;
      prevX = e.clientX;
      prevY = e.clientY;
    };
    const onPointerMove = (e: PointerEvent) => {
      if (!dragging) return;
      const dx = e.clientX - prevX;
      const dy = e.clientY - prevY;
      prevX = e.clientX;
      prevY = e.clientY;
      orbitRef.current.targetTheta -= dx * 0.008;
      orbitRef.current.phi = Math.max(0.42, Math.min(1.3, orbitRef.current.phi - dy * 0.006));
    };
    const onPointerUp = () => {
      dragging = false;
    };
    const onWheel = (e: WheelEvent) => {
      e.preventDefault();
      orbitRef.current.radius = Math.max(6.5, Math.min(20, orbitRef.current.radius + e.deltaY * 0.01));
    };

    const dom = renderer.domElement;
    dom.addEventListener("pointerdown", onPointerDown);
    dom.addEventListener("wheel", onWheel, { passive: false });
    window.addEventListener("pointermove", onPointerMove);
    window.addEventListener("pointerup", onPointerUp);

    const onResize = () => {
      if (!container) return;
      const w = container.clientWidth || 680;
      const h = container.clientHeight || 420;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };
    window.addEventListener("resize", onResize);

    let raf = 0;
    const clock = new THREE.Clock();
    const proj = new THREE.Vector3();

    const animate = () => {
      const elapsed = clock.getElapsedTime();
      const isNight = nightRef.current;

      if (scene.fog) {
        scene.fog.color.setHex(isNight ? 0x0b161e : 0xd8ebe2);
      }
      hemiLight.intensity = isNight ? 0.48 : 1.1;
      dirLight.intensity = isNight ? 0.6 : 1.45;
      dirLight.color.setHex(isNight ? 0x7ec8ff : 0xfff4d6);
      cloudMat.opacity = isNight ? 0.25 : 0.75;

      const focusIdx = focusedRef.current;
      const st = orbitRef.current;

      if (focusIdx !== null && POI_ANCHORS[focusIdx] && poiWorldPositions[focusIdx]) {
        const poi = poiWorldPositions[focusIdx];
        const anchor = POI_ANCHORS[focusIdx];
        const radialAngle = Math.atan2(poi.z, poi.x);
        desiredPos.set(
          poi.x + Math.cos(radialAngle) * anchor.camDist,
          poi.y + anchor.camHeight,
          poi.z + Math.sin(radialAngle) * anchor.camDist,
        );
        desiredLook.set(poi.x, poi.y - 0.15, poi.z);
      } else {
        if (!dragging && !reducedRef.current) {
          st.targetTheta += 0.0032;
        }
        st.theta += (st.targetTheta - st.theta) * 0.08;
        desiredPos.set(
          st.radius * Math.sin(st.phi) * Math.cos(st.theta),
          st.radius * Math.cos(st.phi),
          st.radius * Math.sin(st.phi) * Math.sin(st.theta),
        );
        desiredLook.set(0, 0.7, 0);
      }

      camPos.lerp(desiredPos, 0.08);
      camLook.lerp(desiredLook, 0.08);
      camera.position.copy(camPos);
      camera.lookAt(camLook);

      if (!reducedRef.current) {
        clouds.forEach((cloud, idx) => {
          cloud.position.x = ((cloud.position.x + 0.004 * (idx % 2 === 0 ? 1 : 0.7) + 6) % 12) - 6;
        });
        poiCrystals.forEach((crystal, idx) => {
          crystal.rotation.y = elapsed * (idx === focusIdx ? 2.4 : 1.2);
          const s = idx === focusIdx ? 1.3 : 1;
          crystal.scale.set(s, s, s);
        });
        poiRings.forEach((ring, idx) => {
          const pulse = 1 + Math.sin(elapsed * 3 + idx) * (idx === focusIdx ? 0.32 : 0.14);
          ring.scale.set(pulse, 1, pulse);
        });
      }

      // Proyeksikan 4 POI 3D ke koordinat layar 2D untuk tombol pin interaktif
      const w = container.clientWidth || 680;
      const h = container.clientHeight || 420;
      const pins: ProjectedPin[] = poiWorldPositions.map((wp, idx) => {
        proj.copy(wp).project(camera);
        return {
          index: idx,
          x: (proj.x * 0.5 + 0.5) * w,
          y: (-proj.y * 0.5 + 0.5) * h - 14,
          visible: proj.z < 1 && proj.x > -1.05 && proj.x < 1.05 && proj.y > -1.05 && proj.y < 1.05,
        };
      });

      pins.forEach((pin) => {
        const el = pinRefs.current[pin.index];
        if (!el) return;
        el.style.transform = `translate(-50%, -100%) translate(${pin.x.toFixed(1)}px, ${pin.y.toFixed(1)}px)`;
        el.style.opacity = pin.visible ? "1" : "0";
        el.style.pointerEvents = pin.visible ? "auto" : "none";
      });

      renderer.render(scene, camera);
      raf = requestAnimationFrame(animate);
    };
    animate();

    return () => {
      cancelAnimationFrame(raf);
      dom.removeEventListener("pointerdown", onPointerDown);
      dom.removeEventListener("wheel", onWheel);
      window.removeEventListener("pointermove", onPointerMove);
      window.removeEventListener("pointerup", onPointerUp);
      window.removeEventListener("resize", onResize);
      renderer.dispose();
      if (dom.parentNode === container) container.removeChild(dom);
    };
  }, []);

  const zoomBy = (delta: number) => {
    if (focusedIndex !== null) onSelectStep(null);
    orbitRef.current.radius = Math.max(6.5, Math.min(20, orbitRef.current.radius + delta));
  };

  const resetView = () => {
    onSelectStep(null);
    orbitRef.current = { theta: 0.65, phi: 0.94, radius: 13.5, targetTheta: 0.65 };
  };

  if (webglError) {
    return (
      <div className="flex h-72 items-center justify-center rounded-2xl border border-line bg-surface-muted p-6 text-center text-sm text-muted">
        {locale === "en"
          ? "WebGL is unavailable on this browser. Switch to Normal Mode to read all chapters."
          : "WebGL tidak tersedia di browser ini. Gunakan Normal Mode untuk membaca seluruh bab."}
      </div>
    );
  }

  return (
    <div
      className={cn(
        "relative h-[420px] w-full overflow-hidden rounded-2xl border border-line transition-colors duration-500",
        nightMode
          ? "bg-gradient-to-b from-[#07131c] via-[#0d2229] to-[#122b23]"
          : "bg-gradient-to-b from-[#a8d5e5] via-[#d7ece3] to-[#eaf3ec]",
      )}
    >
      <div ref={containerRef} className="h-full w-full cursor-grab active:cursor-grabbing" />

      {/* Pin POI 3D terproyeksi */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        {steps.slice(0, POI_ANCHORS.length).map((step, idx) => (
          <button
            key={step.id}
            ref={(el) => {
              pinRefs.current[idx] = el;
            }}
            type="button"
            onClick={() => onSelectStep(focusedIndex === idx ? null : idx)}
            className={cn(
              "absolute left-0 top-0 inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[11px] font-bold shadow-lg backdrop-blur transition-colors",
              focusedIndex === idx
                ? "border-white bg-primary text-white ring-4 ring-primary/40"
                : "border-white/80 bg-forest-black/80 text-white hover:bg-primary",
            )}
          >
            <span className="font-mono text-amber-300">0{idx + 1}</span>
            <span>{step.badge?.[locale] ?? step.heading[locale]}</span>
          </button>
        ))}
      </div>

      <div className="pointer-events-none absolute left-3 top-3 flex flex-wrap items-center gap-2">
        <span className="rounded-xl bg-forest-black/75 px-3 py-1.5 text-xs font-semibold text-white backdrop-blur">
          {focusedIndex !== null
            ? locale === "en"
              ? `Zoomed to POI 0${focusedIndex + 1} · Click Overview to spin`
              : `Zoom ke POI 0${focusedIndex + 1} · Klik Overview untuk memutar`
            : locale === "en"
              ? "Rotating Mountain · Drag to orbit · Scroll/Click POI to zoom"
              : "Gunung Berputar · Seret untuk orbit · Scroll/Klik POI untuk zoom"}
        </span>
      </div>

      <div className="absolute right-3 top-3 flex items-center gap-1.5">
        {focusedIndex !== null ? (
          <button
            type="button"
            onClick={() => onSelectStep(null)}
            className="inline-flex items-center gap-1.5 rounded-xl bg-primary px-3 py-1.5 text-xs font-bold text-white shadow hover:bg-primary-dark"
          >
            <Compass className="size-3.5" />
            {locale === "en" ? "Overview (Spin)" : "Overview (Putar)"}
          </button>
        ) : null}
        <button
          type="button"
          onClick={() => setNightMode((v) => !v)}
          className="inline-flex items-center gap-1.5 rounded-xl bg-forest-black/75 px-3 py-1.5 text-xs font-semibold text-white backdrop-blur transition hover:bg-forest-black"
        >
          {nightMode ? <Sun className="size-3.5" /> : <Moon className="size-3.5" />}
          {nightMode ? (locale === "en" ? "Day" : "Siang") : locale === "en" ? "Night" : "Malam"}
        </button>
        <button
          type="button"
          aria-label="Zoom in"
          onClick={() => zoomBy(-2)}
          className="inline-flex size-8 items-center justify-center rounded-xl bg-forest-black/75 text-white backdrop-blur hover:bg-forest-black"
        >
          <ZoomIn className="size-3.5" />
        </button>
        <button
          type="button"
          aria-label="Zoom out"
          onClick={() => zoomBy(2)}
          className="inline-flex size-8 items-center justify-center rounded-xl bg-forest-black/75 text-white backdrop-blur hover:bg-forest-black"
        >
          <ZoomOut className="size-3.5" />
        </button>
        <button
          type="button"
          aria-label="Reset camera"
          onClick={resetView}
          className="inline-flex size-8 items-center justify-center rounded-xl bg-forest-black/75 text-white backdrop-blur hover:bg-forest-black"
        >
          <RotateCcw className="size-3.5" />
        </button>
      </div>
    </div>
  );
}
