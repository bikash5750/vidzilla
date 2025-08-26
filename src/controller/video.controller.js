import { uploadtocloudinay } from "../utils/cloudinary.js";
import { video } from "../models/video.model.js";
import path from "path";

export const uploadVideo = async (req, res) => {
  try {
    const { title, description } = req.body;

    if (!title || !description) {
      return res.status(400).json({ msg: "title and description are required" });
    }

    const thumbnailFile = req.files?.thumbnail?.[0];
    const videoFile = req.files?.video?.[0];

    if (!thumbnailFile || !videoFile) {
      return res.status(400).json({ msg: "thumbnail and video files are required" });
    }

    // Validate file extensions
    const allowedImageExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.webp'];
    const allowedVideoExtensions = ['.mp4', '.avi', '.mov', '.wmv', '.flv', '.webm', '.mkv'];

    const thumbnailExt = path.extname(thumbnailFile.originalname).toLowerCase();
    const videoExt = path.extname(videoFile.originalname).toLowerCase();

    if (!allowedImageExtensions.includes(thumbnailExt)) {
      return res.status(400).json({ 
        msg: "Invalid thumbnail format. Allowed formats: " + allowedImageExtensions.join(', ') 
      });
    }

    if (!allowedVideoExtensions.includes(videoExt)) {
      return res.status(400).json({ 
        msg: "Invalid video format. Allowed formats: " + allowedVideoExtensions.join(', ') 
      });
    }

    const thumbnailUrl = await uploadtocloudinay(thumbnailFile.path, "image");
    const videoUrl = await uploadtocloudinay(videoFile.path, "video");

    if (!thumbnailUrl || !videoUrl) {
      return res.status(500).json({ msg: "Failed to upload files" });
    }

    const created = await video.create({
      videoThumbnail: thumbnailUrl,
      videoFile: videoUrl,
      videoOwner: req.user?._id,
      title,
      description,
    });

    return res.status(201).json({ msg: "Video uploaded", data: created });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ msg: "Internal server error" });
  }
};

export const getAllVideos = async (req, res) => {
  try {
    const page = parseInt(req.query.page || "1", 10);
    const limit = parseInt(req.query.limit || "12", 10);

    const pipeline = [
      { $match: { isPublished: true } },
      { $sort: { createdAt: -1 } },
    ];

    const results = await video.aggregatePaginate(pipeline, { page, limit });

    return res.status(200).json({ data: results });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ msg: "Internal server error" });
  }
};


