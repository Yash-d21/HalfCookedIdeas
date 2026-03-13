import express from 'express';
import { supabase, checkSupabaseConfig } from '../src/lib/supabase.js';
import crypto from 'crypto';
import dotenv from 'dotenv';

dotenv.config();

const app = express();

app.use(express.json());

// Helper to get IP hash
const getIpHash = (req: express.Request) => {
  const ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress || 'unknown';
  return crypto.createHash('sha256').update(ip.toString()).digest('hex');
};

// API Routes

// Get approved ideas
app.get('/api/ideas', async (req, res) => {
  try {
    const config = checkSupabaseConfig();
    if (!config.valid) {
      return res.status(503).json({ error: config.error });
    }

    const { sort = 'newest', limit = 9, offset = 0 } = req.query;
    
    let query = supabase
      .from('ideas')
      .select('*')
      .eq('status', 'approved')
      .range(Number(offset), Number(offset) + Number(limit) - 1);

    if (sort === 'popular') {
      query = query.order('votes_use', { ascending: false });
    } else if (sort === 'controversial') {
      query = query.order('created_at', { ascending: false });
    } else {
      query = query.order('created_at', { ascending: false });
    }

    const { data, error } = await query;
    
    if (error) {
      console.error('Supabase error fetching ideas:', error);
      return res.status(500).json({ error: error.message });
    }
    res.json(data || []);
  } catch (err) {
    console.error('Unexpected error fetching ideas:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Submit new idea
app.post('/api/ideas', async (req, res) => {
  try {
    const config = checkSupabaseConfig();
    if (!config.valid) {
      return res.status(503).json({ error: config.error });
    }

    const { title, description, email } = req.body;
    if (!title || !description || !email) {
      return res.status(400).json({ error: 'Missing fields' });
    }

    const { data, error } = await supabase
      .from('ideas')
      .insert([{ title, description, email }])
      .select();
    
    if (error) {
      console.error('Supabase error submitting idea:', error);
      return res.status(500).json({ error: error.message });
    }
    
    if (!data || data.length === 0) {
      return res.status(500).json({ error: 'Failed to create idea' });
    }

    res.json({ success: true, id: data[0].id });
  } catch (err) {
    console.error('Unexpected error submitting idea:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Vote on idea
app.post('/api/ideas/:id/vote', async (req, res) => {
  try {
    const config = checkSupabaseConfig();
    if (!config.valid) {
      return res.status(503).json({ error: config.error });
    }

    const { id } = req.params;
    const { type } = req.body; // 'use' or 'not_use'
    const ipHash = getIpHash(req);

    if (type !== 'use' && type !== 'not_use') {
      return res.status(400).json({ error: 'Invalid vote type' });
    }

    // Check for existing vote
    const { data: existing, error: checkError } = await supabase
      .from('votes')
      .select('id')
      .eq('idea_id', id)
      .eq('ip_hash', ipHash)
      .single();

    if (existing) {
      return res.status(403).json({ error: 'Already voted' });
    }

    // Insert vote
    const { error: voteError } = await supabase
      .from('votes')
      .insert([{ idea_id: id, vote_type: type, ip_hash: ipHash }]);

    if (voteError) {
      console.error('Supabase error recording vote:', voteError);
      return res.status(500).json({ error: voteError.message });
    }

    const column = type === 'use' ? 'votes_use' : 'votes_not_use';
    
    // Fetch current count
    const { data: idea, error: fetchError } = await supabase
      .from('ideas')
      .select(column)
      .eq('id', id)
      .single();

    if (fetchError) {
      console.error('Supabase error fetching idea for vote update:', fetchError);
      return res.status(500).json({ error: fetchError.message });
    }

    // Update count
    const { data: updatedIdea, error: updateError } = await supabase
      .from('ideas')
      .update({ [column]: (idea[column] || 0) + 1 })
      .eq('id', id)
      .select('votes_use, votes_not_use')
      .single();

    if (updateError) {
      console.error('Supabase error updating vote count:', updateError);
      return res.status(500).json({ error: updateError.message });
    }
    res.json(updatedIdea);
  } catch (err) {
    console.error('Unexpected error during voting:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Admin: Get pending ideas
app.get('/api/admin/ideas', async (req, res) => {
  const secret = req.headers['x-admin-secret'];
  const adminSecret = process.env.ADMIN_SECRET || 'half-cooked-admin-2026';
  
  if (secret !== adminSecret) {
    console.log('Admin login failed: Invalid secret');
    return res.status(401).json({ error: 'Unauthorized' });
  }

  const { data, error } = await supabase
    .from('ideas')
    .select('*')
    .eq('status', 'pending')
    .order('created_at', { ascending: false });

  if (error) return res.status(500).json({ error: error.message });
  res.json(data);
});

// Admin: Update status
app.patch('/api/admin/ideas/:id', async (req, res) => {
  const secret = req.headers['x-admin-secret'];
  const adminSecret = process.env.ADMIN_SECRET || 'half-cooked-admin-2026';
  const { id } = req.params;
  const { status } = req.body; // 'approved' or 'rejected'

  if (secret !== adminSecret) {
    console.log('Admin update failed: Invalid secret');
    return res.status(401).json({ error: 'Unauthorized' });
  }

  if (status !== 'approved' && status !== 'rejected') {
    return res.status(400).json({ error: 'Invalid status' });
  }

  const { error } = await supabase
    .from('ideas')
    .update({ status })
    .eq('id', id);

  if (error) return res.status(500).json({ error: error.message });
  res.json({ success: true });
});

export default app;
