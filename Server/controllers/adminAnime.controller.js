const Anime = require("../models/anime.model");

// Hàm hỗ trợ tự động lấy link ảnh từ link Archive.org
const getArchiveThumbnail = (videoUrl) => {
  if (!videoUrl || !videoUrl.includes("archive.org")) return "";
  const match = videoUrl.match(/archive\.org\/(?:download|embed|details)\/([^/]+)/);
  return match && match[1] ? `https://archive.org/services/img/${match[1]}` : "";
};

exports.getAllAnime = async (req, res) => {
  try {
    const animes = await Anime.find().sort({ createdAt: -1 });
    res.json(animes);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.deleteAnime = async (req, res) => {
  try {
    const deleted = await Anime.findByIdAndDelete(req.params.id);
    if (!deleted) {
      return res.status(404).json({ message: "Anime không tồn tại" });
    }
    res.json({ message: "Xóa anime thành công" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.createAnime = async (req, res) => {
  try {
    const body = req.body;

    const animeData = {
      title: body.title,
      otherTitle: body.otherTitle,
      summary: body.summary,
      status: body.status,
      epCount: body.epCount,
      releaseYear: body.releaseYear,
      posterUrl: body.posterUrl || "",
      url: body.url,

      category: body.category
        ? Array.isArray(body.category)
          ? body.category
          : body.category.split(",").map((item) => item.trim())
        : [],

      isPremium: body.isPremium === "true" || body.isPremium === true,
      videoProvider: body.videoProvider || "local",
      videoUrl: body.videoUrl || "",
      muxPlaybackId: body.muxPlaybackId || "",
      muxAssetId: body.muxAssetId || "",
    };

    if (req.file) {
      animeData.videoProvider = "local";
      animeData.videoUrl = `/video/${req.file.filename}`;
      animeData.muxPlaybackId = "";
      animeData.muxAssetId = "";
    } else if (body.videoProvider === "mux") {
      animeData.videoProvider = "mux";
      animeData.videoUrl = "";
      animeData.muxPlaybackId = body.muxPlaybackId || "";
      animeData.muxAssetId = body.muxAssetId || "";
    } else if (body.videoProvider === "archive") {
      animeData.videoProvider = "archive";
      animeData.videoUrl = body.videoUrl || "";
      animeData.muxPlaybackId = "";
      animeData.muxAssetId = "";

      // TỰ ĐỘNG LẤY ẢNH NẾU ADMIN KHÔNG NHẬP POSTER URL
      if (!animeData.posterUrl && animeData.videoUrl) {
        animeData.posterUrl = getArchiveThumbnail(animeData.videoUrl);
      }
    }

    const anime = new Anime(animeData);
    const saved = await anime.save();

    res.status(201).json(saved);
  } catch (err) {
    console.error(err);
    res.status(400).json({
      message: "Thêm anime thất bại",
      error: err.message,
    });
  }
};