"use client";

/**
 * Stylised Bulbine frutescens — the brand's plant — as a living 3D hero.
 * Arching succulent blades (tubes), the signature amber flower spike
 * (instanced spheres in a loose helix) and drifting pollen (points).
 * Perf: 1 instanced draw for flowers, 1 for pollen, ~10 blade tubes.
 */
import { useMemo, useRef, useLayoutEffect } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import * as THREE from "three";

const FLOWERS = 90;
const POLLEN = 260;

function Blades() {
  const blades = useMemo(() => {
    const rnd = mulberry(7);
    return Array.from({ length: 11 }, (_, i) => {
      const angle = (i / 11) * Math.PI * 2 + rnd() * 0.5;
      const reach = 1.15 + rnd() * 0.85;
      const height = 0.9 + rnd() * 0.75;
      const curve = new THREE.QuadraticBezierCurve3(
        new THREE.Vector3(0, -0.9, 0),
        new THREE.Vector3(Math.cos(angle) * reach * 0.45, height * 0.75, Math.sin(angle) * reach * 0.45),
        new THREE.Vector3(Math.cos(angle) * reach, height - 0.25 + rnd() * 0.3, Math.sin(angle) * reach)
      );
      return { curve, radius: 0.028 + rnd() * 0.014, shade: 0.85 + rnd() * 0.3 };
    });
  }, []);
  return (
    <group>
      {blades.map((b, i) => (
        <mesh key={i}>
          <tubeGeometry args={[b.curve, 24, b.radius, 6, false]} />
          <meshStandardMaterial
            color={new THREE.Color("#2E5A41").multiplyScalar(b.shade)}
            roughness={0.55}
            metalness={0.05}
          />
        </mesh>
      ))}
    </group>
  );
}

function FlowerSpike() {
  const ref = useRef<THREE.InstancedMesh>(null!);
  const data = useMemo(() => {
    const rnd = mulberry(13);
    return Array.from({ length: FLOWERS }, (_, i) => {
      const t = i / FLOWERS; // 0 bottom (open) → 1 top (buds)
      const angle = t * Math.PI * 9 + rnd() * 0.6;
      const radius = 0.16 * (1 - t * 0.65) + rnd() * 0.02;
      return {
        pos: new THREE.Vector3(Math.cos(angle) * radius, -0.35 + t * 1.9, Math.sin(angle) * radius),
        scale: (1 - t * 0.55) * (0.035 + rnd() * 0.02),
        phase: rnd() * Math.PI * 2,
      };
    });
  }, []);

  useLayoutEffect(() => {
    const m = new THREE.Matrix4();
    data.forEach((d, i) => {
      m.makeScale(d.scale, d.scale, d.scale).setPosition(d.pos);
      ref.current.setMatrixAt(i, m);
    });
    ref.current.instanceMatrix.needsUpdate = true;
  }, [data]);

  return (
    <group position={[0.15, 0.1, 0]}>
      {/* stem */}
      <mesh position={[0, 0.45, 0]}>
        <cylinderGeometry args={[0.015, 0.025, 2.4, 6]} />
        <meshStandardMaterial color="#3E6B50" roughness={0.6} />
      </mesh>
      <instancedMesh ref={ref} args={[undefined, undefined, FLOWERS]}>
        <sphereGeometry args={[1, 10, 10]} />
        <meshStandardMaterial color="#C0842A" emissive="#8A5A12" emissiveIntensity={0.35} roughness={0.4} />
      </instancedMesh>
    </group>
  );
}

function Pollen({ animate }: { animate: boolean }) {
  const ref = useRef<THREE.Points>(null!);
  const positions = useMemo(() => {
    const rnd = mulberry(29);
    const arr = new Float32Array(POLLEN * 3);
    for (let i = 0; i < POLLEN; i++) {
      const r = 1.2 + rnd() * 2.4;
      const a = rnd() * Math.PI * 2;
      arr[i * 3] = Math.cos(a) * r;
      arr[i * 3 + 1] = -1 + rnd() * 3.4;
      arr[i * 3 + 2] = Math.sin(a) * r * 0.7;
    }
    return arr;
  }, []);

  useFrame((state) => {
    if (!animate || !ref.current) return;
    const t = state.clock.elapsedTime;
    ref.current.rotation.y = t * 0.03;
    ref.current.position.y = Math.sin(t * 0.4) * 0.06;
  });

  return (
    <points ref={ref}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
      </bufferGeometry>
      <pointsMaterial color="#DCA64B" size={0.035} sizeAttenuation transparent opacity={0.65} depthWrite={false} />
    </points>
  );
}

function Plant({ animate }: { animate: boolean }) {
  const group = useRef<THREE.Group>(null!);
  useFrame((state) => {
    if (!group.current) return;
    if (animate) {
      const t = state.clock.elapsedTime;
      group.current.rotation.y = THREE.MathUtils.lerp(
        group.current.rotation.y,
        state.pointer.x * 0.35 + Math.sin(t * 0.15) * 0.15,
        0.04
      );
      group.current.rotation.x = THREE.MathUtils.lerp(group.current.rotation.x, state.pointer.y * -0.12, 0.04);
      group.current.position.y = Math.sin(t * 0.5) * 0.04;
    }
  });
  return (
    <group ref={group}>
      <Blades />
      <FlowerSpike />
      <Pollen animate={animate} />
      {/* soil mound */}
      <mesh position={[0, -1.02, 0]}>
        <sphereGeometry args={[0.5, 16, 12, 0, Math.PI * 2, 0, Math.PI / 2]} />
        <meshStandardMaterial color="#4A3B28" roughness={0.9} />
      </mesh>
    </group>
  );
}

/** Deterministic PRNG so the plant looks identical every visit. */
function mulberry(seed: number) {
  let a = seed;
  return () => {
    a |= 0; a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export default function BotanicalScene() {
  const reduced =
    typeof window !== "undefined" &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  return (
    <Canvas
      camera={{ position: [0, 0.9, 4.4], fov: 38 }}
      dpr={[1, 1.75]}
      gl={{ antialias: true, alpha: true }}
      frameloop={reduced ? "demand" : "always"}
      aria-hidden
    >
      <ambientLight intensity={0.9} />
      <directionalLight position={[3, 4, 2]} intensity={1.4} color="#FFF3DC" />
      <directionalLight position={[-3, 1, -2]} intensity={0.4} color="#CFE0CF" />
      <Plant animate={!reduced} />
    </Canvas>
  );
}
