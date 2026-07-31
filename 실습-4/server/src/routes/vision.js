import { Router } from 'express';
import { upload } from '../middleware/upload.js';
import { uploadFridgeImage } from '../services/supabaseStorage.js';
import { callVisionModel } from '../services/openrouter.js';
import { parseIngredients } from '../utils/parseIngredients.js';
import { resizeForVision } from '../utils/resizeImage.js';

const router = Router();

router.post('/analyze', upload.single('image'), async (req, res, next) => {
  try {
    if (!req.file) {
      const err = new Error('NO_FILE');
      err.code = 'NO_FILE';
      throw err;
    }

    const [imageUrl, rawText] = await Promise.all([
      uploadFridgeImage(req.file.buffer, req.file.mimetype),
      resizeForVision(req.file.buffer).then(({ buffer, mimetype }) =>
        callVisionModel(`data:${mimetype};base64,${buffer.toString('base64')}`)
      ),
    ]);
    const ingredients = parseIngredients(rawText);

    if (!ingredients) {
      return res.status(200).json({
        success: false,
        error: 'MODEL_RESPONSE_PARSE_FAILED',
        message: '재료 인식 결과를 해석하지 못했습니다. 다시 시도해주세요.',
      });
    }

    res.json({ success: true, ingredients, imageUrl });
  } catch (err) {
    next(err);
  }
});

export default router;
