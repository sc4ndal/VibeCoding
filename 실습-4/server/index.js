import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.resolve(__dirname, '../.env') });

const { createApp } = await import('./src/app.js');
const { ensureBucket } = await import('./src/services/supabaseStorage.js');

const PORT = process.env.PORT || 4000;

async function main() {
  await ensureBucket();
  const app = createApp();
  app.listen(PORT, () => {
    console.log(`서버가 http://localhost:${PORT} 에서 실행 중입니다.`);
  });
}

main().catch((err) => {
  console.error('서버 시작 실패:', err);
  process.exit(1);
});
