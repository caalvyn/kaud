/**
 * Workspace Sync — links a local folder via the File System Access API
 * so that all file operations in the IDE auto-save to disk.
 */

let linkedDirHandle: FileSystemDirectoryHandle | null = null;
let listeners: Array<(linked: boolean, name?: string) => void> = [];

export const isLinked = () => !!linkedDirHandle;
export const getLinkedName = () => linkedDirHandle?.name ?? null;

export const onLinkChange = (fn: (linked: boolean, name?: string) => void) => {
  listeners.push(fn);
  return () => { listeners = listeners.filter(l => l !== fn); };
};

const notify = () => {
  const linked = !!linkedDirHandle;
  const name = linkedDirHandle?.name;
  listeners.forEach(fn => fn(linked, name));
};

export const linkFolder = async (): Promise<boolean> => {
  if (!('showDirectoryPicker' in window)) {
    alert('Your browser does not support the File System Access API. Please use Chrome or Edge.');
    return false;
  }
  try {
    linkedDirHandle = await (window as any).showDirectoryPicker({ mode: 'readwrite' });
    notify();
    return true;
  } catch (err: any) {
    if (err.name !== 'AbortError') console.error('Failed to link folder:', err);
    return false;
  }
};

export const unlinkFolder = () => {
  linkedDirHandle = null;
  notify();
};

/** Get or create a subdirectory handle from a path like "src/components" */
const getDir = async (root: FileSystemDirectoryHandle, pathParts: string[]): Promise<FileSystemDirectoryHandle> => {
  let dir = root;
  for (const part of pathParts) {
    dir = await dir.getDirectoryHandle(part, { create: true });
  }
  return dir;
};

/** Normalise the virtual path to an array of segments */
const segments = (path: string): string[] =>
  path.split('/').filter(Boolean);

/** Write a single file to the linked directory */
export const syncFileWrite = async (filePath: string, content: string) => {
  if (!linkedDirHandle) return;
  try {
    const parts = segments(filePath);
    const fileName = parts.pop()!;
    const dir = await getDir(linkedDirHandle, parts);
    const fileHandle = await dir.getFileHandle(fileName, { create: true });
    const writable = await fileHandle.createWritable();
    await writable.write(content);
    await writable.close();
  } catch (err) {
    console.warn('[WorkspaceSync] write failed:', filePath, err);
  }
};

/** Create an empty folder in the linked directory */
export const syncFolderCreate = async (folderPath: string) => {
  if (!linkedDirHandle) return;
  try {
    const parts = segments(folderPath);
    await getDir(linkedDirHandle, parts);
  } catch (err) {
    console.warn('[WorkspaceSync] folder create failed:', folderPath, err);
  }
};

/** Delete a file or folder from the linked directory */
export const syncDelete = async (nodePath: string, isFolder: boolean) => {
  if (!linkedDirHandle) return;
  try {
    const parts = segments(nodePath);
    const name = parts.pop()!;
    const parentDir = await getDir(linkedDirHandle, parts);
    await parentDir.removeEntry(name, { recursive: isFolder });
  } catch (err) {
    console.warn('[WorkspaceSync] delete failed:', nodePath, err);
  }
};

/** Write ALL files to the linked folder (initial sync) */
export const syncAllFiles = async (files: Array<{ path: string; content: string; type: 'file' | 'folder' }>) => {
  if (!linkedDirHandle) return;
  for (const f of files) {
    if (f.type === 'folder') {
      await syncFolderCreate(f.path);
    } else {
      await syncFileWrite(f.path, f.content);
    }
  }
};
