"use client";
import { useEffect, useRef } from "react";
import * as THREE from "three";

/* ─── Draw Solana 3-bar logo via canvas paths (no font dependency) ─── */
function drawSolanaLogo(ctx: CanvasRenderingContext2D, cx: number, cy: number, r: number) {
  const barW   = r * 1.05;
  const barH   = r * 0.175;
  const gap    = r * 0.265;
  const slant  = barH * 0.75;

  const logoGrad = ctx.createLinearGradient(cx - barW / 2, 0, cx + barW / 2, 0);
  logoGrad.addColorStop(0,   "#9945FF");
  logoGrad.addColorStop(0.5, "#00C2FF");
  logoGrad.addColorStop(1,   "#14F195");

  ctx.fillStyle = logoGrad;
  ctx.shadowColor = "rgba(153,69,255,0.6)";
  ctx.shadowBlur  = 10;

  for (let i = -1; i <= 1; i++) {
    const y = cy + i * gap;
    ctx.beginPath();
    ctx.moveTo(cx - barW / 2 + slant, y - barH / 2);
    ctx.lineTo(cx + barW / 2 + slant, y - barH / 2);
    ctx.lineTo(cx + barW / 2 - slant, y + barH / 2);
    ctx.lineTo(cx - barW / 2 - slant, y + barH / 2);
    ctx.closePath();
    ctx.fill();
  }
  ctx.shadowBlur = 0;
}

/* ─── Coin face texture ─── */
function makeCoinTexture(): THREE.CanvasTexture {
  const size = 512;
  const canvas = document.createElement("canvas");
  canvas.width  = size;
  canvas.height = size;
  const ctx = canvas.getContext("2d")!;
  const cx  = size / 2;

  // Dark base circle
  const base = ctx.createRadialGradient(cx * 0.7, cx * 0.55, 0, cx, cx, cx * 0.92);
  base.addColorStop(0,    "#2A0A6B");
  base.addColorStop(0.5,  "#1B0550");
  base.addColorStop(1,    "#0D0030");
  ctx.beginPath();
  ctx.arc(cx, cx, cx * 0.92, 0, Math.PI * 2);
  ctx.fillStyle = base;
  ctx.fill();

  // Rim
  ctx.beginPath();
  ctx.arc(cx, cx, cx * 0.9, 0, Math.PI * 2);
  ctx.strokeStyle = "rgba(153,69,255,0.5)";
  ctx.lineWidth   = cx * 0.04;
  ctx.stroke();

  // Glint arc top-left
  ctx.save();
  ctx.beginPath();
  ctx.arc(cx, cx, cx * 0.75, -Math.PI * 0.9, -Math.PI * 0.1);
  ctx.strokeStyle = "rgba(255,255,255,0.18)";
  ctx.lineWidth   = cx * 0.055;
  ctx.stroke();
  ctx.restore();

  // Solana logo — canvas paths, no font
  drawSolanaLogo(ctx, cx, cx, cx * 0.44);

  return new THREE.CanvasTexture(canvas);
}

/* ─── Thin edge texture ─── */
function makeEdgeTexture(): THREE.CanvasTexture {
  const canvas = document.createElement("canvas");
  canvas.width  = 256;
  canvas.height = 32;
  const ctx = canvas.getContext("2d")!;
  const g = ctx.createLinearGradient(0, 0, 256, 0);
  g.addColorStop(0,    "#9945FF");
  g.addColorStop(0.5,  "#14F195");
  g.addColorStop(1,    "#9945FF");
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, 256, 32);
  return new THREE.CanvasTexture(canvas);
}

/* ─── Build one coin mesh ─── */
function buildCoin(
  faceTex: THREE.CanvasTexture,
  edgeTex: THREE.CanvasTexture,
  scale: number
): THREE.Mesh {
  // CylinderGeometry: groups → 0: lateral, 1: top-cap, 2: bottom-cap
  const geo = new THREE.CylinderGeometry(1, 1, 0.12, 80, 1, false);

  const faceMat = new THREE.MeshStandardMaterial({
    map:              faceTex,
    metalness:        0.5,
    roughness:        0.25,
    envMapIntensity:  0.8,
  });
  const edgeMat = new THREE.MeshStandardMaterial({
    map:              edgeTex,
    metalness:        0.9,
    roughness:        0.15,
  });

  const mesh = new THREE.Mesh(geo, [edgeMat, faceMat, faceMat]);

  // Rotate so the coin faces the camera (cylinder axis → Z)
  mesh.rotation.x = Math.PI / 2;
  mesh.scale.setScalar(scale);
  return mesh;
}

/* ─── Main component ─── */
export function SolanaCoins() {
  const mountRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = mountRef.current;
    if (!el) return;

    /* renderer */
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(el.clientWidth, el.clientHeight);
    renderer.setClearColor(0x000000, 0);
    renderer.toneMapping       = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.3;
    el.appendChild(renderer.domElement);

    /* scene / camera */
    const scene  = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(50, el.clientWidth / el.clientHeight, 0.1, 200);
    camera.position.set(0, 0, 18);

    /* lights */
    scene.add(new THREE.AmbientLight(0xffffff, 1.0));

    const purple = new THREE.PointLight(0x9945ff, 120, 60);
    purple.position.set(-8, 6, 8);
    scene.add(purple);

    const green = new THREE.PointLight(0x14f195, 80, 60);
    green.position.set(8, -4, 6);
    scene.add(green);

    const key = new THREE.DirectionalLight(0xffffff, 2.0);
    key.position.set(4, 10, 12);
    scene.add(key);

    /* textures */
    const faceTex = makeCoinTexture();
    const edgeTex = makeEdgeTexture();
    edgeTex.wrapS   = THREE.RepeatWrapping;
    edgeTex.repeat.set(6, 1);

    /* coins */
    const COUNT = 12;
    type CoinData = {
      mesh: THREE.Mesh;
      pivotX: number; pivotY: number;
      floatAmp: number; floatSpeed: number; floatPhase: number;
      tiltX: number; tiltZ: number;
      spinSpeed: number;
    };
    const coins: CoinData[] = [];

    for (let i = 0; i < COUNT; i++) {
      const scale = 0.45 + Math.random() * 0.7;
      const mesh  = buildCoin(faceTex, edgeTex, scale);

      const px = (Math.random() - 0.5) * 26;
      const py = (Math.random() - 0.5) * 16;
      const pz = (Math.random() - 0.5) * 4 - 1;
      mesh.position.set(px, py, pz);

      // Slight tilt so coins look 3D (not perfectly face-on)
      const tiltX = (Math.random() - 0.5) * 0.7;  // small tilt
      const tiltZ = (Math.random() - 0.5) * 0.5;
      mesh.rotation.x += tiltX;
      mesh.rotation.z  = tiltZ;

      scene.add(mesh);
      coins.push({
        mesh,
        pivotX: px, pivotY: py,
        floatAmp:   0.5 + Math.random() * 0.9,
        floatSpeed: 0.3 + Math.random() * 0.4,
        floatPhase: Math.random() * Math.PI * 2,
        tiltX, tiltZ,
        spinSpeed: (Math.random() > 0.5 ? 1 : -1) * (0.4 + Math.random() * 0.5),
      });
    }

    /* resize */
    const onResize = () => {
      if (!el) return;
      camera.aspect = el.clientWidth / el.clientHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(el.clientWidth, el.clientHeight);
    };
    window.addEventListener("resize", onResize);

    /* mouse parallax */
    const mouse = { x: 0, y: 0 };
    const onMouse = (e: MouseEvent) => {
      mouse.x = (e.clientX / window.innerWidth  - 0.5) * 2;
      mouse.y = (e.clientY / window.innerHeight - 0.5) * 2;
    };
    window.addEventListener("mousemove", onMouse);

    /* loop */
    let raf: number;
    const clock = new THREE.Clock();

    const tick = () => {
      raf = requestAnimationFrame(tick);
      const t = clock.getElapsedTime();

      coins.forEach((c) => {
        // Float vertically
        c.mesh.position.y = c.pivotY + Math.sin(t * c.floatSpeed + c.floatPhase) * c.floatAmp;
        // Horizontal drift
        c.mesh.position.x = c.pivotX + Math.cos(t * c.floatSpeed * 0.5 + c.floatPhase) * 0.3;

        // Spin (around coin's face normal = local Z)
        c.mesh.rotation.y += c.spinSpeed * 0.008;
      });

      // Slowly orbit lights for dynamic shimmer
      purple.position.x = Math.sin(t * 0.3) * 10;
      purple.position.y = Math.cos(t * 0.2) * 7;
      green.position.x  = Math.cos(t * 0.25) * 10;

      renderer.render(scene, camera);
    };
    tick();

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", onResize);
      window.removeEventListener("mousemove", onMouse);
      renderer.dispose();
      faceTex.dispose();
      edgeTex.dispose();
      if (el.contains(renderer.domElement)) el.removeChild(renderer.domElement);
    };
  }, []);

  return (
    <div
      ref={mountRef}
      aria-hidden
      style={{
        position: "absolute",
        inset: 0,
        pointerEvents: "none",
        width: "100%",
        height: "100%",
        opacity: 0.9,
      }}
    />
  );
}
