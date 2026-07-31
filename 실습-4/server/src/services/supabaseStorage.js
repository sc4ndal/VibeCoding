import { randomUUID } from 'crypto';
import { supabase } from './supabaseClient.js';

const BUCKET = process.env.SUPABASE_STORAGE_BUCKET || 'fridge-images';

export async function ensureBucket() {
  const { data: buckets, error } = await supabase.storage.listBuckets();
  if (error) {
    console.error('버킷 목록 조회 실패:', error.message);
    return;
  }
  if (!buckets?.some((b) => b.name === BUCKET)) {
    const { error: createError } = await supabase.storage.createBucket(BUCKET, {
      public: true,
      fileSizeLimit: '5MB',
      allowedMimeTypes: ['image/jpeg', 'image/png'],
    });
    if (createError) {
      console.error('버킷 생성 실패:', createError.message);
    } else {
      console.log(`Supabase Storage 버킷 "${BUCKET}" 생성 완료`);
    }
  }
}

export async function uploadFridgeImage(buffer, mimetype) {
  const ext = mimetype === 'image/png' ? 'png' : 'jpg';
  const filePath = `anonymous/${randomUUID()}.${ext}`;

  const { error } = await supabase.storage.from(BUCKET).upload(filePath, buffer, {
    contentType: mimetype,
    upsert: false,
  });

  if (error) {
    const err = new Error('STORAGE_UPLOAD_FAILED: ' + error.message);
    err.code = 'STORAGE_UPLOAD_FAILED';
    throw err;
  }

  const { data } = supabase.storage.from(BUCKET).getPublicUrl(filePath);
  return data.publicUrl;
}
