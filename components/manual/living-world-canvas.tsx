"use client";

import { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { Moon, RotateCcw, Sun, ZoomIn, ZoomOut } from "lucide-react";

import type { AppLocale } from "@/lib/i18n";
import { cn } from "@/lib/utils";
import type { ManualStep } from "./manual-data";

export function LivingWorldCanvas({
  locale,
  steps,
  activeStepIndex,
  onSelectStep,
  reducedMotion = false,
}: {
  locale: AppLocale;
  steps: ManualStep[];
  activeStepIndex: number;
  onSelectStep: (index: number) => void;
  reducedMotion?: boolean;
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [nightMode, setNightMode] = useState(false);
  const [webglError, setWebglError] = useState(false);
  const nightRef = useRef(nightMode);
  const reducedRef = useRef(reducedMotion);
  const cameraStateRef = useRef({ theta: 0.7, phi: 0.92, radius: 13.5, targetTheta: 0.7 });

  useEffect(() => {
    nightRef.current = nightMode;
  }, [nightMode]);

  useEffect(() => {
    reducedRef.current = reducedMotion;
  }, [reducedMotion]);

  // Fokuskan sudut kamera saat user memilih langkah/waypoint.
  useEffect(() => {
    cameraStateRef.current.targetTheta = 0.5 + activeStepIndex * 1.15;
  }, [activeStepIndex]);

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

    const width = container.clientWidth || 640;
    const height = container.clientHeight || 380;
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    renderer.setSize(width, height);
    container.appendChild(renderer.domElement);

    const scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(0xd8ebe2, 0.032);

    const camera = new THREE.PerspectiveCamera(44, width / height, 0.1, 100);

    // Pencahayaan siang & malam
    const hemiLight = new THREE.HemisphereLight(0xdff5ff, 0x1d3b2a, 1.05);
    scene.add(hemiLight);
    const dirLight = new THREE.DirectionalLight(0xfff4d6, 1.45);
    dirLight.position.set(8, 12, 6);
    scene.add(dirLight);

    const worldGroup = new THREE.Group();
    scene.add(worldGroup);

    // Medan pegunungan prosedural Bukit Barisan / Gunung Leuser
    const terrainGeo = new THREE.PlaneGeometry(16, 16, 48, 48);
    terrainGeo.rotateX(-Math.PI / 2);
    const pos = terrainGeo.attributes.position;
    const colors: number[] = [];

    const heightAt = (x: number, z: number) => {
      const dist = Math.sqrt(x * x + z * z);
      const peak1 = Math.exp(-((x + 1.8) ** 2 + (z + 1.2) ** 2) * 0.18) * 3.4;
      const peak2 = Math.exp(-((x - 2.3) ** 2 + (z - 1.5) ** 2) * 0.22) * 2.5;
      const ridge = Math.sin(x * 0.7) * Math.cos(z * 0.6) * 0.65;
      const riverCut = Math.exp(-((z - Math.sin(x * 0.45) * 1.4) ** 2) * 1.4) * 0.75;
      const islandMask = Math.max(0, 1 - (dist / 8.2) ** 2);
      return Math.max(-0.35, (peak1 + peak2 + ridge + 0.4 - riverCut) * islandMask - 0.15);
    };

    for (let i = 0; i < pos.count; i++) {
      const x = pos.getX(i);
      const z = pos.getZ(i);
      const y = heightAt(x, z);
      pos.setY(i, y);

      if (y < 0.05) {
        colors.push(0.14, 0.44, 0.48); // tepi sungai / lembah basah
      } else if (y < 1.2) {
        colors.push(0.18, 0.46, 0.27); // hutan dataran rendah
      } else if (y < 2.2) {
        colors.push(0.24, 0.42, 0.29); // hutan pegunungan
      } else {
        colors.push(0.49, 0.56, 0.52); // puncak berbatu
      }
    }
    terrainGeo.setAttribute("color", new THREE.Float32BufferAttribute(colors, 3));
    terrainGeo.computeVertexNormals();

    const terrainMat = new THREE.MeshStandardMaterial({
      vertexColors: true,
      flatShading: true,
      roughness: 0.88,
      metalness: 0.05,
    });
    const terrain = new THREE.Mesh(terrainGeo, terrainMat);
    worldGroup.add(terrain);

    // Permukaan air sungai
    const waterGeo = new THREE.PlaneGeometry(13.5, 13.5);
    waterGeo.rotateX(-Math.PI / 2);
    const waterMat = new THREE.MeshStandardMaterial({
      color: 0x2c8da8,
      transparent: true,
      opacity: 0.72,
      roughness: 0.25,
      metalness: 0.2,
    });
    const water = new THREE.Mesh(waterGeo, waterMat);
    water.position.y = -0.02;
    worldGroup.add(water);

    // Pohon-pohon hutan hujan tropis
    const trunkMat = new THREE.MeshStandardMaterial({ color: 0x4b3621, flatShading: true });
    const leafMat = new THREE.MeshStandardMaterial({ color: 0x2a663b, flatShading: true });
    const trunkGeo = new THREE.CylinderGeometry(0.05, 0.08, 0.35, 5);
    const crownGeo = new THREE.ConeGeometry(0.26, 0.65, 6);

    for (let i = 0; i < 42; i++) {
      const angle = i * 2.39996;
      const r = 1.1 + ((i * 0.73) % 4.6);
      const x = Math.cos(angle) * r;
      const z = Math.sin(angle) * r;
      const y = heightAt(x, z);
      if (y > 0.12 && y < 2.15) {
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

    // Awan melayang lembut
    const cloudMat = new THREE.MeshStandardMaterial({
      color: 0xffffff,
      transparent: true,
      opacity: 0.78,
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
      cloud.position.set(-4 + c * 2.6, 4.1 + (c % 2) * 0.45, -2.5 + c * 1.4);
      clouds.push(cloud);
      worldGroup.add(cloud);
    }

    // Titik satwa / kunang-kunang GPS yang bersinar
    const trackerGeo = new THREE.SphereGeometry(0.11, 10, 10);
    const trackerMat = new THREE.MeshBasicMaterial({ color: 0xfbbf24 });
    const trackers: { mesh: THREE.Mesh; baseX: number; baseZ: number; phase: number }[] = [];
    for (let t = 0; t < 8; t++) {
      const mesh = new THREE.Mesh(trackerGeo, trackerMat);
      const angle = (t / 8) * Math.PI * 2;
      const baseX = Math.cos(angle) * (1.8 + (t % 3) * 0.8);
      const baseZ = Math.sin(angle) * (1.8 + (t % 3) * 0.8);
      trackers.push({ mesh, baseX, baseZ, phase: t * 0.9 });
      worldGroup.add(mesh);
    }

    // Interaksi drag orbit
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
      cameraStateRef.current.targetTheta -= dx * 0.008;
      cameraStateRef.current.phi = Math.max(0.45, Math.min(1.28, cameraStateRef.current.phi - dy * 0.006));
    };
    const onPointerUp = () => {
      dragging = false;
    };

    const dom = renderer.domElement;
    dom.addEventListener("pointerdown", onPointerDown);
    window.addEventListener("pointermove", onPointerMove);
    window.addEventListener("pointerup", onPointerUp);

    const onResize = () => {
      if (!container) return;
      const w = container.clientWidth || 640;
      const h = container.clientHeight || 380;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };
    window.addEventListener("resize", onResize);

    let raf = 0;
    const clock = new THREE.Clock();

    const animate = () => {
      const elapsed = clock.getElapsedTime();
      const isNight = nightRef.current;

      // Transisi atmosfer siang / malam
      scene.fog.color.setHex(isNight ? 0x0b161e : 0xd8ebe2);
      hemiLight.intensity = isNight ? 0.45 : 1.05;
      dirLight.intensity = isNight ? 0.55 : 1.45;
      dirLight.color.setHex(isNight ? 0x7ec8ff : 0xfff4d6);
      cloudMat.opacity = isNight ? 0.25 : 0.78;

      if (!dragging && !reducedRef.current) {
        cameraStateRef.current.targetTheta += 0.0018;
      }

      const st = cameraStateRef.current;
      st.theta += (st.targetTheta - st.theta) * 0.08;

      camera.position.x = st.radius * Math.sin(st.phi) * Math.cos(st.theta);
      camera.position.y = st.radius * Math.cos(st.phi);
      camera.position.z = st.radius * Math.sin(st.phi) * Math.sin(st.theta);
      camera.lookAt(0, 0.7, 0);

      if (!reducedRef.current) {
        clouds.forEach((cloud, idx) => {
          cloud.position.x = ((cloud.position.x + 0.004 * (idx % 2 === 0 ? 1 : 0.7) + 6) % 12) - 6;
        });
        trackers.forEach((tr) => {
          const x = tr.baseX + Math.sin(elapsed * 0.7 + tr.phase) * 0.45;
          const z = tr.baseZ + Math.cos(elapsed * 0.6 + tr.phase) * 0.45;
          tr.mesh.position.set(x, heightAt(x, z) + 0.28 + Math.sin(elapsed * 2 + tr.phase) * 0.08, z);
        });
      }

      renderer.render(scene, camera);
      raf = requestAnimationFrame(animate);
    };
    animate();

    return () => {
      cancelAnimationFrame(raf);
      dom.removeEventListener("pointerdown", onPointerDown);
      window.removeEventListener("pointermove", onPointerMove);
      window.removeEventListener("pointerup", onPointerUp);
      window.removeEventListener("resize", onResize);
      renderer.dispose();
      if (dom.parentNode === container) container.removeChild(dom);
    };
  }, []);

  const zoomBy = (delta: number) => {
    cameraStateRef.current.radius = Math.max(8, Math.min(20, cameraStateRef.current.radius + delta));
  };

  const resetCamera = () => {
    cameraStateRef.current = { theta: 0.7, phi: 0.92, radius: 13.5, targetTheta: 0.7 };
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
        "relative h-[380px] w-full overflow-hidden rounded-2xl border border-line transition-colors duration-500",
        nightMode
          ? "bg-gradient-to-b from-[#07131c] via-[#0d2229] to-[#122b23]"
          : "bg-gradient-to-b from-[#a8d5e5] via-[#d7ece3] to-[#eaf3ec]",
      )}
    >
      <div ref={containerRef} className="h-full w-full cursor-grab active:cursor-grabbing" />

      <div className="pointer-events-none absolute left-4 top-4 rounded-xl bg-forest-black/75 px-3 py-1.5 text-xs font-semibold text-white backdrop-blur">
        {locale === "en"
          ? "Drag to orbit 360° · Living 3D Gunung Leuser World"
          : "Seret untuk memutar 360° · Dunia Mini 3D Gunung Leuser"}
      </div>

      <div className="absolute right-3 top-3 flex items-center gap-1.5">
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
          onClick={resetCamera}
          className="inline-flex size-8 items-center justify-center rounded-xl bg-forest-black/75 text-white backdrop-blur hover:bg-forest-black"
        >
          <RotateCcw className="size-3.5" />
        </button>
      </div>

      <div className="absolute inset-x-3 bottom-3 flex flex-wrap justify-center gap-1.5">
        {steps.map((step, index) => (
          <button
            key={step.id}
            type="button"
            onClick={() => onSelectStep(index)}
            className={cn(
              "rounded-full px-3 py-1.5 text-xs font-semibold shadow backdrop-blur transition",
              index === activeStepIndex
                ? "bg-primary text-white ring-2 ring-white/70"
                : "bg-surface/90 text-ink hover:bg-surface",
            )}
          >
            {index + 1}. {step.badge?.[locale] ?? step.heading[locale]}
          </button>
        ))}
      </div>
    </div>
  );
}
