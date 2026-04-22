const express = require("express");
const crypto = require("crypto");
const { Outfit, Item } = require("../models");
const { authenticate } = require("../middleware/auth");

const router = express.Router();
router.use(authenticate);

router.get("/", async (req, res) => {
  try {
    const outfits = await Outfit.findAll({
      where: { ownerUsername: req.user.username },
    });
    // Attach item images for each outfit
    const result = await Promise.all(
      outfits.map(async (o) => {
        const plain = o.toJSON();
        const itemIds = Array.isArray(plain.items) ? plain.items : [];
        const itemImages = await Promise.all(
          itemIds.map(async (id) => {
            const item = await Item.findByPk(id, {
              attributes: ["imageDataUrl"],
            });
            return item ? item.imageDataUrl || null : null;
          })
        );
        return { ...plain, itemImages };
      })
    );
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: "Failed to list outfits" });
  }
});

router.get("/:id", async (req, res) => {
  try {
    const outfit = await Outfit.findOne({
      where: { id: req.params.id, ownerUsername: req.user.username },
    });
    if (!outfit) return res.status(404).json({ error: "Outfit not found" });
    const plain = outfit.toJSON();
    const itemIds = Array.isArray(plain.items) ? plain.items : [];
    const itemImages = await Promise.all(
      itemIds.map(async (id) => {
        const item = await Item.findByPk(id, { attributes: ["imageDataUrl"] });
        return item ? item.imageDataUrl || null : null;
      })
    );
    res.json({ ...plain, itemImages });
  } catch (err) {
    res.status(500).json({ error: "Failed to get outfit" });
  }
});

router.post("/", async (req, res) => {
  const {
    name,
    title,
    occasion,
    itemIds,
    items,
    itemIcons,
    boardId,
    boardIds,
    posted,
    caption,
    tags,
  } = req.body;
  const outfitName = name || title;
  if (!outfitName) return res.status(400).json({ error: "name is required" });
  try {
    const outfit = await Outfit.create({
      id: crypto.randomUUID(),
      ownerUsername: req.user.username,
      name: outfitName,
      occasion: occasion || "Everyday",
      items: items || itemIds || [],
      itemIcons: itemIcons || [],
      boardIds: boardIds || (boardId ? [boardId] : []),
      posted: posted || false,
      caption: caption || "",
      tags: tags || [],
      createdAt: new Date(),
    });
    res.status(201).json(outfit);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to create outfit" });
  }
});

router.put("/:id", async (req, res) => {
  try {
    const outfit = await Outfit.findOne({
      where: { id: req.params.id, ownerUsername: req.user.username },
    });
    if (!outfit) return res.status(404).json({ error: "Outfit not found" });
    const allowed = [
      "name",
      "occasion",
      "items",
      "itemIcons",
      "boardIds",
      "posted",
      "caption",
      "tags",
    ];
    allowed.forEach((k) => {
      if (req.body[k] !== undefined) outfit[k] = req.body[k];
    });
    await outfit.save();
    res.json(outfit);
  } catch (err) {
    res.status(500).json({ error: "Failed to update outfit" });
  }
});

router.delete("/:id", async (req, res) => {
  try {
    const count = await Outfit.destroy({
      where: { id: req.params.id, ownerUsername: req.user.username },
    });
    if (!count) return res.status(404).json({ error: "Outfit not found" });
    res.json({ ok: true });
  } catch (err) {
    res.status(500).json({ error: "Failed to delete outfit" });
  }
});

module.exports = router;
