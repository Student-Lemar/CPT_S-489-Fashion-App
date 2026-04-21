const express = require("express");
const { Op } = require("sequelize");
const { Outfit, Profile } = require("../models");

const router = express.Router();

// GET /api/feed?q=
router.get("/", async (req, res) => {
  try {
    const q = req.query.q ? String(req.query.q).trim() : "";
    const where = { posted: true };
    if (q) {
      where[Op.or] = [
        { name: { [Op.like]: `%${q}%` } },
        { caption: { [Op.like]: `%${q}%` } },
      ];
    }
    const outfits = await Outfit.findAll({
      where,
      order: [["createdAt", "DESC"]],
      limit: 100,
    });

    const posts = await Promise.all(
      outfits.map(async (o) => {
        let displayName = o.ownerUsername;
        try {
          const prof = await Profile.findOne({
            where: { username: o.ownerUsername },
          });
          if (prof) displayName = prof.displayName;
        } catch {}
        return {
          id: o.id,
          title: o.name,
          creator: o.ownerUsername,
          creatorDisplayName: displayName,
          caption: o.caption || "",
          tags: o.tags || [],
          items: o.itemIcons || [],
          createdAt: o.createdAt,
        };
      }),
    );

    res.json(posts);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to load feed" });
  }
});

module.exports = router;
