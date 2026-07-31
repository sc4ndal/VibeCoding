import { supabase } from '../services/supabaseClient.js';

export async function requireAuth(req, res, next) {
  const authHeader = req.headers.authorization || '';
  const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : null;

  if (!token) {
    const err = new Error('UNAUTHORIZED');
    err.code = 'UNAUTHORIZED';
    return next(err);
  }

  const { data, error } = await supabase.auth.getUser(token);
  if (error || !data.user) {
    const err = new Error('UNAUTHORIZED');
    err.code = 'UNAUTHORIZED';
    return next(err);
  }

  req.user = data.user;
  next();
}
