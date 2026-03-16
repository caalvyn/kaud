import { useEffect, useRef } from 'react';
import { useIDEStore } from '@/stores/ideStore';
import type { FileNode } from '@/types/ide';

const DB_NAME = 'kaud-emergency';
const STORE_NAME = 'workspace';
const KEY = 'autosave';
const AUTO_SAVE_INTERVAL = 30_000; // 30 seconds

interface AutoSaveData {
  files: FileNode[];
  timestamp: number;
}

function openDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, 1);
    req.onupgradeneeded = () => {
      req.result.createObjectStore(STORE_NAME);
    };
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

export async function saveToIndexedDB(files: FileNode[]): Promise<void> {
  try {
    const db = await openDB();
    const tx = db.transaction(STORE_NAME, 'readwrite');
    const data: AutoSaveData = { files, timestamp: Date.now() };
    tx.objectStore(STORE_NAME).put(data, KEY);
    return new Promise((resolve, reject) => {
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error);
    });
  } catch {
    // IndexedDB may not be available
  }
}

export async function loadFromIndexedDB(): Promise<AutoSaveData | null> {
  try {
    const db = await openDB();
    const tx = db.transaction(STORE_NAME, 'readonly');
    const req = tx.objectStore(STORE_NAME).get(KEY);
    return new Promise((resolve, reject) => {
      req.onsuccess = () => resolve(req.result || null);
      req.onerror = () => reject(req.error);
    });
  } catch {
    return null;
  }
}

export async function clearIndexedDB(): Promise<void> {
  try {
    const db = await openDB();
    const tx = db.transaction(STORE_NAME, 'readwrite');
    tx.objectStore(STORE_NAME).delete(KEY);
  } catch {
    // ignore
  }
}

export function useAutoSave() {
  const intervalRef = useRef<ReturnType<typeof setInterval>>();

  // beforeunload warning
  useEffect(() => {
    const handler = (e: BeforeUnloadEvent) => {
      const state = useIDEStore.getState();
      const hasFiles = state.files.length > 0;
      const hasUnsaved = state.tabs.some(t => t.isModified) || state.rightTabs.some(t => t.isModified);
      if (hasFiles || hasUnsaved) {
        // Emergency save on close attempt
        saveToIndexedDB(state.files);
        e.preventDefault();
        e.returnValue = '';
      }
    };
    window.addEventListener('beforeunload', handler);
    return () => window.removeEventListener('beforeunload', handler);
  }, []);

  // Periodic auto-save to IndexedDB
  useEffect(() => {
    intervalRef.current = setInterval(() => {
      const state = useIDEStore.getState();
      if (state.files.length > 0) {
        saveToIndexedDB(state.files);
      }
    }, AUTO_SAVE_INTERVAL);

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, []);

  // Also save on visibility change (user switching tabs, minimizing)
  useEffect(() => {
    const handler = () => {
      if (document.visibilityState === 'hidden') {
        const state = useIDEStore.getState();
        if (state.files.length > 0) {
          saveToIndexedDB(state.files);
        }
      }
    };
    document.addEventListener('visibilitychange', handler);
    return () => document.removeEventListener('visibilitychange', handler);
  }, []);
}
