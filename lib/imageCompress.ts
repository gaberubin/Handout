// Client-side image compression so uploads stay small (storage is limited).
// Images: resized to max 1600px and recompressed until ≤ ~1 MB.
// Videos: max 1 per listing, ≤ 20 MB. Max 10 files total.

const MAX_FILES = 10;
const MAX_IMAGE_BYTES = 1 * 1024 * 1024;   // 1 MB after compression
const MAX_ORIGINAL_BYTES = 8 * 1024 * 1024; // reject absurdly large originals
const MAX_VIDEO_BYTES = 20 * 1024 * 1024;
const MAX_DIM = 1600;

function compressImage(file: File): Promise<File> {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      URL.revokeObjectURL(url);
      let { width, height } = img;
      if (width > MAX_DIM || height > MAX_DIM) {
        const s = Math.min(MAX_DIM / width, MAX_DIM / height);
        width = Math.round(width * s); height = Math.round(height * s);
      }
      const canvas = document.createElement('canvas');
      canvas.width = width; canvas.height = height;
      const ctx = canvas.getContext('2d');
      if (!ctx) { resolve(file); return; }
      ctx.drawImage(img, 0, 0, width, height);
      const tryQ = (q: number) => {
        canvas.toBlob((blob) => {
          if (!blob) { resolve(file); return; }
          if (blob.size <= MAX_IMAGE_BYTES || q <= 0.4) {
            resolve(new File([blob], file.name.replace(/\.\w+$/, '') + '.jpg', { type: 'image/jpeg' }));
          } else tryQ(q - 0.12);
        }, 'image/jpeg', q);
      };
      tryQ(0.82);
    };
    img.onerror = () => { URL.revokeObjectURL(url); reject(new Error('Could not read ' + file.name)); };
    img.src = url;
  });
}

export async function processPickedFiles(list: FileList | null): Promise<{ files: File[]; error?: string }> {
  const picked = Array.from(list || []);
  if (picked.length === 0) return { files: [] };
  const out: File[] = [];
  const problems: string[] = [];
  let videoCount = 0;

  for (const f of picked) {
    if (out.length >= MAX_FILES) { problems.push(`Only the first ${MAX_FILES} files were kept.`); break; }
    if (f.type.startsWith('video/')) {
      if (videoCount >= 1) { problems.push(`${f.name}: only 1 video per listing.`); continue; }
      if (f.size > MAX_VIDEO_BYTES) { problems.push(`${f.name}: video too big (max 20 MB).`); continue; }
      videoCount++; out.push(f); continue;
    }
    if (!f.type.startsWith('image/')) { problems.push(`${f.name}: not a photo or video.`); continue; }
    if (f.size > MAX_ORIGINAL_BYTES) { problems.push(`${f.name}: photo too big (max 8 MB).`); continue; }
    try { out.push(f.size <= 300 * 1024 ? f : await compressImage(f)); }
    catch { problems.push(`${f.name}: could not be processed.`); }
  }
  return { files: out, error: problems.length ? problems.join('\n') : undefined };
}
