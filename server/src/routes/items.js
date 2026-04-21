const express = require("express");
const crypto = require("crypto");
const { Item } = require("../models");
const { authenticate } = require("../middleware/auth");

const router = express.Router();
router.use(authenticate);

// GET /api/items
router.get("/", async (req, res) => {
  try {
    const items = await Item.findAll({
      where: { ownerUsername: req.user.username },
    });
    res.json(items);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to list items" });
  }
});

// GET /api/items/:id
router.get("/:id", async (req, res) => {
  try {
    const item = await Item.findOne({
      where: { id: req.params.id, ownerUsername: req.user.username },
    });
    if (!item) return res.status(404).json({ error: "Item not found" });
    res.json(item);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to get item" });
  }
});

// POST /api/items
router.post("/", async (req, res) => {
  const { name, category, color, icon, tags, notes, imageDataUrl } = req.body;
  if (!name || !category)
    return res.status(400).json({ error: "name and category are required" });

  try {
    const item = await Item.create({
      id: crypto.randomUUID(),
      ownerUsername: req.user.username,
      name,
      category,
      color: color || "black",
      icon: icon || null,
      tags: tags || [],
      notes: notes || null,
      imageDataUrl: imageDataUrl || null,
      addedAt: new Date(),
    });
    res.status(201).json(item);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to create item" });
  }
});

// PUT /api/items/:id
router.put("/:id", async (req, res) => {
  try {
    const item = await Item.findOne({
      where: { id: req.params.id, ownerUsername: req.user.username },
    });
    if (!item) return res.status(404).json({ error: "Item not found" });

    const allowed = [
      "name",
      "category",
      "color",
      "icon",
      "tags",
      "notes",
      "imageDataUrl",
    ];
    allowed.forEach((k) => {
      if (req.body[k] !== undefined) item[k] = req.body[k];
    });
    await item.save();
    res.json(item);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to update item" });
  }
});

// DELETE /api/items/:id
router.delete("/:id", async (req, res) => {
  try {
    const count = await Item.destroy({
      where: { id: req.params.id, ownerUsername: req.user.username },
    });
    if (!count) return res.status(404).json({ error: "Item not found" });
    res.json({ ok: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to delete item" });
  }
});

module.exports = router;
