import { BlobReader, ZipReader, TextWriter, Uint8ArrayWriter } from '@zip.js/zip.js';

export interface EpubMetadata {
  title: string;
  author: string | null;
  coverBlob: Uint8Array | null;
  description: string | null;
}

const CONTAINER_PATH = 'META-INF/container.xml';
const DEFAULT_OPF = 'OEBPS/content.opf';

export async function parseEpub(fileData: Uint8Array): Promise<EpubMetadata> {
  const blob = new Blob([fileData]);
  const zipReader = new ZipReader(new BlobReader(blob));

  try {
    const entries = await zipReader.getEntries();

    const containerEntry = entries.find(e => e.filename === CONTAINER_PATH);
    if (!containerEntry || containerEntry.directory) {
      throw new Error(`Invalid EPUB: Missing ${CONTAINER_PATH}`);
    }

    const containerXml = await containerEntry.getData(new TextWriter());
    const opfPath = getOpfPath(containerXml);

    const opfEntry = entries.find(e => e.filename === opfPath);
    if (!opfEntry || opfEntry.directory) {
      throw new Error(`Invalid EPUB: Missing OPF file at ${opfPath}`);
    }

    const opfXml = await opfEntry.getData(new TextWriter());
    const parser = new DOMParser();
    const doc = parser.parseFromString(opfXml, 'application/xml');

    const title = getMetaText(doc, 'dc:title') || 'Unknown Title';
    const author = getMetaText(doc, 'dc:creator');
    const description = getMetaText(doc, 'dc:description');

    const coverHref = findCoverHref(doc);
    const coverBlob = coverHref ? await extractCoverBlob(entries, opfPath, coverHref) : null;

    return { title, author, description, coverBlob };
  } finally {
    await zipReader.close();
  }
}

function getMetaText(doc: Document, tagName: string): string | null {
  const el = doc.getElementsByTagName(tagName)[0];
  return el?.textContent?.trim() || null;
}

function getOpfPath(containerXml: string): string {
  const parser = new DOMParser();
  const doc = parser.parseFromString(containerXml, 'application/xml');
  return doc.querySelector('rootfile')?.getAttribute('full-path') || DEFAULT_OPF;
}

function findCoverHref(doc: Document): string | null {
  const metaCover = doc.querySelector('meta[name="cover"]');
  if (metaCover) {
    const coverId = metaCover.getAttribute('content');
    if (coverId) {
      const item = doc.querySelector(`item[id="${coverId}"]`);
      return item?.getAttribute('href') || null;
    }
  }

  const itemCover = doc.querySelector('item[properties="cover-image"]');
  if (itemCover) {
    return itemCover.getAttribute('href') || null;
  }

  const fallback = doc.querySelector('item[id="cover"]') || doc.querySelector('item[id="cover-image"]');
  return fallback?.getAttribute('href') || null;
}

async function extractCoverBlob(
  entries: any[],
  opfPath: string,
  coverHref: string
): Promise<Uint8Array | null> {
  const decodedHref = decodeURIComponent(coverHref);
  const opfDir = opfPath.includes('/') 
    ? opfPath.substring(0, opfPath.lastIndexOf('/') + 1) 
    : '';
  let absoluteCoverPath = opfDir + decodedHref;

  absoluteCoverPath = normalizePath(absoluteCoverPath);

  const coverEntry = entries.find(e => e.filename === absoluteCoverPath);
  if (coverEntry && !coverEntry.directory) {
    return await coverEntry.getData(new Uint8ArrayWriter());
  }

  return null;
}

function normalizePath(path: string): string {
  const parts = path.split('/');
  const result: string[] = [];

  for (const part of parts) {
    if (part === '.') continue;
    if (part === '..') {
      result.pop();
    } else {
      result.push(part);
    }
  }

  return result.join('/');
}
