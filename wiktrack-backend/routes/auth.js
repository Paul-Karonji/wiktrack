import { Router } from 'express';

const router = Router();

// WikTrack is a free app — no paid plans or subscription endpoints.
// This router is kept as a placeholder for any future auth-related routes.

router.get('/status', (req, res) => {
  res.json({ plan: 'free', message: 'WikTrack is free for all users.' });
});

export default router;
