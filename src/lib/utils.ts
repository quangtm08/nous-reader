export function blobToUint8Array(blob: unknown): Uint8Array | null {
  if (!blob) return null;
  
  if (blob instanceof Uint8Array) return blob;
  if (blob instanceof ArrayBuffer) return new Uint8Array(blob);
  if (Array.isArray(blob) && blob.every(item => typeof item === 'number')) return new Uint8Array(blob);
  
  if (typeof blob === 'string') {
    if (blob.startsWith('[') && blob.endsWith(']')) {
      try {
        const parsed = JSON.parse(blob);
        if (Array.isArray(parsed) && parsed.every(item => typeof item === 'number')) return new Uint8Array(parsed);
      } catch (e) { /* ignore */ }
    }
    
    try {
      const binary = atob(blob);
      const bytes = new Uint8Array(binary.length);
      for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
      return bytes;
    } catch (e) { /* ignore */ }
    
    if (/^[0-9a-fA-F]+$/.test(blob) && blob.length % 2 === 0) {
      try {
        const bytes = new Uint8Array(blob.length / 2);
        for (let i = 0; i < blob.length; i += 2) bytes[i / 2] = parseInt(blob.substring(i, i + 2), 16);
        return bytes;
      } catch (e) { /* ignore */ }
    }
    return null;
  }
  
  if (typeof blob === 'object' && blob !== null) {
    const keys = Object.keys(blob);
    if (keys.length > 0 && keys.every(k => /^\d+$/.test(k))) {
      const maxIndex = Math.max(...keys.map(Number));
      const arr = new Uint8Array(maxIndex + 1);
      for (const key of keys) {
        arr[Number(key)] = (blob as Record<string, number>)[key];
      }
      return arr;
    }
  }
  return null;
}
