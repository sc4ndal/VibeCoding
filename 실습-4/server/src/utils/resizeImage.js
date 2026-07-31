import sharp from 'sharp';

const MAX_DIMENSION = 1024;
const JPEG_QUALITY = 80;

export async function resizeForVision(buffer) {
  const resized = await sharp(buffer)
    .resize(MAX_DIMENSION, MAX_DIMENSION, { fit: 'inside', withoutEnlargement: true })
    .jpeg({ quality: JPEG_QUALITY })
    .toBuffer();

  return { buffer: resized, mimetype: 'image/jpeg' };
}
