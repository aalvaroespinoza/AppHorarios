import { readFile } from 'node:fs/promises';
import { join } from 'node:path';

export const runtime = 'nodejs';
export const size = { width: 512, height: 512 };
export const contentType = 'image/png';

export default async function Icon() {
  const png = await readFile(join(process.cwd(), 'public/icons/icon-512.png'));
  return new Response(new Uint8Array(png), { headers: { 'Content-Type': contentType } });
}
