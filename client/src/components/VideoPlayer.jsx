import React from "react";
// Import thư viện Mux Player để hỗ trợ phát video từ Mux
import "@mux/mux-player";

/*
  API_URL là địa chỉ backend gốc.
  Ví dụ video local được backend phục vụ ở cổng 5000:
  app.use("/video", express.static(videoFolder))

  Nên nếu database lưu videoUrl là:
  /video/1779561019585-video_vay_cuoi.mp4

  Frontend sẽ ghép thành link đầy đủ:
  http://localhost:5000/video/1779561019585-video_vay_cuoi.mp4
*/
const API_URL = "http://localhost:5000";

/**
 * Hàm hỗ trợ xử lý URL hoàn chỉnh:
 * - Link tuyệt đối (http:// hoặc https://): Giữ nguyên (dành cho Archive.org, CDN)
 * - Link ảnh trong public của React (/images/): Giữ nguyên
 * - Link tương đối từ backend (/video/...): Ghép thêm API_URL (http://localhost:5000)
 */
const getFullUrl = (url) => {
    if (!url) return "";

    // Link online bên ngoài -> giữ nguyên
    if (url.startsWith("http://") || url.startsWith("https://")) {
        return url;
    }

    // Ảnh trong thư mục public React -> giữ nguyên
    if (url.startsWith("/images/")) {
        return url;
    }

    // Đường dẫn video local lưu ở backend -> ghép thêm domain backend
    return `${API_URL}${url}`;
};

/**
 * Hàm lấy dữ liệu của tập phim hiện tại.
 * - Nếu animeData có mảng 'episodes', tìm đúng tập theo 'episodeNumber'.
 * - Nếu không có mảng tập lẻ, lấy trực tiếp thông tin từ animeData gốc.
 */
const getEpisodeSource = (animeData, episodeNumber) => {
    const episodes = Array.isArray(animeData?.episodes) ? animeData.episodes : [];

    const currentEpisode = episodes.find((item) => {
        const number = item.episodeNumber ?? item.ep ?? item.number;
        return Number(number) === Number(episodeNumber);
    });

    return currentEpisode || animeData || {};
};

/**
 * Gom các thông tin liên quan đến video từ tập phim hoặc anime gốc:
 * - provider: loại nguồn phát (local, mux, archive)
 * - muxPlaybackId: mã Playback ID nếu dùng Mux
 * - videoUrl: đường dẫn video (dành cho Archive.org hoặc Local)
 * - posterUrl: ảnh bìa hiển thị trước khi phát video
 */
const getVideoSource = (animeData, episodeNumber) => {
    const source = getEpisodeSource(animeData, episodeNumber);

    return {
        provider:
            source.videoProvider ||
            source.provider ||
            animeData?.videoProvider ||
            animeData?.provider ||
            "local",

        muxPlaybackId:
            source.muxPlaybackId ||
            animeData?.muxPlaybackId ||
            "",

        videoUrl:
            source.videoUrl ||
            animeData?.videoUrl ||
            "",

        posterUrl:
            source.posterUrl ||
            source.thumbnail ||
            source.image ||
            animeData?.posterUrl ||
            animeData?.thumbnail ||
            animeData?.image ||
            "/images/default_placeholder.jpg",
    };
};

function VideoPlayer({ animeData, episodeNumber, autoPlay = true }) {
    const { provider, muxPlaybackId, videoUrl, posterUrl } = getVideoSource(
        animeData,
        episodeNumber
    );

    /*
      Chuyển provider về chữ thường để tránh lỗi viết hoa/thường:
      "Local", "LOCAL", "Mux", "MUX", "Archive" đều được chuyển thành dạng chuẩn.
    */
    const normalizedProvider = String(provider || "").toLowerCase();

    /*
      ==================================================================
      TRƯỜNG HỢP 1: Nếu provider là "mux" VÀ có mã muxPlaybackId
      -> Sử dụng trình phát Web Component <mux-player> của Mux.
      ==================================================================
    */
    if (normalizedProvider === "mux" && muxPlaybackId) {
        return (
            <mux-player
                playbackId={muxPlaybackId}
                metadataVideoTitle={animeData?.title || "Anime video"}
                poster={getFullUrl(posterUrl)}
                streamType="on-demand"
                autoPlay={autoPlay ? "muted" : false}
                controls
                style={{
                    width: "100%",
                    height: "100%",
                    backgroundColor: "black",
                }}
            />
        );
    }

    /*
      ==================================================================
      TRƯỜNG HỢP 2: Nếu có đường dẫn videoUrl (Archive.org hoặc Local)
      ==================================================================
    */
    const finalVideoUrl = getFullUrl(videoUrl);
    const finalPosterUrl = getFullUrl(posterUrl);

    if (finalVideoUrl) {
        /**
         * 2a. Nếu là link Embed iframe của Archive.org (ví dụ: https://archive.org/embed/...)
         * -> Nhúng trình phát bằng thẻ <iframe>
         */
        if (finalVideoUrl.includes("archive.org/embed/")) {
            return (
                <iframe
                    src={`${finalVideoUrl}${autoPlay ? "?autoplay=1" : ""}`}
                    className="w-full h-full border-0"
                    allowFullScreen
                    title={animeData?.title || "Archive Video Player"}
                />
            );
        }

        /**
         * 2b. Nếu là link trực tiếp MP4 từ Archive.org hoặc file video Local từ backend
         * -> Sử dụng trình phát HTML5 chuẩn (<video>)
         */
        return (
            <video
                className="w-full h-full bg-black"
                controls
                autoPlay={autoPlay}
                poster={finalPosterUrl}
                playsInline
                preload="metadata"
            >
                <source src={finalVideoUrl} />
                Trình duyệt của bạn không hỗ trợ phát video HTML5.
            </video>
        );
    }

    /*
      ==================================================================
      TRƯỜNG HỢP 3: Khi chưa nhập thông tin nguồn video nào
      ==================================================================
    */
    return (
        <div className="w-full h-full flex flex-col items-center justify-center gap-2 text-gray-500 bg-black px-4 text-center">
            <p>Chưa cập nhật video.</p>
            <p className="text-sm text-gray-600">
                Hãy thêm Mux Playback ID hoặc Video URL (Archive.org / Local) trong trang quản trị.
            </p>
        </div>
    );
}

export default VideoPlayer;