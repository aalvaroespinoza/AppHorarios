import { readFile } from 'node:fs/promises';
import { join } from 'node:path';

export const runtime = 'nodejs';
export const size = { width: 180, height: 180 };
export const contentType = 'image/png';

export default async function AppleIcon() {
  const png = await readFile(join(process.cwd(), 'public/icons/apple-touch-icon.png'));
  return new Response(new Uint8Array(png), { headers: { 'Content-Type': contentType } });
}
