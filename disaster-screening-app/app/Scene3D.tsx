"use client";

import { useEffect, useRef } from "react";
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";

interface Scene3DProps {
  lokasiSkenario: any[];
  faseIndex: number;
  onSelectLokasi: (lokasi: any) => void;
}

export default function Scene3D({ lokasiSkenario, faseIndex, onSelectLokasi }: Scene3DProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const onSelectRef = useRef(onSelectLokasi);
  
  // Referensi Objek Animasi Timeline
  const riverRef = useRef<THREE.Mesh | null>(null);
  const mudRef = useRef<THREE.Mesh | null>(null);
  const rainRef = useRef<THREE.Points | null>(null);
  const fogRef = useRef<THREE.FogExp2 | null>(null);
  const lightRef = useRef<THREE.AmbientLight | null>(null);
  const bridgeRef = useRef<THREE.Mesh | null>(null);
  const heliRef = useRef<THREE.Group | null>(null);
  const rotorRef = useRef<THREE.Mesh | null>(null);
  const ambulanceLightRef = useRef<THREE.PointLight | null>(null);
  const pinsGroupRef = useRef<THREE.Group | null>(null);
  const fallingTreesRef = useRef<THREE.Group[]>([]);

  useEffect(() => { onSelectRef.current = onSelectLokasi; }, [onSelectLokasi]);

  useEffect(() => {
    if (!containerRef.current) return;
    const width = containerRef.current.clientWidth;
    const height = containerRef.current.clientHeight;

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x0f172a);
    const fog = new THREE.FogExp2(0x0f172a, 0.02);
    scene.fog = fog;
    fogRef.current = fog;

    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 100);
    camera.position.set(0, 16, 25);

    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(width, height);
    renderer.shadowMap.enabled = true;
    containerRef.current.appendChild(renderer.domElement);

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.maxPolarAngle = Math.PI / 2 - 0.05;

    const ambientLight = new THREE.AmbientLight(0xffffff, 0.6); 
    scene.add(ambientLight);
    lightRef.current = ambientLight;

    const dirLight = new THREE.DirectionalLight(0xffffff, 0.6);
    dirLight.position.set(5, 20, 5);
    dirLight.castShadow = true;
    scene.add(dirLight);

    // ==========================================
    // 1. LANSKAP (Tanah & Bukit)
    // ==========================================
    const ground = new THREE.Mesh(new THREE.PlaneGeometry(40, 40), new THREE.MeshStandardMaterial({ color: 0x166534 }));
    ground.rotation.x = -Math.PI / 2;
    ground.receiveShadow = true;
    scene.add(ground);

    const hill = new THREE.Mesh(new THREE.ConeGeometry(8, 6, 32), new THREE.MeshStandardMaterial({ color: 0x14532d }));
    hill.position.set(-10, 0, -6);
    scene.add(hill);

    // ==========================================
    // 2. SUNGAI, JEMBATAN & LONGSOR
    // ==========================================
    const river = new THREE.Mesh(new THREE.BoxGeometry(4, 0.2, 40), new THREE.MeshStandardMaterial({ color: 0x0284c7, transparent: true, opacity: 0.9 }));
    river.position.set(0, 0.1, 0); 
    scene.add(river);
    riverRef.current = river;

    // Jembatan Penghubung
    const bridge = new THREE.Mesh(new THREE.BoxGeometry(4.5, 0.2, 2), new THREE.MeshStandardMaterial({ color: 0x475569 }));
    bridge.position.set(0, 0.3, 2);
    scene.add(bridge);
    bridgeRef.current = bridge;

    // Material Lumpur Longsor
    const mud = new THREE.Mesh(new THREE.DodecahedronGeometry(3, 1), new THREE.MeshStandardMaterial({ color: 0x451a03 }));
    mud.position.set(-9, 2, -4); 
    mud.scale.set(1.5, 0.5, 1.2);
    scene.add(mud);
    mudRef.current = mud;

    // ==========================================
    // 3. BANGUNAN DESA & KOTA
    // ==========================================
    const createHouse = (x: number, z: number) => {
      const group = new THREE.Group();
      const wall = new THREE.Mesh(new THREE.BoxGeometry(1.2, 1, 1.2), new THREE.MeshStandardMaterial({ color: 0xe2e8f0 }));
      wall.position.y = 0.5; wall.castShadow = true;
      const roof = new THREE.Mesh(new THREE.ConeGeometry(1, 0.8, 4), new THREE.MeshStandardMaterial({ color: 0x991b1b }));
      roof.position.y = 1.4; roof.rotation.y = Math.PI / 4;
      group.add(wall, roof); group.position.set(x, 0, z);
      return group;
    };
    scene.add(createHouse(-3.5, -1)); scene.add(createHouse(-5.5, -2));
    scene.add(createHouse(-4.5, -3.5)); scene.add(createHouse(-6.5, -0.5));
    scene.add(createHouse(-3.5, 1)); scene.add(createHouse(-5.5, 2));

    const createShop = (x: number, z: number) => {
      const group = new THREE.Group();
      const body = new THREE.Mesh(new THREE.BoxGeometry(4, 1.8, 3), new THREE.MeshStandardMaterial({ color: 0xf8fafc }));
      body.position.y = 0.9; body.castShadow = true;
      const glass = new THREE.Mesh(new THREE.BoxGeometry(3.6, 1.2, 0.1), new THREE.MeshStandardMaterial({ color: 0x38bdf8, transparent: true, opacity: 0.6 }));
      glass.position.set(0, 0.8, 1.51);
      const sign = new THREE.Mesh(new THREE.BoxGeometry(4.2, 0.4, 0.2), new THREE.MeshStandardMaterial({ color: 0xdc2626 }));
      sign.position.set(0, 1.9, 1.4); 
      group.add(body, glass, sign); group.position.set(x, 0, z);
      return group;
    };
    const shop = createShop(5, -1); shop.rotation.y = -0.2; scene.add(shop);

    const createHospital = (x: number, z: number) => {
      const group = new THREE.Group();
      const body = new THREE.Mesh(new THREE.BoxGeometry(5, 2.5, 4), new THREE.MeshStandardMaterial({ color: 0xf1f5f9 }));
      body.position.y = 1.25; body.castShadow = true;
      const canopy = new THREE.Mesh(new THREE.BoxGeometry(2, 0.2, 2), new THREE.MeshStandardMaterial({ color: 0x94a3b8 }));
      canopy.position.set(0, 1.2, 2.5);
      const pillar = new THREE.Mesh(new THREE.CylinderGeometry(0.1, 0.1, 1.2), new THREE.MeshStandardMaterial({ color: 0x475569 }));
      const p1 = pillar.clone(); p1.position.set(-0.8, 0.6, 3.3);
      const p2 = pillar.clone(); p2.position.set(0.8, 0.6, 3.3);
      const redMat = new THREE.MeshStandardMaterial({ color: 0xdc2626 });
      const crossV = new THREE.Mesh(new THREE.BoxGeometry(0.4, 1.2, 0.2), redMat);
      const crossH = new THREE.Mesh(new THREE.BoxGeometry(1.2, 0.4, 0.2), redMat);
      crossV.position.set(0, 3.2, 0); crossH.position.set(0, 3.2, 0);
      group.add(body, canopy, p1, p2, crossV, crossH); group.position.set(x, 0, z);
      return group;
    };
    scene.add(createHospital(6, 6)); 

    // ==========================================
    // 4. KENDARAAN TIM SAR (Ambulans & Helikopter)
    // ==========================================
    // Ambulans
    const ambulance = new THREE.Group();
    const ambBody = new THREE.Mesh(new THREE.BoxGeometry(1.2, 0.8, 0.6), new THREE.MeshStandardMaterial({ color: 0xffffff }));
    ambBody.position.y = 0.4;
    const ambStripe = new THREE.Mesh(new THREE.BoxGeometry(1.21, 0.15, 0.61), new THREE.MeshStandardMaterial({ color: 0xdc2626 }));
    ambStripe.position.y = 0.4;
    const sirenLight = new THREE.PointLight(0xff0000, 0, 10); // Akan berkedip di animasi
    sirenLight.position.set(0, 1, 0);
    ambulance.add(ambBody, ambStripe, sirenLight);
    ambulance.position.set(6, 0, 3); // Parkir di depan RS
    scene.add(ambulance);
    ambulanceLightRef.current = sirenLight;

    // Helikopter SAR
    const heliGroup = new THREE.Group();
    const heliBody = new THREE.Mesh(new THREE.CapsuleGeometry(0.4, 1.4, 4, 8), new THREE.MeshStandardMaterial({ color: 0x1e293b }));
    heliBody.rotation.z = Math.PI / 2;
    const heliTail = new THREE.Mesh(new THREE.BoxGeometry(1.2, 0.15, 0.15), new THREE.MeshStandardMaterial({ color: 0x1e293b }));
    heliTail.position.set(-1, 0, 0);
    const heliRotor = new THREE.Mesh(new THREE.BoxGeometry(0.1, 0.05, 3), new THREE.MeshStandardMaterial({ color: 0x94a3b8 }));
    heliRotor.position.set(0, 0.5, 0);
    
    // Lampu Sorot Helikopter ke tanah
    const searchLight = new THREE.SpotLight(0xffffff, 5, 40, Math.PI / 8, 0.5, 1);
    searchLight.position.set(0, -0.2, 0);
    searchLight.target.position.set(0, -10, 0);
    
    heliGroup.add(heliBody, heliTail, heliRotor, searchLight, searchLight.target);
    heliGroup.position.set(0, 10, 0);
    heliGroup.visible = false; // Sembunyikan sampai 21:00
    scene.add(heliGroup);
    heliRef.current = heliGroup;
    rotorRef.current = heliRotor;

    // ==========================================
    // 5. POHON TUMBAANG
    // ==========================================
    const createTree = (x: number, y: number, z: number, willFall: boolean) => {
      const group = new THREE.Group();
      const trunk = new THREE.Mesh(new THREE.CylinderGeometry(0.15, 0.2, 1), new THREE.MeshStandardMaterial({ color: 0x78350f }));
      trunk.position.y = 0.5; trunk.castShadow = true;
      const leaves = new THREE.Mesh(new THREE.SphereGeometry(0.8, 8, 8), new THREE.MeshStandardMaterial({ color: 0x22c55e }));
      leaves.position.y = 1.4; leaves.castShadow = true;
      group.add(trunk, leaves); group.position.set(x, y, z);
      scene.add(group);
      if (willFall) fallingTreesRef.current.push(group);
    };
    createTree(-2, 0, 3, false); createTree(-4, 0, 4, false);
    createTree(3, 0, -3, false); createTree(7, 0, 2, false);
    createTree(-7, 1.5, -2, true); createTree(-8, 2.5, -4, true); createTree(-6, 0.8, -5, true);

    // ==========================================
    // 6. EFEK HUJAN & PIN DARURAT
    // ==========================================
    const rainGeo = new THREE.BufferGeometry();
    const rainCount = 1500;
    const rainPositions = new Float32Array(rainCount * 3);
    for(let i=0; i<rainCount*3; i+=3) {
      rainPositions[i] = (Math.random() - 0.5) * 30;
      rainPositions[i+1] = Math.random() * 20;
      rainPositions[i+2] = (Math.random() - 0.5) * 30;
    }
    rainGeo.setAttribute('position', new THREE.BufferAttribute(rainPositions, 3));
    const rain = new THREE.Points(rainGeo, new THREE.PointsMaterial({ color: 0x94a3b8, size: 0.15, transparent: true, opacity: 0.8 }));
    scene.add(rain);
    rainRef.current = rain;

    const pinsGroup = new THREE.Group();
    const pinObjectsMap = new Map<THREE.Object3D, any>();
    lokasiSkenario.forEach((lokasi) => {
      const pin = new THREE.Mesh(new THREE.SphereGeometry(0.5, 16, 16), new THREE.MeshStandardMaterial({ color: 0xfacc15 }));
      pin.position.set(lokasi.koordinat3D[0], lokasi.koordinat3D[1] + 3.5, lokasi.koordinat3D[2]);
      const stick = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.05, 2), new THREE.MeshBasicMaterial({ color: 0xffffff }));
      stick.position.set(0, -1, 0); pin.add(stick);
      pinsGroup.add(pin); pinObjectsMap.set(pin, lokasi);
    });
    scene.add(pinsGroup);
    pinsGroupRef.current = pinsGroup;

    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2();
    const onPointerDown = (event: MouseEvent) => {
      const rect = renderer.domElement.getBoundingClientRect();
      mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
      mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
      raycaster.setFromCamera(mouse, camera);
      const intersects = raycaster.intersectObjects(pinsGroup.children);
      if (intersects.length > 0) {
        const dataLokasi = pinObjectsMap.get(intersects[0].object);
        if (dataLokasi) onSelectRef.current(dataLokasi);
      }
    };
    renderer.domElement.addEventListener("pointerdown", onPointerDown);

    // ==========================================
    // 7. ANIMASI & LOGIKA TIMELINE (INTI DARI MOVIE-FEEL)
    // ==========================================
    let animationId: number;
    const clock = new THREE.Clock();

    const animate = () => {
      animationId = requestAnimationFrame(animate);
      const time = clock.getElapsedTime();

      // 1. PIN Triage Visibilitas (Hanya jam 21:00 s.d 04:00)
      if (pinsGroupRef.current) {
        pinsGroupRef.current.visible = (faseIndex >= 5 && faseIndex <= 7);
        pinsGroupRef.current.children.forEach(pin => { pin.rotation.y += 0.03; });
      }

      // 2. Pencahayaan (Gelap gulita saat Longsor 19:00, Terang saat 05:00)
      let targetLight = 0.6; // Sore
      if (faseIndex >= 3 && faseIndex <= 6) targetLight = 0.08; // 19:00 - 23:00 Gelap
      else if (faseIndex >= 7 && faseIndex <= 8) targetLight = 0.4; // 04:00 Subuh
      else if (faseIndex === 9) targetLight = 0.9; // 09:00 Pagi Terang

      if (lightRef.current) lightRef.current.intensity += (targetLight - lightRef.current.intensity) * 0.05;

      // 3. Sungai (Banjir 18:00)
      const targetRiverScaleX = (faseIndex >= 2) ? 3.5 : 1; 
      const targetRiverPosY = (faseIndex >= 2) ? 0.4 : 0.1;
      
      // 4. Lumpur Longsor (Tutup Rumah 19:00, Dibersihkan Alat Berat 05:00)
      let targetMudPosX = -9, targetMudPosY = 2, targetMudScale = 1.5;
      if (faseIndex >= 8) { targetMudScale = 0.6; targetMudPosX = -6; targetMudPosY = 0.5; } // Pembersihan
      else if (faseIndex >= 3) { targetMudPosX = -4.5; targetMudPosY = 0.8; } // Longsor Masif
      else if (faseIndex >= 1) { targetMudPosX = -7.5; targetMudPosY = 1.5; } // Longsor Pertama

      if (riverRef.current) {
        riverRef.current.scale.x += (targetRiverScaleX - riverRef.current.scale.x) * 0.05;
        riverRef.current.position.y += (targetRiverPosY - riverRef.current.position.y) * 0.05;
      }
      if (mudRef.current) {
        mudRef.current.position.x += (targetMudPosX - mudRef.current.position.x) * 0.05;
        mudRef.current.position.y += (targetMudPosY - mudRef.current.position.y) * 0.05;
        const currentScale = mudRef.current.scale.x;
        const s = currentScale + (targetMudScale - currentScale) * 0.05;
        mudRef.current.scale.set(s, s * 0.33, s * 0.8);
      }

      // 5. Jembatan Patah (20:00)
      if (bridgeRef.current) {
        const targetRotZ = (faseIndex >= 4) ? 0.4 : 0;
        const targetPosY = (faseIndex >= 4) ? -0.2 : 0.3;
        bridgeRef.current.rotation.z += (targetRotZ - bridgeRef.current.rotation.z) * 0.1;
        bridgeRef.current.position.y += (targetPosY - bridgeRef.current.position.y) * 0.1;
      }

      // 6. Helikopter SAR (Terbang keliling jam 21:00 s.d 04:00)
      if (heliRef.current && rotorRef.current) {
        if (faseIndex >= 5 && faseIndex <= 7) {
          heliRef.current.visible = true;
          rotorRef.current.rotation.y += 0.5; // Baling-baling muter
          heliRef.current.position.x = Math.sin(time * 0.5) * 6 - 2;
          heliRef.current.position.z = Math.cos(time * 0.5) * 4 - 1;
          heliRef.current.rotation.y = -(time * 0.5); // Moncong Heli ikuti jalur
        } else {
          heliRef.current.visible = false;
        }
      }

      // 7. Sirine Ambulans Berkedip (21:00 s.d 05:00)
      if (ambulanceLightRef.current) {
        if (faseIndex >= 5 && faseIndex <= 8) {
          ambulanceLightRef.current.intensity = (Math.sin(time * 10) > 0) ? 2 : 0; // Kedip cepat
          ambulanceLightRef.current.color.setHex((Math.sin(time * 5) > 0) ? 0xff0000 : 0x0000ff); // Merah Biru
        } else {
          ambulanceLightRef.current.intensity = 0;
        }
      }

      // 8. Pohon Tumbang
      fallingTreesRef.current.forEach(tree => {
        if (faseIndex >= 3) { if (tree.rotation.z > -Math.PI / 2) tree.rotation.z -= 0.05; } 
        else { tree.rotation.z = 0; }
      });

      // 9. Cuaca Hujan & Kabut
      if (rainRef.current && fogRef.current) {
        if (faseIndex >= 7) {
          rainRef.current.visible = false; fogRef.current.density = 0; 
        } else {
          rainRef.current.visible = true;
          fogRef.current.density = (faseIndex >= 3 && faseIndex <= 6) ? 0.03 : 0.01; 
          const dropSpeed = (faseIndex >= 2 && faseIndex <= 4) ? 0.6 : 0.3; // Badai cepat
          const positions = rainRef.current.geometry.attributes.position.array as Float32Array;
          for(let i=1; i<rainCount*3; i+=3) {
            positions[i] -= dropSpeed; 
            if (positions[i] < 0) positions[i] = 20;
          }
          rainRef.current.geometry.attributes.position.needsUpdate = true;
        }
      }

      controls.update();
      renderer.render(scene, camera);
    };
    animate();

    const handleResize = () => {
      if (!containerRef.current) return;
      camera.aspect = containerRef.current.clientWidth / containerRef.current.clientHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(containerRef.current.clientWidth, containerRef.current.clientHeight);
    };
    window.addEventListener("resize", handleResize);

    return () => {
      cancelAnimationFrame(animationId);
      window.removeEventListener("resize", handleResize);
      renderer.domElement.removeEventListener("pointerdown", onPointerDown);
      containerRef.current?.removeChild(renderer.domElement);
    };
  }, [faseIndex, lokasiSkenario]); 

  return <div ref={containerRef} className="w-full h-full cursor-pointer" />;
}