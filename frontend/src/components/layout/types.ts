export interface Asset {
  id: string;
  name: string;
  dataUrl: string;
  width: number;
  height: number;
}

export interface Layer {
  id: string;
  assetId: string;
  x: number;
  y: number;
  width: number;
  scale: number;
  rotation: number;
  hidden: boolean;
  locked: boolean;
}

export interface LayoutPage {
  id: string;
  name: string;
  layers: Layer[];
}

export interface LayoutProject {
  updatedAt: number;
  activePageId: string;
  assets: Asset[];
  pages: LayoutPage[];
}

export const ARTBOARD_WIDTH = 960;
export const ARTBOARD_HEIGHT = 600;

export function createId() {
  return crypto.randomUUID();
}

export function emptyProject(): LayoutProject {
  const pageId = createId();
  return {
    updatedAt: Date.now(),
    activePageId: pageId,
    assets: [],
    pages: [{ id: pageId, name: '页面 1', layers: [] }],
  };
}

export function isProject(value: unknown): value is LayoutProject {
  if (!value || typeof value !== 'object') {
    return false;
  }
  const project = value as LayoutProject;
  return Array.isArray(project.pages) && Array.isArray(project.assets) && project.pages.length > 0;
}

export function normalizeProject(value: LayoutProject): LayoutProject {
  const pages = value.pages.map((page, index) => ({
    id: page.id || createId(),
    name: page.name || `页面 ${index + 1}`,
    layers: Array.isArray(page.layers) ? page.layers : [],
  }));
  const activePageId = pages.some((page) => page.id === value.activePageId)
    ? value.activePageId
    : pages[0].id;
  return {
    updatedAt: value.updatedAt || Date.now(),
    activePageId,
    assets: value.assets.filter((asset) => asset && asset.dataUrl),
    pages,
  };
}
