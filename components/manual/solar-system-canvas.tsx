"use client";

import { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { Orbit, RotateCcw, ZoomIn, ZoomOut } from "lucide-react";

import type { AppLocale } from "@/lib/i18n";
import { cn } from "@/lib/utils";
import type { ManualStep } from "./manual-data";

type PlanetConfig = {
  orbitRadius: number;
  size: number;
  speed: number;
  initialAngle: number;
  color: number;
  emissive: number;
  hasRing?: boolean;
};

const PLANETS: PlanetConfig[] = [
  { orbitRadius: 3.1, size: 0.42, speed: 0.46, initialAngle: 0.4, color: 0x34d399, emissive: 0x065f46 },
  { orbitRadius: 4.7, size: 0.54, speed: 0.32, initialAngle: 2.0, color: 0xf59e0b, emissive: 0x92400e, hasRing: true },
  { orbitRadius: 6.4, size: 0.46, speed: 0.23, initialAngle: 3.8, color: 0x38bdf8, emissive: 0x075985 },
  { orbitRadius: 8.1, size: 0.4, speed: 0.17, initialAngle: 5.2, color: 0xa78bfa, emissive: 0x4c1d95 },
];

export function SolarSystemCanvas({
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
  const labelRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const [webglError, setWebglError] = useState(false);

  const focusedRef = useRef<number | null>(focusedIndex);
  const reducedRef = useRef(reducedMotion);
  const orbitCamRef = useRef({ theta: 0.85, phi: 1.04, radius: 15.5, targetTheta: 0.85 });

  useEffect(() => {
    focusedRef.current = focusedIndex;
  }, [focusedIndex]);

  useEffect(() => {
    reducedRef.current = reducedMotion;
  }, [reducedMotion]);

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
    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 150);
    const camPos = new THREE.Vector3(10, 8, 12);
    const camLook = new THREE.Vector3(0, 0, 0);
    const desiredPos = new THREE.Vector3();
    const desiredLook = new THREE.Vector3();

    scene.add(new THREE.AmbientLight(0xbbe6d6, 0.65));
    const sunLight = new THREE.PointLight(0xfff1c2, 2.6, 55);
    scene.add(sunLight);

    // Bintang latar belakang 3D
    const starPositions: number[] = [];
    for (let i = 0; i < 480; i++) {
      const r = 28 + (i % 19) * 1.4;
      const theta = i * 2.39996;
      const phi = Math.acos(1 - (2 * ((i * 37) % 100)) / 100);
      starPositions.push(
        r * Math.sin(phi) * Math.cos(theta),
        r * Math.cos(phi),
        r * Math.sin(phi) * Math.sin(theta),
      );
    }
    const starGeo = new THREE.BufferGeometry();
    starGeo.setAttribute("position", new THREE.Float32BufferAttribute(starPositions, 3));
    const stars = new THREE.Points(
      starGeo,
      new THREE.PointsMaterial({ color: 0xe2f5ea, size: 0.14, transparent: true, opacity: 0.85 }),
    );
    scene.add(stars);

    // Matahari pusat (Leuser Core)
    const sun = new THREE.Mesh(
      new THREE.SphereGeometry(1.18, 28, 28),
      new THREE.MeshStandardMaterial({
        color: 0xfbbf24,
        emissive: 0xf59e0b,
        emissiveIntensity: 0.9,
        roughness: 0.3,
      }),
    );
    scene.add(sun);

    const sunHalo = new THREE.Mesh(
      new THREE.SphereGeometry(1.42, 24, 24),
      new THREE.MeshBasicMaterial({ color: 0xfde68a, transparent: true, opacity: 0.18 }),
    );
    scene.add(sunHalo);

    // Garis orbit & planet-planet
    const planetGroups: THREE.Group[] = [];
    const planetMeshes: THREE.Mesh[] = [];

    PLANETS.forEach((cfg) => {
      const orbitPts: number[] = [];
      for (let s = 0; s < 64; s++) {
        const a = (s / 64) * Math.PI * 2;
        orbitPts.push(Math.cos(a) * cfg.orbitRadius, 0, Math.sin(a) * cfg.orbitRadius);
      }
      const orbitGeo = new THREE.BufferGeometry();
      orbitGeo.setAttribute("position", new THREE.Float32BufferAttribute(orbitPts, 3));
      const orbitLine = new THREE.LineLoop(
        orbitGeo,
        new THREE.LineBasicMaterial({ color: 0x4b7762, transparent: true, opacity: 0.45 }),
      );
      scene.add(orbitLine);

      const group = new THREE.Group();
      const sphere = new THREE.Mesh(
        new THREE.SphereGeometry(cfg.size, 24, 24),
        new THREE.MeshStandardMaterial({
          color: cfg.color,
          emissive: cfg.emissive,
          emissiveIntensity: 0.35,
          roughness: 0.55,
          metalness: 0.12,
        }),
      );
      group.add(sphere);

      if (cfg.hasRing) {
        const ring = new THREE.Mesh(
          new THREE.TorusGeometry(cfg.size * 1.65, 0.055, 8, 36),
          new THREE.MeshStandardMaterial({ color: 0xfde68a, roughness: 0.4 }),
        );
        ring.rotation.x = Math.PI / 2.4;
        group.add(ring);
      }

      scene.add(group);
      planetGroups.push(group);
      planetMeshes.push(sphere);
    });

    // Interaksi drag & zoom
    let dragging = false;
    let prevX = 0;
    let prevY = 0;

    const onDown = (e: PointerEvent) => {
      dragging = true;
      prevX = e.clientX;
      prevY = e.clientY;
    };
    const onMove = (e: PointerEvent) => {
      if (!dragging) return;
      const dx = e.clientX - prevX;
      const dy = e.clientY - prevY;
      prevX = e.clientX;
      prevY = e.clientY;
      orbitCamRef.current.targetTheta -= dx * 0.008;
      orbitCamRef.current.phi = Math.max(0.35, Math.min(1.35, orbitCamRef.current.phi - dy * 0.006));
    };
    const onUp = () => {
      dragging = false;
    };
    const onWheel = (e: WheelEvent) => {
      e.preventDefault();
      orbitCamRef.current.radius = Math.max(8, Math.min(24, orbitCamRef.current.radius + e.deltaY * 0.01));
    };

    const dom = renderer.domElement;
    dom.addEventListener("pointerdown", onDown);
    dom.addEventListener("wheel", onWheel, { passive: false });
    window.addEventListener("pointermove", onMove);
    window.addEventListener("pointerup", onUp);

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
    let simTime = 0;
    let lastNow = performance.now();
    const proj = new THREE.Vector3();

    const animate = (now: number) => {
      const dt = Math.min(0.05, (now - lastNow) / 1000);
      lastNow = now;
      if (!reducedRef.current) {
        simTime += dt;
      }

      // Posisikan semua planet di orbitnya
      PLANETS.forEach((cfg, idx) => {
        const angle = cfg.initialAngle + simTime * cfg.speed;
        const px = Math.cos(angle) * cfg.orbitRadius;
        const pz = Math.sin(angle) * cfg.orbitRadius;
        planetGroups[idx].position.set(px, 0, pz);
        planetMeshes[idx].rotation.y = simTime * 0.8;
      });

      sun.rotation.y = simTime * 0.25;
      stars.rotation.y = simTime * 0.015;

      const focusIdx = focusedRef.current;
      const st = orbitCamRef.current;

      if (focusIdx !== null && planetGroups[focusIdx]) {
        const target = planetGroups[focusIdx].position;
        const angleOut = Math.atan2(target.z, target.x) + 0.55;
        desiredPos.set(
          target.x + Math.cos(angleOut) * 2.7,
          1.15,
          target.z + Math.sin(angleOut) * 2.7,
        );
        desiredLook.copy(target);
      } else {
        if (!dragging && !reducedRef.current) {
          st.targetTheta += 0.0018;
        }
        st.theta += (st.targetTheta - st.theta) * 0.08;
        desiredPos.set(
          st.radius * Math.sin(st.phi) * Math.cos(st.theta),
          st.radius * Math.cos(st.phi),
          st.radius * Math.sin(st.phi) * Math.sin(st.theta),
        );
        desiredLook.set(0, 0, 0);
      }

      camPos.lerp(desiredPos, 0.08);
      camLook.lerp(desiredLook, 0.08);
      camera.position.copy(camPos);
      camera.lookAt(camLook);

      // Proyeksikan posisi planet ke label tombol 2D
      const w = container.clientWidth || 680;
      const h = container.clientHeight || 420;
      PLANETS.forEach((cfg, idx) => {
        const el = labelRefs.current[idx];
        if (!el) return;
        proj.copy(planetGroups[idx].position);
        proj.y += cfg.size + 0.35;
        proj.project(camera);
        const visible = proj.z < 1 && proj.x > -1.05 && proj.x < 1.05 && proj.y > -1.05 && proj.y < 1.05;
        const sx = (proj.x * 0.5 + 0.5) * w;
        const sy = (-proj.y * 0.5 + 0.5) * h;
        el.style.transform = `translate(-50%, -100%) translate(${sx.toFixed(1)}px, ${sy.toFixed(1)}px)`;
        el.style.opacity = visible ? "1" : "0";
        el.style.pointerEvents = visible ? "auto" : "none";
      });

      renderer.render(scene, camera);
      raf = requestAnimationFrame(animate);
    };
    raf = requestAnimationFrame(animate);

    return () => {
      cancelAnimationFrame(raf);
      dom.removeEventListener("pointerdown", onDown);
      dom.removeEventListener("wheel", onWheel);
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerup", onUp);
      window.removeEventListener("resize", onResize);
      renderer.dispose();
      if (dom.parentNode === container) container.removeChild(dom);
    };
  }, []);

  const zoomBy = (delta: number) => {
    if (focusedIndex !== null) onSelectStep(null);
    orbitCamRef.current.radius = Math.max(8, Math.min(24, orbitCamRef.current.radius + delta));
  };

  const resetView = () => {
    onSelectStep(null);
    orbitCamRef.current = { theta: 0.85, phi: 1.04, radius: 15.5, targetTheta: 0.85 };
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
    <div className="relative h-[420px] w-full overflow-hidden rounded-2xl border border-line bg-gradient-to-b from-[#040911] via-[#091522] to-[#0c1e1a]">
      <div ref={containerRef} className="h-full w-full cursor-grab active:cursor-grabbing" />

      {/* Label Planet Interaktif */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        {steps.slice(0, PLANETS.length).map((step, idx) => (
          <button
            key={step.id}
            ref={(el) => {
              labelRefs.current[idx] = el;
            }}
            type="button"
            onClick={() => onSelectStep(focusedIndex === idx ? null : idx)}
            className={cn(
              "absolute left-0 top-0 inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[11px] font-bold shadow-lg backdrop-blur transition-colors",
              focusedIndex === idx
                ? "border-white bg-primary text-white ring-4 ring-primary/40"
                : "border-white/50 bg-[#0b1622]/85 text-white hover:border-white hover:bg-primary",
            )}
          >
            <span className="font-mono text-amber-300">0{idx + 1}</span>
            <span>{step.badge?.[locale] ?? step.heading[locale]}</span>
          </button>
        ))}
      </div>

      <div className="pointer-events-none absolute left-3 top-3">
        <span className="rounded-xl bg-black/65 px-3 py-1.5 text-xs font-semibold text-white backdrop-blur">
          {focusedIndex !== null
            ? locale === "en"
              ? `Zoomed to Planet 0${focusedIndex + 1} · Click Solar System to return`
              : `Zoom ke Planet 0${focusedIndex + 1} · Klik Tata Surya untuk kembali`
            : locale === "en"
              ? "3D Wildlife Solar System · Click any planet to zoom in"
              : "Tata Surya 3D Satwa · Klik planet mana saja untuk zoom in"}
        </span>
      </div>

      <div className="absolute right-3 top-3 flex items-center gap-1.5">
        {focusedIndex !== null ? (
          <button
            type="button"
            onClick={() => onSelectStep(null)}
            className="inline-flex items-center gap-1.5 rounded-xl bg-primary px-3 py-1.5 text-xs font-bold text-white shadow hover:bg-primary-dark"
          >
            <Orbit className="size-3.5" />
            {locale === "en" ? "Back to Solar System" : "Kembali ke Tata Surya"}
          </button>
        ) : null}
        <button
          type="button"
          aria-label="Zoom in"
          onClick={() => zoomBy(-2)}
          className="inline-flex size-8 items-center justify-center rounded-xl bg-black/65 text-white backdrop-blur hover:bg-black"
        >
          <ZoomIn className="size-3.5" />
        </button>
        <button
          type="button"
          aria-label="Zoom out"
          onClick={() => zoomBy(2)}
          className="inline-flex size-8 items-center justify-center rounded-xl bg-black/65 text-white backdrop-blur hover:bg-black"
        >
          <ZoomOut className="size-3.5" />
        </button>
        <button
          type="button"
          aria-label="Reset camera"
          onClick={resetView}
          className="inline-flex size-8 items-center justify-center rounded-xl bg-black/65 text-white backdrop-blur hover:bg-black"
        >
          <RotateCcw className="size-3.5" />
        </button>
      </div>
    </div>
  );
}
