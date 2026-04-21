const express = require('express');
const crypto = require('crypto');
const { Board } = require('../models');
const { authenticate } = require('../middleware/auth');

const router = express.Router();
router.use(authenticate);

router.get('/', async (req, res) => {
  try {
    const boards = await Board.findAll({ where: { ownerUsername: req.user.username } });
    res.json(boards);
  } catch (err) { res.status(500).json({ error: 'Failed to list boards' }); }
});

router.get('/:id', async (req, res) => {
  try {
    const board = await Board.findOne({ where: { id: req.params.id, ownerUsername: req.user.username } });
    if (!board) return res.status(404).json({ error: 'Board not found' });
    res.json(board);
  } catch (err) { res.status(500).json({ error: 'Failed to get board' }); }
});

router.post('/', async (req, res) => {
  const { name, description, visibility, outfitIds } = req.body;
  if (!name) return res.status(400).json({ error: 'name is required' });
  // BR-06: only creators can create public boards
  const finalVisibility = (req.user.role === 'creator' && visibility === 'public') ? 'public' : 'private';
  try {
    const board = await Board.create({
      id: crypto.randomUUID(),
      ownerUsername: req.user.username,
      name,
      description: description || '',
      visibility: finalVisibility,
      outfitIds: outfitIds || [],
      createdAt: new Date(),
    });
    res.status(201).json(board);
  } catch (err) { console.error(err); res.status(500).json({ error: 'Failed to create board' }); }
});

router.put('/:id', async (req, res) => {
  try {
    const board = await Board.findOne({ where: { id: req.params.id, ownerUsername: req.user.username } });
    if (!board) return res.status(404).json({ error: 'Board not found' });
    const allowed = ['name', 'description', 'visibility', 'outfitIds'];
    allowed.forEach((k) => { if (req.body[k] !== undefined) board[k] = req.body[k]; });
    await board.save();
    res.json(board);
  } catch (err) { res.status(500).json({ error: 'Failed to update board' }); }
});

router.delete('/:id', async (req, res) => {
  try {
    const count = await Board.destroy({ where: { id: req.params.id, ownerUsername: req.user.username } });
    if (!count) return res.status(404).json({ error: 'Board not found' });
    res.json({ ok: true });
  } catch (err) { res.status(500).json({ error: 'Failed to delete board' }); }
});

module.exports = router;
