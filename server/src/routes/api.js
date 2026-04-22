const express = require("express");

const router = express.Router();

router.get("/health", (req, res) => {
  res.json({ ok: true });
});

router.use("/auth", require("./auth"));
router.use("/items", require("./items"));
router.use("/outfits", require("./outfits"));
router.use("/boards", require("./boards"));
router.use("/feed", require("./feed"));
router.use("/profiles", require("./profiles"));
router.use("/follows", require("./follows"));
router.use("/colors", require("./colors"));
router.use("/reports", require("./reports"));
router.use("/admin", require("./admin"));

module.exports = router;
