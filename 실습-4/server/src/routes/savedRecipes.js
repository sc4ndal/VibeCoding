import { Router } from 'express';
import { requireAuth } from '../middleware/requireAuth.js';
import { supabase } from '../services/supabaseClient.js';

const router = Router();
router.use(requireAuth);

router.post('/', async (req, res, next) => {
  try {
    const { title, usedIngredients, extraIngredients, steps, estimatedTimeMinutes, difficulty, sourceImageUrl } = req.body;

    if (typeof title !== 'string' || !title.trim() || !Array.isArray(steps) || steps.length === 0) {
      const err = new Error('INVALID_RECIPE');
      err.code = 'INVALID_RECIPE';
      throw err;
    }

    const { data, error } = await supabase
      .from('saved_recipes')
      .insert({
        user_id: req.user.id,
        title: title.trim(),
        used_ingredients: usedIngredients ?? [],
        extra_ingredients: extraIngredients ?? [],
        steps,
        estimated_time_minutes: estimatedTimeMinutes ?? null,
        difficulty: Number.isFinite(difficulty) ? Math.min(5, Math.max(1, Math.round(difficulty))) : null,
        source_image_url: sourceImageUrl ?? null,
      })
      .select()
      .single();

    if (error) {
      const err = new Error('RECIPE_SAVE_FAILED', { cause: error });
      err.code = 'RECIPE_SAVE_FAILED';
      throw err;
    }

    res.json({ success: true, recipe: data });
  } catch (err) {
    next(err);
  }
});

router.get('/', async (req, res, next) => {
  try {
    const { data, error } = await supabase
      .from('saved_recipes')
      .select()
      .eq('user_id', req.user.id)
      .order('created_at', { ascending: false });

    if (error) {
      const err = new Error('RECIPE_LIST_FAILED', { cause: error });
      err.code = 'RECIPE_LIST_FAILED';
      throw err;
    }

    res.json({ success: true, recipes: data });
  } catch (err) {
    next(err);
  }
});

router.get('/:id', async (req, res, next) => {
  try {
    const { data, error } = await supabase
      .from('saved_recipes')
      .select()
      .eq('id', req.params.id)
      .eq('user_id', req.user.id)
      .maybeSingle();

    if (error) {
      const err = new Error('RECIPE_FETCH_FAILED', { cause: error });
      err.code = 'RECIPE_FETCH_FAILED';
      throw err;
    }
    if (!data) {
      const err = new Error('RECIPE_NOT_FOUND');
      err.code = 'RECIPE_NOT_FOUND';
      throw err;
    }

    res.json({ success: true, recipe: data });
  } catch (err) {
    next(err);
  }
});

router.delete('/:id', async (req, res, next) => {
  try {
    const { data, error } = await supabase
      .from('saved_recipes')
      .delete()
      .eq('id', req.params.id)
      .eq('user_id', req.user.id)
      .select();

    if (error) {
      const err = new Error('RECIPE_DELETE_FAILED', { cause: error });
      err.code = 'RECIPE_DELETE_FAILED';
      throw err;
    }
    if (!data || data.length === 0) {
      const err = new Error('RECIPE_NOT_FOUND');
      err.code = 'RECIPE_NOT_FOUND';
      throw err;
    }

    res.json({ success: true });
  } catch (err) {
    next(err);
  }
});

export default router;
