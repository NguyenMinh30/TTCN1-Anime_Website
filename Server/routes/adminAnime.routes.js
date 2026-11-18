const express = require("express");
const router = express.Router();
const { protect } = require("../middleware/auth.middleware");
const isAdmin = require("../middleware/admin.middleware");
const controller = require("../controllers/adminAnime.controller");
const uploadVideo = require("../middleware/uploadVideo.middleware");

router.get("/", protect, isAdmin, controller.getAllAnime);
router.delete("/:id", protect, isAdmin, controller.deleteAnime);

router.post(
    "/",
    protect,
    isAdmin,
    uploadVideo.single("video"),
    controller.createAnime
);

module.exports = router;