import { copyFile, mkdir, readFile, stat } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import { join } from 'node:path';

const source = new URL('./entry.png', import.meta.url);
const outputDir = process.env.MAKEFUN_OUTPUT_DIR ?? './output';
await mkdir(outputDir, { recursive: true });
const destination = join(outputDir, 'entry.png');
await copyFile(source, destination);
const sourceSize = (await stat(source)).size;
const copySize = (await stat(destination)).size;
console.log(`Source: ${sourceSize} bytes`);
console.log(`Copy: ${copySize} bytes`);
if (sourceSize !== copySize) process.exitCode = 1;

const copiedBytes = await readFile(destination);
const pngSignature = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);
const jpegSignature = Buffer.from([0xff, 0xd8, 0xff]);
if (copiedBytes.subarray(0, 8).equals(pngSignature)) {
  console.log('format: png');
} else if (copiedBytes.subarray(0, 3).equals(jpegSignature)) {
  console.log('format: jpeg');
} else {
  console.error('format: unknown');
  process.exitCode = 1;
}
console.log(`sha256: ${createHash('sha256').update(copiedBytes).digest('hex')}`);
