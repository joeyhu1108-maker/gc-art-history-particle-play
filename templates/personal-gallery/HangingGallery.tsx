/**
 * Open-source personal gallery engine extracted from ART LOOKS BACK.
 * It accepts user-owned image URLs only; no museum collection data is bundled.
 */
import { useEffect, useMemo, useRef, useState } from "react";
import "./hanging-gallery.css";
import type * as ThreeTypes from "three";

export type HangingGalleryItem = {
  id: string;
  title: string;
  date: string;
  imageUrl: string;
  previewUrl?: string;
};

export type HangingGalleryProps = {
  items: readonly HangingGalleryItem[];
  active: boolean;
  reduceMotion: boolean;
  initialItemId?: string;
  onOpen: (id: string) => void;
  openLabel?: string;
};

type HangingWork = {
  item: HangingGalleryItem;
  root: ThreeTypes.Group;
  pivot: ThreeTypes.Group;
  panel: ThreeTypes.Group;
  accentColor: ThreeTypes.Color;
  lightPool?: ThreeTypes.Mesh;
  lightPoolMaterial?: ThreeTypes.MeshBasicMaterial;
  lightCurtainMaterial?: ThreeTypes.MeshBasicMaterial;
  hitMeshes: ThreeTypes.Mesh[];
  frameMaterial: ThreeTypes.MeshStandardMaterial;
  imageMaterial: ThreeTypes.MeshBasicMaterial;
  angleX: number;
  angleZ: number;
  velocityX: number;
  velocityZ: number;
  phase: number;
  scale: number;
};

type GalleryLayout = {
  x: number;
  y: number;
  z: number;
  yaw: number;
  scale: number;
};

const MAX_WORKS = 12;
const CAMERA_START_Z = 8.6;
const CEILING_Y = 3.75;
const FLOOR_Y = -2.48;

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}

function layoutFor(index: number, mobile: boolean): GalleryLayout {
  if (index === 0) {
    return {
      x: 0,
      y: 0.15,
      z: 0,
      yaw: 0,
      scale: mobile ? 0.9 : 1.08,
    };
  }

  const side = index % 2 === 0 ? 1 : -1;
  const lane = ((index - 1) % 3) - 1;
  const depth = -2.4 - (index - 1) * (mobile ? 1.84 : 2.08);
  const xBase = mobile ? 1.22 : 3.34;
  const x = side * (xBase + Math.abs(lane) * (mobile ? 0.12 : 0.48));
  const y = 0.04 + ((index * 7) % 5) * 0.16;

  return {
    x,
    y,
    z: depth,
    yaw: side * (mobile ? -0.16 : -0.34),
    scale: mobile ? 0.7 : 0.78 + (index % 3) * 0.04,
  };
}

function makeLightPoolTexture(THREE: typeof import("three")) {
  const canvas = document.createElement("canvas");
  canvas.width = 256;
  canvas.height = 128;
  const context = canvas.getContext("2d");
  if (!context) return null;

  const gradient = context.createRadialGradient(128, 64, 2, 128, 64, 124);
  gradient.addColorStop(0, "rgba(224,235,221,.32)");
  gradient.addColorStop(0.3, "rgba(182,205,183,.14)");
  gradient.addColorStop(1, "rgba(132,160,141,0)");
  context.fillStyle = gradient;
  context.fillRect(0, 0, 256, 128);

  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  return texture;
}

function makeLightCurtainTexture(THREE: typeof import("three")) {
  const canvas = document.createElement("canvas");
  canvas.width = 96;
  canvas.height = 512;
  const context = canvas.getContext("2d");
  if (!context) return null;

  const horizontal = context.createLinearGradient(0, 0, canvas.width, 0);
  horizontal.addColorStop(0, "rgba(255,255,255,0)");
  horizontal.addColorStop(0.5, "rgba(255,255,255,.92)");
  horizontal.addColorStop(1, "rgba(255,255,255,0)");
  context.fillStyle = horizontal;
  context.fillRect(0, 0, canvas.width, canvas.height);

  const vertical = context.createLinearGradient(0, 0, 0, canvas.height);
  vertical.addColorStop(0, "rgba(0,0,0,0)");
  vertical.addColorStop(0.18, "rgba(0,0,0,.62)");
  vertical.addColorStop(0.68, "rgba(0,0,0,.26)");
  vertical.addColorStop(1, "rgba(0,0,0,0)");
  context.globalCompositeOperation = "destination-in";
  context.fillStyle = vertical;
  context.fillRect(0, 0, canvas.width, canvas.height);

  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  return texture;
}

function makeFlowFloorTexture(THREE: typeof import("three")) {
  const canvas = document.createElement("canvas");
  canvas.width = 256;
  canvas.height = 1024;
  const context = canvas.getContext("2d");
  if (!context) return null;

  context.clearRect(0, 0, canvas.width, canvas.height);
  context.lineCap = "round";
  context.shadowBlur = 28;
  const ribbons = [
    { x: 76, alpha: 0.34, width: 2.4, phase: 0 },
    { x: 132, alpha: 0.24, width: 1.7, phase: 0.8 },
    { x: 176, alpha: 0.2, width: 1.35, phase: 1.7 },
  ];

  ribbons.forEach((ribbon) => {
    context.beginPath();
    for (let y = -40; y <= canvas.height + 40; y += 18) {
      const x =
        ribbon.x +
        Math.sin(y * 0.012 + ribbon.phase) * 19 +
        Math.sin(y * 0.0037 + ribbon.phase * 2) * 27;
      if (y === -40) context.moveTo(x, y);
      else context.lineTo(x, y);
    }
    context.strokeStyle = `rgba(255,255,255,${ribbon.alpha})`;
    context.shadowColor = `rgba(255,255,255,${ribbon.alpha * 0.72})`;
    context.lineWidth = ribbon.width;
    context.stroke();
  });

  for (let index = 0; index < 72; index += 1) {
    const y = (index * 137.5) % canvas.height;
    const x =
      canvas.width * 0.5 +
      Math.sin(index * 2.17) * (38 + (index % 5) * 9);
    const radius = 0.7 + (index % 4) * 0.38;
    context.beginPath();
    context.arc(x, y, radius, 0, Math.PI * 2);
    context.fillStyle = `rgba(255,255,255,${
      index % 3 === 0 ? 0.28 : 0.2
    })`;
    context.fill();
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.wrapS = THREE.ClampToEdgeWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  texture.repeat.set(1, 1.7);
  return texture;
}

function sampleTextureAccent(
  THREE: typeof import("three"),
  texture: ThreeTypes.Texture,
) {
  const source = texture.image as CanvasImageSource | undefined;
  if (!source) return new THREE.Color(0x9bb9a8);

  const canvas = document.createElement("canvas");
  canvas.width = 16;
  canvas.height = 16;
  const context = canvas.getContext("2d", { willReadFrequently: true });
  if (!context) return new THREE.Color(0x9bb9a8);

  try {
    context.drawImage(source, 0, 0, canvas.width, canvas.height);
    const pixels = context.getImageData(0, 0, canvas.width, canvas.height).data;
    let red = 0;
    let green = 0;
    let blue = 0;
    let weight = 0;
    for (let index = 0; index < pixels.length; index += 4) {
      const pixelRed = pixels[index];
      const pixelGreen = pixels[index + 1];
      const pixelBlue = pixels[index + 2];
      const luminance =
        (pixelRed * 0.2126 + pixelGreen * 0.7152 + pixelBlue * 0.0722) /
        255;
      const chroma =
        Math.max(pixelRed, pixelGreen, pixelBlue) -
        Math.min(pixelRed, pixelGreen, pixelBlue);
      const pixelWeight =
        0.2 + chroma / 255 + (1 - Math.abs(luminance - 0.5) * 2) * 0.55;
      red += pixelRed * pixelWeight;
      green += pixelGreen * pixelWeight;
      blue += pixelBlue * pixelWeight;
      weight += pixelWeight;
    }
    const color = new THREE.Color(
      red / Math.max(1, weight) / 255,
      green / Math.max(1, weight) / 255,
      blue / Math.max(1, weight) / 255,
    );
    const hsl = { h: 0, s: 0, l: 0 };
    color.getHSL(hsl);
    color.setHSL(
      hsl.h,
      clamp(hsl.s * 1.18 + 0.1, 0.14, 0.46),
      clamp(hsl.l, 0.42, 0.62),
    );
    return color;
  } catch {
    return new THREE.Color(0x9bb9a8);
  }
}

export function HangingGallery({
  items,
  active,
  reduceMotion,
  initialItemId,
  onOpen,
  openLabel = "进入作品",
}: HangingGalleryProps) {
  const hostRef = useRef<HTMLDivElement>(null);
  const openRef = useRef(onOpen);
  const activeRef = useRef(active);
  const focusIndexRef = useRef<(index: number) => void>(() => {});
  const [selectedItem, setSelectedItem] = useState<HangingGalleryItem | null>(
    null,
  );
  const [navigationIndex, setNavigationIndex] = useState(0);
  const [isReady, setIsReady] = useState(false);
  const visibleItems = useMemo(() => {
    const initialItem = items.find((item) => item.id === initialItemId);
    return (
      initialItem
        ? [
            initialItem,
            ...items.filter((item) => item.id !== initialItem.id),
          ]
        : items
    ).slice(0, MAX_WORKS);
  }, [initialItemId, items]);

  useEffect(() => {
    openRef.current = onOpen;
  }, [onOpen]);

  useEffect(() => {
    activeRef.current = active;
  }, [active]);

  useEffect(() => {
    setSelectedItem(
      visibleItems.find((item) => item.id === initialItemId) ?? null,
    );
    setNavigationIndex(0);
  }, [initialItemId, visibleItems]);

  useEffect(() => {
    if (!active || !isReady || visibleItems.length === 0) return;

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.altKey || event.ctrlKey || event.metaKey) return;
      const target = event.target as HTMLElement | null;
      if (
        target?.isContentEditable ||
        target?.tagName === "INPUT" ||
        target?.tagName === "TEXTAREA" ||
        target?.tagName === "SELECT"
      ) {
        return;
      }

      let nextIndex: number | null = null;
      if (event.key === "ArrowLeft") nextIndex = navigationIndex - 1;
      if (event.key === "ArrowRight") nextIndex = navigationIndex + 1;
      if (event.key === "Home") nextIndex = 0;
      if (event.key === "End") nextIndex = visibleItems.length - 1;
      if (nextIndex === null) return;

      event.preventDefault();
      focusIndexRef.current(
        clamp(nextIndex, 0, visibleItems.length - 1),
      );
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [active, isReady, navigationIndex, visibleItems.length]);

  useEffect(() => {
    const host = hostRef.current;
    const initialItem = visibleItems.find(
      (item) => item.id === initialItemId,
    );
    if (!host || visibleItems.length === 0) return;

    let disposed = false;
    let frame = 0;
    let inactiveTimer = 0;
    let lastFrameAt = performance.now();
    let renderer: ThreeTypes.WebGLRenderer | undefined;
    let camera: ThreeTypes.PerspectiveCamera | undefined;
    let scene: ThreeTypes.Scene | undefined;
    let isMobile = window.matchMedia("(max-width: 760px)").matches;
    let travel = 0;
    let travelTarget = 0;
    const cameraY = 0.34;
    let viewYaw = 0;
    let viewPitch = 0;
    let viewYawTarget = 0;
    let viewPitchTarget = 0;
    let hoveredIndex = -1;
    let selectedIndex = initialItem ? 0 : -1;
    let pointerDown = false;
    let activePointerId: number | null = null;
    let pointerDownX = 0;
    let pointerDownY = 0;
    let pointerLastX = 0;
    let pointerLastY = 0;
    let pointerTravel = 0;
    let pointerType = "";
    let pointerMode: "pending" | "travel" | "view" = "pending";
    const works: HangingWork[] = [];
    const hitMeshes: ThreeTypes.Mesh[] = [];
    const geometries: ThreeTypes.BufferGeometry[] = [];
    const materials: ThreeTypes.Material[] = [];
    const textures: ThreeTypes.Texture[] = [];
    const cleanupCallbacks: Array<() => void> = [];
    const pendingSwingTimers = new Set<number>();

    const setup = async () => {
      const THREE = await import("three");
      if (disposed) return;

      scene = new THREE.Scene();
      scene.background = new THREE.Color(0x020403);
      scene.fog = new THREE.FogExp2(0x020403, isMobile ? 0.048 : 0.037);

      camera = new THREE.PerspectiveCamera(
        isMobile ? 48 : 42,
        1,
        0.1,
        80,
      );
      camera.position.set(0, cameraY, CAMERA_START_Z);

      renderer = new THREE.WebGLRenderer({
        antialias: !isMobile,
        alpha: false,
        powerPreference: "high-performance",
      });
      renderer.setClearColor(0x020403, 1);
      renderer.outputColorSpace = THREE.SRGBColorSpace;
      renderer.toneMapping = THREE.ACESFilmicToneMapping;
      renderer.toneMappingExposure = 0.9;
      renderer.shadowMap.enabled = !isMobile;
      renderer.shadowMap.type = THREE.PCFShadowMap;
      renderer.domElement.className = "hanging-gallery-webgl";
      renderer.domElement.setAttribute(
        "aria-label",
        "滚轮前后行走、拖拽自由观察、可触碰作品的数字展厅",
      );
      renderer.domElement.setAttribute("role", "img");
      host.appendChild(renderer.domElement);

      const addGeometry = <T extends ThreeTypes.BufferGeometry>(geometry: T) => {
        geometries.push(geometry);
        return geometry;
      };
      const addMaterial = <T extends ThreeTypes.Material>(material: T) => {
        materials.push(material);
        return material;
      };

      const ambient = new THREE.HemisphereLight(0xb8c7bc, 0x050706, 0.72);
      scene.add(ambient);

      const keyLight = new THREE.DirectionalLight(0xf5eee0, 1.38);
      keyLight.position.set(-4, 8, 8);
      keyLight.target.position.set(0, FLOOR_Y, -10);
      keyLight.castShadow = !isMobile;
      keyLight.shadow.mapSize.set(1024, 1024);
      keyLight.shadow.camera.left = -9;
      keyLight.shadow.camera.right = 9;
      keyLight.shadow.camera.top = 14;
      keyLight.shadow.camera.bottom = -14;
      keyLight.shadow.camera.near = 0.5;
      keyLight.shadow.camera.far = 46;
      keyLight.shadow.bias = -0.00035;
      keyLight.shadow.normalBias = 0.025;
      scene.add(keyLight, keyLight.target);

      const coolLight = new THREE.DirectionalLight(0x8fb8a8, 0.46);
      coolLight.position.set(4, 2, -7);
      scene.add(coolLight);

      const responseLight = new THREE.PointLight(
        0x9bb9a8,
        0,
        isMobile ? 4.8 : 7.2,
        2.15,
      );
      responseLight.position.set(0, 0.6, 1);
      scene.add(responseLight);
      const responsePosition = new THREE.Vector3();
      const neutralAccent = new THREE.Color(0x9bb9a8);

      const floorMaterial = addMaterial(
        new THREE.MeshPhysicalMaterial({
          color: 0x080b09,
          roughness: 0.78,
          metalness: 0.1,
          clearcoat: 0.08,
          clearcoatRoughness: 0.82,
        }),
      );
      const floor = new THREE.Mesh(
        addGeometry(new THREE.PlaneGeometry(17, 48)),
        floorMaterial,
      );
      floor.rotation.x = -Math.PI / 2;
      floor.position.set(0, FLOOR_Y, -10);
      floor.receiveShadow = true;
      scene.add(floor);

      const flowFloorTexture = makeFlowFloorTexture(THREE);
      if (flowFloorTexture) textures.push(flowFloorTexture);
      const flowFloorMaterial = flowFloorTexture
        ? addMaterial(
            new THREE.MeshBasicMaterial({
              map: flowFloorTexture,
              color: neutralAccent,
              transparent: true,
              opacity: 0,
              depthWrite: false,
              blending: THREE.AdditiveBlending,
              toneMapped: false,
            }),
          )
        : null;
      if (flowFloorMaterial) {
        const flowFloor = new THREE.Mesh(
          addGeometry(new THREE.PlaneGeometry(7.2, 48)),
          flowFloorMaterial,
        );
        flowFloor.rotation.x = -Math.PI / 2;
        flowFloor.position.set(0, FLOOR_Y + 0.012, -10);
        scene.add(flowFloor);
      }

      const ceilingMaterial = addMaterial(
        new THREE.MeshStandardMaterial({
          color: 0x050706,
          roughness: 0.92,
          side: THREE.DoubleSide,
        }),
      );
      const ceiling = new THREE.Mesh(
        addGeometry(new THREE.PlaneGeometry(17, 48)),
        ceilingMaterial,
      );
      ceiling.rotation.x = Math.PI / 2;
      ceiling.position.set(0, CEILING_Y + 0.08, -10);
      scene.add(ceiling);

      const wallMaterial = addMaterial(
        new THREE.MeshStandardMaterial({
          color: 0x050806,
          roughness: 0.98,
          side: THREE.DoubleSide,
        }),
      );
      [-5.6, 5.6].forEach((x) => {
        const wall = new THREE.Mesh(
          addGeometry(new THREE.PlaneGeometry(48, 6.4)),
          wallMaterial,
        );
        wall.rotation.y = Math.PI / 2;
        wall.position.set(x, 0.5, -10);
        scene?.add(wall);
      });

      const beamMaterial = addMaterial(
        new THREE.MeshStandardMaterial({
          color: 0x111612,
          roughness: 0.58,
          metalness: 0.62,
        }),
      );
      for (let beamIndex = 0; beamIndex < 8; beamIndex += 1) {
        const beam = new THREE.Mesh(
          addGeometry(new THREE.BoxGeometry(10.8, 0.055, 0.06)),
          beamMaterial,
        );
        beam.position.set(0, CEILING_Y, 1.2 - beamIndex * 3.1);
        scene.add(beam);
      }

      const poolTexture = makeLightPoolTexture(THREE);
      if (poolTexture) textures.push(poolTexture);
      const curtainTexture = makeLightCurtainTexture(THREE);
      if (curtainTexture) textures.push(curtainTexture);

      const cableMaterial = addMaterial(
        new THREE.LineBasicMaterial({
          color: 0xc6cdc7,
          transparent: true,
          opacity: 0.3,
        }),
      );

      const maxTravel = Math.max(
        0,
        -layoutFor(visibleItems.length - 1, isMobile).z + 4.2,
      );
      const galleryShell = host.parentElement;
      const nearestIndexForTravel = (nextTravel: number) => {
        let nearestIndex = 0;
        let nearestDistance = Number.POSITIVE_INFINITY;
        visibleItems.forEach((_item, index) => {
          const workTravel = -layoutFor(index, isMobile).z;
          const distance = Math.abs(workTravel - nextTravel);
          if (distance < nearestDistance) {
            nearestDistance = distance;
            nearestIndex = index;
          }
        });
        return nearestIndex;
      };
      const setTravelTarget = (
        nextTravel: number,
        preserveSelection = false,
      ) => {
        if (
          !preserveSelection &&
          selectedIndex >= 0 &&
          Math.abs(nextTravel - travelTarget) > 0.02
        ) {
          selectedIndex = -1;
          setSelectedItem(null);
        }
        travelTarget = clamp(nextTravel, 0, maxTravel);
        setNavigationIndex(nearestIndexForTravel(travelTarget));
        host.dataset.travel = travelTarget.toFixed(2);
      };
      const textureLoader = new THREE.TextureLoader();
      const fullResolutionRequested = new Set<number>();

      const prepareTexture = (sourceTexture: ThreeTypes.Texture) => {
        const source = sourceTexture.image as CanvasImageSource & {
          naturalWidth?: number;
          naturalHeight?: number;
          width?: number;
          height?: number;
        };
        const sourceWidth = source.naturalWidth ?? source.width ?? 1;
        const sourceHeight = source.naturalHeight ?? source.height ?? 1;
        const longestEdge = Math.max(sourceWidth, sourceHeight);
        const maxEdge = isMobile ? 768 : 1280;
        if (longestEdge <= maxEdge) return sourceTexture;

        const scale = maxEdge / longestEdge;
        const canvas = document.createElement("canvas");
        canvas.width = Math.max(1, Math.round(sourceWidth * scale));
        canvas.height = Math.max(1, Math.round(sourceHeight * scale));
        const context = canvas.getContext("2d", { alpha: false });
        if (!context) return sourceTexture;
        context.drawImage(source, 0, 0, canvas.width, canvas.height);
        sourceTexture.dispose();
        return new THREE.CanvasTexture(canvas);
      };

      let upgradeWorkTexture = (_index: number) => {};
      const createWork = (
        item: HangingGalleryItem,
        index: number,
        texture: ThreeTypes.Texture,
        isFullResolution = false,
      ) => {
        if (!scene || disposed) {
          texture.dispose();
          return;
        }

        textures.push(texture);
        texture.colorSpace = THREE.SRGBColorSpace;
        texture.anisotropy = Math.min(
          8,
          renderer?.capabilities.getMaxAnisotropy() ?? 1,
        );
        const accentColor = sampleTextureAccent(THREE, texture);

        const image = texture.image as
          | { naturalWidth?: number; naturalHeight?: number; width?: number; height?: number }
          | undefined;
        const imageWidth = image?.naturalWidth ?? image?.width ?? 1;
        const imageHeight = image?.naturalHeight ?? image?.height ?? 1;
        const aspect = clamp(imageWidth / Math.max(1, imageHeight), 0.42, 2.6);
        let panelWidth = 2.48;
        let panelHeight = panelWidth / aspect;
        if (aspect < 0.88) {
          panelHeight = 2.62;
          panelWidth = panelHeight * aspect;
        }
        panelHeight = clamp(panelHeight, 1.08, 2.68);
        panelWidth = clamp(panelWidth, 1.05, 2.7);

        const layout = layoutFor(index, isMobile);
        const root = new THREE.Group();
        root.position.set(layout.x, 0, layout.z);
        root.rotation.y = layout.yaw;
        root.scale.setScalar(layout.scale);

        const pivot = new THREE.Group();
        pivot.position.y = CEILING_Y;
        root.add(pivot);

        const panel = new THREE.Group();
        const cableLength = Math.max(
          0.68,
          CEILING_Y - layout.y - panelHeight / 2,
        );
        panel.position.y = -cableLength - panelHeight / 2;
        pivot.add(panel);

        const cableSpread = panelWidth * 0.37;
        const cableGeometry = addGeometry(
          new THREE.BufferGeometry().setFromPoints([
            new THREE.Vector3(-cableSpread, 0, 0),
            new THREE.Vector3(-cableSpread, -cableLength, 0),
            new THREE.Vector3(cableSpread, 0, 0),
            new THREE.Vector3(cableSpread, -cableLength, 0),
          ]),
        );
        const cables = new THREE.LineSegments(cableGeometry, cableMaterial);
        pivot.add(cables);

        const frameMaterial = addMaterial(
          new THREE.MeshStandardMaterial({
            color: 0x27302a,
            roughness: 0.48,
            metalness: 0.44,
            transparent: true,
            opacity: 0.74,
            emissive: accentColor,
            emissiveIntensity: 0.035,
          }),
        );
        const frame = new THREE.Mesh(
          addGeometry(
            new THREE.BoxGeometry(
              panelWidth + 0.085,
              panelHeight + 0.085,
              0.052,
            ),
          ),
          frameMaterial,
        );
        frame.position.z = -0.025;
        frame.castShadow = true;
        panel.add(frame);

        const imageMaterial = addMaterial(
          new THREE.MeshBasicMaterial({
            map: texture,
            side: THREE.DoubleSide,
            toneMapped: false,
            transparent: true,
          }),
        );
        const imageMesh = new THREE.Mesh(
          addGeometry(new THREE.PlaneGeometry(panelWidth, panelHeight)),
          imageMaterial,
        );
        imageMesh.position.z = 0.008;
        imageMesh.userData.hangingIndex = index;
        frame.userData.hangingIndex = index;
        panel.add(imageMesh);

        let lightPool: ThreeTypes.Mesh | undefined;
        let lightPoolMaterial: ThreeTypes.MeshBasicMaterial | undefined;
        if (poolTexture) {
          lightPoolMaterial = addMaterial(
            new THREE.MeshBasicMaterial({
              map: poolTexture,
              color: accentColor,
              transparent: true,
              opacity: 0,
              depthWrite: false,
              blending: THREE.AdditiveBlending,
              toneMapped: false,
            }),
          );
          lightPoolMaterial.visible = false;
          lightPool = new THREE.Mesh(
            addGeometry(
              new THREE.PlaneGeometry(
                Math.max(2.5, panelWidth * 1.8),
                Math.max(1.3, panelWidth * 0.82),
              ),
            ),
            lightPoolMaterial,
          );
          lightPool.rotation.x = -Math.PI / 2;
          lightPool.position.set(
            layout.x,
            FLOOR_Y + 0.009,
            layout.z + 0.1,
          );
          scene.add(lightPool);
        }

        let lightCurtainMaterial: ThreeTypes.MeshBasicMaterial | undefined;
        if (curtainTexture) {
          lightCurtainMaterial = addMaterial(
            new THREE.MeshBasicMaterial({
              map: curtainTexture,
              color: accentColor,
              transparent: true,
              opacity: 0,
              depthWrite: false,
              blending: THREE.AdditiveBlending,
              side: THREE.DoubleSide,
              toneMapped: false,
            }),
          );
          lightCurtainMaterial.visible = false;
          const lightCurtain = new THREE.Mesh(
            addGeometry(
              new THREE.PlaneGeometry(
                Math.max(1.45, panelWidth * 1.58),
                ((CEILING_Y - FLOOR_Y) * 0.94) / layout.scale,
              ),
            ),
            lightCurtainMaterial,
          );
          lightCurtain.position.set(
            0,
            ((CEILING_Y + FLOOR_Y) * 0.5) / layout.scale,
            -0.16,
          );
          root.add(lightCurtain);
        }

        const work: HangingWork = {
          item,
          root,
          pivot,
          panel,
          accentColor,
          lightPool,
          lightPoolMaterial,
          lightCurtainMaterial,
          hitMeshes: [imageMesh, frame],
          frameMaterial,
          imageMaterial,
          angleX: 0,
          angleZ: 0,
          velocityX: 0,
          velocityZ: 0,
          phase: index * 0.89,
          scale: layout.scale,
        };
        works[index] = work;
        hitMeshes.push(imageMesh, frame);
        scene.add(root);
        if (isFullResolution) {
          fullResolutionRequested.add(index);
        } else if (index === 0 || index === selectedIndex) {
          upgradeWorkTexture(index);
        }
        if (!disposed && index === 0) setIsReady(true);
      };

      upgradeWorkTexture = (index: number) => {
        if (disposed || fullResolutionRequested.has(index)) return;
        const work = works[index];
        const source = visibleItems[index]?.imageUrl;
        if (!work || !source) return;
        fullResolutionRequested.add(index);
        textureLoader.load(
          source,
          (sourceTexture) => {
            if (disposed) {
              sourceTexture.dispose();
              return;
            }
            const texture = prepareTexture(sourceTexture);
            texture.colorSpace = THREE.SRGBColorSpace;
            texture.anisotropy = Math.min(
              8,
              renderer?.capabilities.getMaxAnisotropy() ?? 1,
            );
            textures.push(texture);
            const previousTexture = work.imageMaterial.map;
            work.imageMaterial.map = texture;
            work.imageMaterial.needsUpdate = true;
            const accentColor = sampleTextureAccent(THREE, texture);
            work.accentColor.copy(accentColor);
            work.frameMaterial.emissive.copy(accentColor);
            work.lightPoolMaterial?.color.copy(accentColor);
            work.lightCurtainMaterial?.color.copy(accentColor);
            if (previousTexture && previousTexture !== texture) {
              previousTexture.dispose();
              const previousIndex = textures.indexOf(previousTexture);
              if (previousIndex >= 0) textures.splice(previousIndex, 1);
            }
          },
        );
      };

      const focusWorkAt = (requestedIndex: number) => {
        const index = clamp(
          Math.round(requestedIndex),
          0,
          visibleItems.length - 1,
        );
        const item = visibleItems[index];
        if (!item) return;

        const previousIndex =
          selectedIndex >= 0
            ? selectedIndex
            : nearestIndexForTravel(travelTarget);
        const layout = layoutFor(index, isMobile);
        selectedIndex = index;
        setTravelTarget(-layout.z, true);
        viewYawTarget = clamp(
          Math.atan2(layout.x, isMobile ? 6.1 : 7.2),
          isMobile ? -0.34 : -0.38,
          isMobile ? 0.34 : 0.38,
        );
        setNavigationIndex(index);
        setSelectedItem(item);
        upgradeWorkTexture(index);

        const work = works[index];
        if (work && !reduceMotion) {
          const direction = index >= previousIndex ? 1 : -1;
          work.velocityX += 0.08;
          work.velocityZ += direction * 0.22;
        }
      };
      focusIndexRef.current = focusWorkAt;

      visibleItems.forEach((item, index) => {
        const previewSource = item.previewUrl ?? item.imageUrl;
        textureLoader.load(
          previewSource,
          (texture) =>
            createWork(
              item,
              index,
              prepareTexture(texture),
              previewSource === item.imageUrl,
            ),
          undefined,
          () => {
            if (previewSource !== item.imageUrl) {
              textureLoader.load(
                item.imageUrl,
                (texture) =>
                  createWork(item, index, prepareTexture(texture), true),
                undefined,
                () => {
                  if (!disposed && index === 0) {
                    setIsReady(true);
                  }
                },
              );
              return;
            }
            if (!disposed && index === 0) {
              setIsReady(true);
            }
          },
        );
      });

      const raycaster = new THREE.Raycaster();
      const pointer = new THREE.Vector2();

      const updatePointer = (event: PointerEvent) => {
        if (!renderer) return;
        const bounds = renderer.domElement.getBoundingClientRect();
        pointer.x = ((event.clientX - bounds.left) / bounds.width) * 2 - 1;
        pointer.y = -((event.clientY - bounds.top) / bounds.height) * 2 + 1;
      };

      const hitAtPointer = () => {
        if (!camera) return null;
        raycaster.setFromCamera(pointer, camera);
        return raycaster.intersectObjects(hitMeshes, false)[0] ?? null;
      };

      const onPointerMove = (event: PointerEvent) => {
        updatePointer(event);
        if (pointerDown && event.pointerId === activePointerId) {
          const deltaX = event.clientX - pointerLastX;
          const deltaY = event.clientY - pointerLastY;
          pointerLastX = event.clientX;
          pointerLastY = event.clientY;
          pointerTravel += Math.hypot(deltaX, deltaY);
          if (pointerTravel > 7 && hoveredIndex >= 0) {
            hoveredIndex = -1;
            renderer?.domElement.classList.remove("is-hovering-work");
          }

          if (
            pointerType === "touch" &&
            pointerMode === "pending" &&
            pointerTravel > 7
          ) {
            pointerMode =
              Math.abs(deltaY) > Math.abs(deltaX) * 1.1
                ? "travel"
                : "view";
          }

          if (pointerType === "touch" && pointerMode === "travel") {
            const travelDelta = -deltaY * 0.022;
            setTravelTarget(travelTarget + travelDelta);
          } else {
            pointerMode = "view";
            viewYawTarget = clamp(
              viewYawTarget + deltaX * (isMobile ? 0.003 : 0.0028),
              isMobile ? -0.34 : -0.38,
              isMobile ? 0.34 : 0.38,
            );
            viewPitchTarget = clamp(
              viewPitchTarget - deltaY * (isMobile ? 0.0025 : 0.0024),
              isMobile ? -0.16 : -0.18,
              isMobile ? 0.16 : 0.18,
            );
          }
          return;
        }

        const intersection = hitAtPointer();
        hoveredIndex =
          (intersection?.object.userData.hangingIndex as number | undefined) ??
          -1;
        renderer?.domElement.classList.toggle(
          "is-hovering-work",
          hoveredIndex >= 0,
        );
      };

      const onPointerDown = (event: PointerEvent) => {
        if (!event.isPrimary || event.button !== 0) return;
        pointerDown = true;
        activePointerId = event.pointerId;
        pointerDownX = event.clientX;
        pointerDownY = event.clientY;
        pointerLastX = event.clientX;
        pointerLastY = event.clientY;
        pointerTravel = 0;
        pointerType = event.pointerType;
        pointerMode = event.pointerType === "touch" ? "pending" : "view";
        updatePointer(event);
        renderer?.domElement.setPointerCapture?.(event.pointerId);
      };

      const onPointerUp = (event: PointerEvent) => {
        if (
          !event.isPrimary ||
          !pointerDown ||
          event.pointerId !== activePointerId
        ) {
          return;
        }
        pointerDown = false;
        activePointerId = null;
        pointerType = "";
        pointerMode = "pending";
        renderer?.domElement.releasePointerCapture?.(event.pointerId);
        const movement = Math.hypot(
          event.clientX - pointerDownX,
          event.clientY - pointerDownY,
        );
        if (movement > 7 || pointerTravel > 7) return;

        updatePointer(event);
        const intersection = hitAtPointer();
        const index = intersection?.object.userData.hangingIndex as
          | number
          | undefined;
        if (index === undefined || !intersection) return;
        const work = works[index];
        if (!work) return;

        const localPoint = work.panel.worldToLocal(intersection.point.clone());
        const side =
          localPoint.x === 0
            ? index % 2
              ? -1
              : 1
            : -Math.sign(localPoint.x);
        if (!reduceMotion) {
          const impulseX = clamp(
            0.26 + localPoint.y * 0.11,
            -0.18,
            0.44,
          );
          const impulseZ =
            side *
            clamp(0.52 + Math.abs(localPoint.x) * 0.28, 0.5, 0.92);
          work.velocityX += impulseX;
          work.velocityZ += impulseZ;

          let nearestWork: HangingWork | undefined;
          let nearestDistance = Number.POSITIVE_INFINITY;
          works.forEach((candidate, candidateIndex) => {
            if (!candidate || candidateIndex === index) return;
            const deltaX = candidate.root.position.x - work.root.position.x;
            const deltaZ = candidate.root.position.z - work.root.position.z;
            const distance = deltaX * deltaX + deltaZ * deltaZ;
            if (distance < nearestDistance) {
              nearestDistance = distance;
              nearestWork = candidate;
            }
          });
          if (nearestWork) {
            const neighbor = nearestWork;
            const timer = window.setTimeout(() => {
              pendingSwingTimers.delete(timer);
              if (disposed) return;
              neighbor.velocityX += impulseX * 0.1;
              neighbor.velocityZ += impulseZ * 0.1;
            }, isMobile ? 54 : 72);
            pendingSwingTimers.add(timer);
          }
        }
        selectedIndex = index;
        setNavigationIndex(index);
        upgradeWorkTexture(index);
        setSelectedItem(work.item);
      };

      const onPointerCancel = (event: PointerEvent) => {
        if (event.pointerId !== activePointerId) return;
        pointerDown = false;
        activePointerId = null;
        pointerType = "";
        pointerMode = "pending";
        pointerTravel = 0;
      };

      const onPointerLeave = () => {
        if (pointerDown) return;
        hoveredIndex = -1;
        renderer?.domElement.classList.remove("is-hovering-work");
      };

      const onWheel = (event: WheelEvent) => {
        event.preventDefault();
        const pixelDelta =
          event.deltaMode === 1
            ? event.deltaY * 16
            : event.deltaMode === 2
              ? event.deltaY * Math.max(1, host.clientHeight)
              : event.deltaY;
        const travelDelta = clamp(
          pixelDelta * (isMobile ? 0.02 : 0.018),
          -2.2,
          2.2,
        );
        setTravelTarget(
          travelTarget + travelDelta,
        );
      };

      const resize = () => {
        if (!renderer || !camera) return;
        const bounds = host.getBoundingClientRect();
        const nextMobile = bounds.width <= 760;
        isMobile = nextMobile;
        renderer.shadowMap.enabled = !isMobile;
        keyLight.castShadow = !isMobile;
        responseLight.distance = isMobile ? 4.8 : 7.2;
        renderer.setPixelRatio(
          Math.min(window.devicePixelRatio || 1, isMobile ? 1.25 : 1.6),
        );
        renderer.setSize(Math.max(1, bounds.width), Math.max(1, bounds.height), false);
        camera.aspect = Math.max(1, bounds.width) / Math.max(1, bounds.height);
        camera.fov = isMobile ? 48 : 42;
        camera.updateProjectionMatrix();
        const fog = scene?.fog;
        if (fog instanceof THREE.FogExp2) {
          fog.density = isMobile ? 0.048 : 0.037;
        }

        works.forEach((work, index) => {
          if (!work) return;
          const layout = layoutFor(index, isMobile);
          work.root.position.x = layout.x;
          work.root.position.z = layout.z;
          work.root.rotation.y = layout.yaw;
          work.scale = layout.scale;
          work.lightPool?.position.set(
            layout.x,
            FLOOR_Y + 0.009,
            layout.z + 0.1,
          );
        });
      };

      const canvas = renderer.domElement;
      canvas.addEventListener("pointermove", onPointerMove);
      canvas.addEventListener("pointerdown", onPointerDown);
      canvas.addEventListener("pointerup", onPointerUp);
      canvas.addEventListener("pointercancel", onPointerCancel);
      canvas.addEventListener("pointerleave", onPointerLeave);
      canvas.addEventListener("wheel", onWheel, { passive: false });
      cleanupCallbacks.push(() => {
        canvas.removeEventListener("pointermove", onPointerMove);
        canvas.removeEventListener("pointerdown", onPointerDown);
        canvas.removeEventListener("pointerup", onPointerUp);
        canvas.removeEventListener("pointercancel", onPointerCancel);
        canvas.removeEventListener("pointerleave", onPointerLeave);
        canvas.removeEventListener("wheel", onWheel);
      });

      const resizeObserver = new ResizeObserver(resize);
      resizeObserver.observe(host);
      cleanupCallbacks.push(() => resizeObserver.disconnect());
      resize();

      const animate = (now: number) => {
        if (disposed || !renderer || !scene || !camera) return;
        if (!activeRef.current) {
          lastFrameAt = now;
          inactiveTimer = window.setTimeout(() => {
            inactiveTimer = 0;
            if (!disposed) frame = requestAnimationFrame(animate);
          }, 120);
          return;
        }
        const delta = clamp((now - lastFrameAt) / 1000, 1 / 240, 1 / 20);
        lastFrameAt = now;
        travel += (travelTarget - travel) * (reduceMotion ? 0.32 : 0.11);
        if (!pointerDown) {
          const returnDamping = Math.exp(-(reduceMotion ? 4.8 : 0.68) * delta);
          viewYawTarget *= returnDamping;
          viewPitchTarget *= returnDamping;
        }
        const viewResponse = reduceMotion
          ? 1
          : 1 - Math.exp(-7.2 * delta);
        viewYaw += (viewYawTarget - viewYaw) * viewResponse;
        viewPitch += (viewPitchTarget - viewPitch) * viewResponse;
        galleryShell?.style.setProperty(
          "--gallery-progress",
          String(maxTravel > 0 ? clamp(travel / maxTravel, 0, 1) : 0),
        );
        const cameraZ = CAMERA_START_Z - travel;
        const lookDistance = isMobile ? 6.1 : 7.2;
        const parallaxX =
          Math.sin(viewYaw) * (isMobile ? 0.18 : 0.46);
        const parallaxY =
          Math.sin(viewPitch) * (isMobile ? 0.1 : 0.2);
        camera.position.set(parallaxX, cameraY + parallaxY, cameraZ);
        camera.lookAt(
          parallaxX + Math.sin(viewYaw) * lookDistance,
          0.06 + Math.sin(viewPitch) * lookDistance,
          cameraZ - Math.cos(viewYaw) * lookDistance,
        );

        const focusedIndex =
          hoveredIndex >= 0 ? hoveredIndex : selectedIndex;
        const focusedWork =
          focusedIndex >= 0 ? works[focusedIndex] : undefined;
        const visualResponse = reduceMotion
          ? 1
          : 1 - Math.exp(-7.5 * delta);

        works.forEach((work, index) => {
          if (!work) return;
          if (Math.abs(cameraZ - work.root.position.z) < 8.4) {
            upgradeWorkTexture(index);
          }
          if (!reduceMotion) {
            work.velocityX += -work.angleX * 8.4 * delta;
            work.velocityZ += -work.angleZ * 8.4 * delta;
            const damping = Math.exp(-2.15 * delta);
            work.velocityX *= damping;
            work.velocityZ *= damping;
            work.angleX = clamp(
              work.angleX + work.velocityX * delta,
              -0.28,
              0.28,
            );
            work.angleZ = clamp(
              work.angleZ + work.velocityZ * delta,
              -0.3,
              0.3,
            );
          } else {
            work.angleX = 0;
            work.angleZ = 0;
            work.velocityX = 0;
            work.velocityZ = 0;
          }

          const idleX = reduceMotion
            ? 0
            : Math.sin(now * 0.00042 + work.phase) * 0.004;
          const idleZ = reduceMotion
            ? 0
            : Math.cos(now * 0.00031 + work.phase) * 0.003;
          work.pivot.rotation.x = work.angleX + idleX;
          work.pivot.rotation.z = work.angleZ + idleZ;

          const active = index === selectedIndex;
          const hovered = index === hoveredIndex;
          const focused = index === focusedIndex;
          const targetScale =
            work.scale * (active ? 1.035 : hovered ? 1.015 : 1);
          const nextScale =
            work.root.scale.x + (targetScale - work.root.scale.x) * 0.085;
          work.root.scale.setScalar(nextScale);
          work.frameMaterial.emissiveIntensity +=
            ((active ? 0.25 : hovered ? 0.12 : 0.035) -
              work.frameMaterial.emissiveIntensity) *
            0.09;
          work.imageMaterial.opacity = active ? 1 : 0.96;

          if (work.lightPoolMaterial) {
            const poolTarget = focused
              ? isMobile
                ? active
                  ? 0.055
                  : 0.035
                : active
                  ? 0.16
                  : 0.095
              : 0;
            work.lightPoolMaterial.opacity +=
              (poolTarget - work.lightPoolMaterial.opacity) *
              visualResponse;
            work.lightPoolMaterial.visible =
              work.lightPoolMaterial.opacity > 0.002;
          }

          if (work.lightCurtainMaterial) {
            if (!focused) {
              work.lightCurtainMaterial.opacity = 0;
              work.lightCurtainMaterial.visible = false;
            } else {
              const curtainTarget = isMobile
                ? active
                  ? 0.026
                  : 0.018
                : active
                  ? 0.082
                  : 0.048;
              work.lightCurtainMaterial.opacity +=
                (curtainTarget - work.lightCurtainMaterial.opacity) *
                visualResponse;
              work.lightCurtainMaterial.visible =
                work.lightCurtainMaterial.opacity > 0.002;
            }
          }
        });

        const responseIntensity = focusedWork
          ? isMobile
            ? focusedIndex === selectedIndex
              ? 1.6
              : 1.05
            : focusedIndex === selectedIndex
              ? 5.2
              : 3.4
          : 0;
        responseLight.intensity +=
          (responseIntensity - responseLight.intensity) * visualResponse;
        if (focusedWork) {
          focusedWork.panel.getWorldPosition(responsePosition);
          responsePosition.x *= 0.82;
          responsePosition.y += 0.52;
          responsePosition.z += 0.78;
          if (reduceMotion) {
            responseLight.position.copy(responsePosition);
            responseLight.color.copy(focusedWork.accentColor);
          } else {
            responseLight.position.lerp(responsePosition, visualResponse);
            responseLight.color.lerp(
              focusedWork.accentColor,
              visualResponse,
            );
          }
        }

        if (flowFloorMaterial && flowFloorTexture) {
          const flowTarget = focusedWork
            ? isMobile
              ? focusedIndex === selectedIndex
                ? 0.04
                : 0.026
              : focusedIndex === selectedIndex
                ? 0.11
                : 0.072
            : 0;
          flowFloorMaterial.opacity +=
            (flowTarget - flowFloorMaterial.opacity) * visualResponse;
          flowFloorMaterial.visible = flowFloorMaterial.opacity > 0.002;
          flowFloorMaterial.color.lerp(
            focusedWork?.accentColor ?? neutralAccent,
            visualResponse,
          );
          flowFloorTexture.offset.y =
            (travel * 0.018 + (reduceMotion ? 0 : now * 0.000004)) % 1;
        }

        renderer.render(scene, camera);
        frame = requestAnimationFrame(animate);
      };

      setTravelTarget(0, true);
      setNavigationIndex(0);
      galleryShell?.style.setProperty("--gallery-progress", "0");
      frame = requestAnimationFrame(animate);
    };

    void setup();

    return () => {
      disposed = true;
      cancelAnimationFrame(frame);
      window.clearTimeout(inactiveTimer);
      cleanupCallbacks.forEach((cleanup) => cleanup());
      pendingSwingTimers.forEach((timer) => window.clearTimeout(timer));
      pendingSwingTimers.clear();
      focusIndexRef.current = () => {};
      geometries.forEach((geometry) => geometry.dispose());
      materials.forEach((material) => material.dispose());
      textures.forEach((texture) => texture.dispose());
      host.parentElement?.style.removeProperty("--gallery-progress");
      if (renderer) {
        renderer.dispose();
        renderer.forceContextLoss();
        renderer.domElement.remove();
      }
      setIsReady(false);
    };
  }, [reduceMotion, visibleItems]);

  return (
    <div className="hanging-gallery-shell">
      <div
        className={`hanging-gallery-canvas ${isReady ? "is-ready" : ""}`}
        ref={hostRef}
      />
      <div className="hanging-gallery-depth" aria-hidden="true" />

      <div className="hanging-gallery-legend" aria-hidden="true">
        <span>SCROLL TO WALK</span>
        <i />
        <span>TOUCH THE WORK</span>
      </div>

      {!isReady ? (
        <div className="hanging-gallery-loading" aria-live="polite">
          <i />
          <span>构建展厅</span>
        </div>
      ) : null}

      <nav
        className={`hanging-gallery-navigation ${isReady ? "is-visible" : ""}`}
        aria-label="作品导航"
      >
        <button
          type="button"
          aria-label="上一件作品"
          disabled={navigationIndex <= 0}
          onClick={() => focusIndexRef.current(navigationIndex - 1)}
        >
          <span aria-hidden="true">←</span>
        </button>
        <output aria-live="polite" aria-atomic="true">
          <strong>{String(navigationIndex + 1).padStart(2, "0")}</strong>
          <i aria-hidden="true" />
          <span>{String(visibleItems.length).padStart(2, "0")}</span>
        </output>
        <button
          type="button"
          aria-label="下一件作品"
          disabled={navigationIndex >= visibleItems.length - 1}
          onClick={() => focusIndexRef.current(navigationIndex + 1)}
        >
          <span aria-hidden="true">→</span>
        </button>
      </nav>

      <div
        className={`hanging-gallery-selection ${isReady && selectedItem ? "is-visible" : ""}`}
        aria-live="polite"
      >
        {selectedItem ? (
          <>
            <div>
              <small>{selectedItem.date}</small>
              <strong>{selectedItem.title}</strong>
            </div>
            <button type="button" onClick={() => openRef.current(selectedItem.id)}>
              <span>{openLabel}</span>
              <b aria-hidden="true">↗</b>
            </button>
          </>
        ) : null}
      </div>
    </div>
  );
}
