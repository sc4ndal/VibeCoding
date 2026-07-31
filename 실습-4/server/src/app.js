import express from 'express';
import cors from 'cors';
import visionRouter from './routes/vision.js';
import recipeRouter from './routes/recipe.js';
import profileRouter from './routes/profile.js';
import savedRecipesRouter from './routes/savedRecipes.js';
import { errorHandler } from './middleware/errorHandler.js';

export function createApp() {
  const app = express();

  app.use(cors({ origin: process.env.CLIENT_ORIGIN || 'http://localhost:5173' }));
  app.use(express.json());

  app.get('/api/health', (req, res) => {
    res.json({ success: true, message: 'ok' });
  });

  app.use('/api/vision', visionRouter);
  app.use('/api/recipe', recipeRouter);
  app.use('/api/profile', profileRouter);
  app.use('/api/recipes', savedRecipesRouter);

  app.use(errorHandler);

  return app;
}
