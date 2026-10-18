import { emptyProject, isProject, normalizeProject, type LayoutProject } from './types';

const DB_NAME = 'layout-editor';
const STORE = 'kv';
const PROJECT_KEY = 'project';
const REV_KEY = 'layout-editor-rev';
const CHANNEL = 'layout-editor';

function openDb(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, 1);
    request.onupgradeneeded = () => {
      request.result.createObjectStore(STORE);
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

function idbGet(db: IDBDatabase): Promise<unknown> {
  return new Promise((resolve, reject) => {
    const request = db.transaction(STORE).objectStore(STORE).get(PROJECT_KEY);
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

function idbSet(db: IDBDatabase, project: LayoutProject): Promise<void> {
  return new Promise((resolve, reject) => {
    const request = db.transaction(STORE, 'readwrite').objectStore(STORE).put(project, PROJECT_KEY);
    request.onsuccess = () => resolve();
    request.onerror = () => reject(request.error);
  });
}

export async function loadProject(): Promise<LayoutProject> {
  try {
    const stored = await idbGet(await openDb());
    if (isProject(stored)) {
      return normalizeProject(stored);
    }
  } catch {
    // Fall through to a new project when storage is unavailable.
  }
  return emptyProject();
}

export async function saveProject(project: LayoutProject, tabId: string) {
  await idbSet(await openDb(), project);
  localStorage.setItem(REV_KEY, String(project.updatedAt));
  const channel = new BroadcastChannel(CHANNEL);
  channel.postMessage({ tabId, updatedAt: project.updatedAt });
  channel.close();
}

export function subscribeToProject(tabId: string, onChange: () => void) {
  const channel = new BroadcastChannel(CHANNEL);
  channel.onmessage = (event) => {
    if (event.data?.tabId !== tabId) {
      onChange();
    }
  };
  const onStorage = (event: StorageEvent) => {
    if (event.key === REV_KEY) {
      onChange();
    }
  };
  window.addEventListener('storage', onStorage);
  return () => {
    channel.close();
    window.removeEventListener('storage', onStorage);
  };
}
