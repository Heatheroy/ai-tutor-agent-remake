import type { Asset, Layer, LayoutProject } from './types';

const STICKERS = [
  { id: 'builtin-owl', name: '导师猫头鹰', src: '/tutor-assets/owl.png', x: 240, y: 320, width: 250, rotation: -8 },
  { id: 'builtin-book', name: '课本', src: '/tutor-assets/book.png', x: 500, y: 300, width: 190, rotation: 7 },
  { id: 'builtin-cards', name: '闪卡', src: '/tutor-assets/cards.png', x: 750, y: 410, width: 180, rotation: -6 },
  { id: 'builtin-mindmap', name: '思维导图', src: '/tutor-assets/mindmap.png', x: 760, y: 160, width: 170, rotation: 0 },
  { id: 'builtin-quiz', name: '测验勋章', src: '/tutor-assets/quiz.png', x: 250, y: 490, width: 130, rotation: 8 },
  { id: 'builtin-spark', name: '闪光', src: '/tutor-assets/spark.png', x: 430, y: 110, width: 72, rotation: 14 },
];

function readBlob(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(blob);
  });
}

function measure(dataUrl: string): Promise<Pick<Asset, 'width' | 'height'>> {
  return new Promise((resolve, reject) => {
    const image = new Image();
    image.onload = () => resolve({ width: image.naturalWidth, height: image.naturalHeight });
    image.onerror = () => reject(new Error('Could not read sticker'));
    image.src = dataUrl;
  });
}

async function loadSticker(item: (typeof STICKERS)[number]): Promise<Asset> {
  const response = await fetch(item.src);
  if (!response.ok) {
    throw new Error(item.src);
  }
  const dataUrl = await readBlob(await response.blob());
  const size = await measure(dataUrl);
  return {
    id: item.id,
    name: item.name,
    dataUrl,
    width: size.width,
    height: size.height,
  };
}

export async function withBuiltinStickers(project: LayoutProject): Promise<LayoutProject> {
  const missing = STICKERS.filter((item) => !project.assets.some((asset) => asset.id === item.id));
  if (missing.length === 0) {
    return project;
  }

  const loaded: Asset[] = [];
  for (const item of missing) {
    try {
      loaded.push(await loadSticker(item));
    } catch {
      // Skip a sticker that is not available yet.
    }
  }
  if (loaded.length === 0) {
    return project;
  }

  const assets = [...project.assets, ...loaded];
  const pages = project.pages.map((page) => ({ ...page, layers: [...page.layers] }));
  const boardIsEmpty = pages.every((page) => page.layers.length === 0);
  if (boardIsEmpty) {
    const known = new Set(assets.map((asset) => asset.id));
    const layers: Layer[] = STICKERS.filter((item) => known.has(item.id)).map((item) => ({
      id: `layer-${item.id}`,
      assetId: item.id,
      x: item.x,
      y: item.y,
      width: item.width,
      scale: 1,
      rotation: item.rotation,
      hidden: false,
      locked: false,
    }));
    pages[0] = {
      ...pages[0],
      name: pages[0].name === '页面 1' ? 'AI 导师' : pages[0].name,
      layers,
    };
  }

  return {
    ...project,
    updatedAt: Date.now(),
    assets,
    pages,
  };
}
