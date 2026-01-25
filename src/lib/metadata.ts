import { BlobReader, ZipReader, TextWriter, BlobWriter, Uint8ArrayWriter } from '@zip.js/zip.js';

export interface EpubMetadata {
  title: string;
  author: string | null;
  coverBlob: Uint8Array | null;
  description: string | null;
}

/**
 * Parses an EPUB file (buffer) to extract metadata and cover image.
 * Uses zip.js to read the archive without full rendering.
 */
export async function parseEpub(fileData: Uint8Array): Promise<EpubMetadata> {
  const blob = new Blob([fileData]);
  const zipReader = new ZipReader(new BlobReader(blob));
  
  try {
    const entries = await zipReader.getEntries();
    
    // 1. Find META-INF/container.xml to locate the OPF file
    const containerEntry = entries.find(e => e.filename === 'META-INF/container.xml');
    if (!containerEntry || containerEntry.directory) throw new Error('Invalid EPUB: Missing META-INF/container.xml');
    
    // @ts-ignore - zip.js types can be tricky, but we know this file entry has getData
    const containerXml = await containerEntry.getData(new TextWriter());
    const opfPath = getOpfPath(containerXml);
    
    // 2. Read the OPF file
    const opfEntry = entries.find(e => e.filename === opfPath);
    if (!opfEntry || opfEntry.directory) throw new Error(`Invalid EPUB: Missing OPF file at ${opfPath}`);
    
    // @ts-ignore
    const opfXml = await opfEntry.getData(new TextWriter());
    
    // 3. Parse Metadata
    const parser = new DOMParser();
    const doc = parser.parseFromString(opfXml, 'application/xml');
    
    const title = getMetaText(doc, 'dc:title') || 'Unknown Title';
    const author = getMetaText(doc, 'dc:creator');
    const description = getMetaText(doc, 'dc:description');
    
    // 4. Find Cover Image
    let coverBlob: Uint8Array | null = null;
    const coverHref = findCoverHref(doc);
    
    if (coverHref) {
      // Resolve path relative to OPF file
      const opfDir = opfPath.includes('/') ? opfPath.substring(0, opfPath.lastIndexOf('/') + 1) : '';
      // Simple path resolution (handling basic relative paths)
      let absoluteCoverPath = opfDir + coverHref;
      
      // Handle simple '..' parent directory references if necessary (basic implementation)
      // Ideally use a proper path resolver, but for EPUB structure this usually suffices
      while (absoluteCoverPath.includes('../')) {
        absoluteCoverPath = absoluteCoverPath.replace(/[^/]+\/\.\.\//, '');
      }

      // Find the entry
      const coverEntry = entries.find(e => e.filename === absoluteCoverPath);
      if (coverEntry && !coverEntry.directory) {
        // @ts-ignore
        coverBlob = await coverEntry.getData(new Uint8ArrayWriter());
      }
    }
    
    return {
      title,
      author,
      description,
      coverBlob
    };
    
  } finally {
    await zipReader.close();
  }
}

// --- Helpers ---

function getOpfPath(containerXml: string): string {
  const parser = new DOMParser();
  const doc = parser.parseFromString(containerXml, 'application/xml');
  const rootfile = doc.querySelector('rootfile');
  return rootfile?.getAttribute('full-path') || 'OEBPS/content.opf';
}

function getMetaText(doc: Document, tagName: string): string | null {
  const el = doc.getElementsByTagName(tagName)[0]; // logic can be improved to handle multiple (e.g. authors)
  return el?.textContent?.trim() || null;
}

function findCoverHref(doc: Document): string | null {
  // Method A: <meta name="cover" content="cover-image-id" />
  const metaCover = doc.querySelector('meta[name="cover"]');
  if (metaCover) {
    const coverId = metaCover.getAttribute('content');
    if (coverId) {
      const item = doc.querySelector(`item[id="${coverId}"]`);
      return item?.getAttribute('href') || null;
    }
  }
  
  // Method B: <item properties="cover-image" href="..." /> (EPUB 3)
  const itemCover = doc.querySelector('item[properties="cover-image"]');
  if (itemCover) {
    return itemCover.getAttribute('href') || null;
  }
  
  // Method C: Look for an item with id "cover" or "cover-image" as fallback
  const fallbackId = doc.querySelector('item[id="cover"]') || doc.querySelector('item[id="cover-image"]');
  return fallbackId?.getAttribute('href') || null;
}
