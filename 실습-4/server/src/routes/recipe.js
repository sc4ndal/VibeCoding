import { Router } from 'express';
import { callRecipeModel } from '../services/openrouter.js';
import { parseRecipe } from '../utils/parseRecipe.js';

const router = Router();

router.post('/generate', async (req, res, next) => {
  try {
    const { ingredients } = req.body;

    if (!Array.isArray(ingredients) || ingredients.length === 0) {
      const err = new Error('NO_INGREDIENTS');
      err.code = 'NO_INGREDIENTS';
      throw err;
    }

    const rawText = await callRecipeModel(ingredients);
    const recipe = parseRecipe(rawText);

    if (!recipe) {
      return res.json({ success: true, recipe: null, rawText });
    }

    res.json({ success: true, recipe });
  } catch (err) {
    next(err);
  }
});

export default router;
