import { Router } from 'express';
import { requireAuth } from '../middleware/requireAuth.js';
import { supabase } from '../services/supabaseClient.js';

const router = Router();
router.use(requireAuth);

router.get('/', async (req, res, next) => {
  try {
    let { data, error } = await supabase
      .from('profiles')
      .select('id, nickname, created_at')
      .eq('id', req.user.id)
      .maybeSingle();

    if (error) {
      const err = new Error('PROFILE_FETCH_FAILED', { cause: error });
      err.code = 'PROFILE_FETCH_FAILED';
      throw err;
    }

    if (!data) {
      const nickname = req.user.email?.split('@')[0] ?? '사용자';
      const { data: created, error: insertError } = await supabase
        .from('profiles')
        .insert({ id: req.user.id, nickname })
        .select('id, nickname, created_at')
        .single();

      if (insertError) {
        const err = new Error('PROFILE_FETCH_FAILED', { cause: insertError });
        err.code = 'PROFILE_FETCH_FAILED';
        throw err;
      }
      data = created;
    }

    res.json({ success: true, profile: data });
  } catch (err) {
    next(err);
  }
});

router.put('/', async (req, res, next) => {
  try {
    const { nickname } = req.body;
    if (typeof nickname !== 'string' || !nickname.trim()) {
      const err = new Error('INVALID_NICKNAME');
      err.code = 'INVALID_NICKNAME';
      throw err;
    }

    const { data, error } = await supabase
      .from('profiles')
      .update({ nickname: nickname.trim() })
      .eq('id', req.user.id)
      .select('id, nickname, created_at')
      .single();

    if (error) {
      const err = new Error('PROFILE_UPDATE_FAILED', { cause: error });
      err.code = 'PROFILE_UPDATE_FAILED';
      throw err;
    }

    res.json({ success: true, profile: data });
  } catch (err) {
    next(err);
  }
});

export default router;
