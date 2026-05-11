import { Router } from 'express';
import supabase from '../lib/supabase.js';

const router = Router();

// POST /api/auth/upgrade — upgrade plan
router.post('/upgrade', async (req, res) => {
  const { businessId, plan } = req.body;

  if (!businessId || !plan) {
    return res.status(400).json({ error: 'businessId and plan are required' });
  }

  const validPlans = ['free', 'starter', 'business', 'pro'];
  if (!validPlans.includes(plan)) {
    return res.status(400).json({ error: `Invalid plan. Must be one of: ${validPlans.join(', ')}` });
  }

  try {
    const expiresAt = new Date();
    expiresAt.setMonth(expiresAt.getMonth() + 1);

    const { data, error } = await supabase
      .from('businesses')
      .update({
        plan,
        plan_expires_at: plan === 'free' ? null : expiresAt.toISOString(),
      })
      .eq('id', businessId)
      .select()
      .single();

    if (error) {
      return res.status(400).json({ error: error.message });
    }

    res.json({ success: true, business: data });
  } catch (err) {
    console.error('Plan upgrade error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// GET /api/auth/plan/:businessId — get current plan
router.get('/plan/:businessId', async (req, res) => {
  const { businessId } = req.params;

  try {
    const { data, error } = await supabase
      .from('businesses')
      .select('plan, plan_expires_at, trial_started')
      .eq('id', businessId)
      .single();

    if (error) {
      return res.status(400).json({ error: error.message });
    }

    res.json(data);
  } catch (err) {
    console.error('Plan fetch error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
