const path = require("node:path");
const crypto = require("node:crypto");
const cluster = require("node:cluster");
const fs = require("node:fs/promises");
const { pipeline } = require("node:stream/promises");
const util = require("../../lib/util");
const FF = require("../../lib/FF");
const db = require("../DB");

let jobs;

if (cluster.isPrimary) {
  const JobQueue = require("../../lib/jobQueue");
  jobs = new JobQueue();
}

const FORMATS_SUPPORTED = ["mov", "mp4"];

const MIMETYPES = {
  mov: "video/quicktime",
  mp4: "video/mp4",
};

// Return the list of all the videos that a logged in user has uploaded
const getVideos = (req, res, handleErr) => {
  db.update();
  const videos = db.videos.filter((video) => {
    return video.userId === req.userId;
  });

  res.status(200).json(videos);
};

//Upload a video file
const uploadVideo = async (req, res, handleErr) => {
  const specifiedFileName = req.headers.filename;
  const extension = path.extname(specifiedFileName).substring(1).toLowerCase();
  const name = path.parse(specifiedFileName).name;
  const videoId = crypto.randomBytes(4).toString("hex");

  if (FORMATS_SUPPORTED.indexOf(extension) == -1) {
    return handleErr({
      status: 400,
      message: `Only these formats are allowed: ${FORMATS_SUPPORTED.join(",")}`,
    });
  }

  const videoStorageFolderPath = `./storage/${videoId}`;

  try {
    await fs.mkdir(videoStorageFolderPath);

    const videoFilePathToWrite = `${videoStorageFolderPath}/original.${extension}`;
    const thumbnailPath = `${videoStorageFolderPath}/thumbnail.jpg`;
    const file = await fs.open(videoFilePathToWrite, "w");
    const fileWriteStream = file.createWriteStream();

    await pipeline(req, fileWriteStream);

    // Make a thumbnail for the video file
    await FF.makeThumbnail(videoFilePathToWrite, thumbnailPath);

    // Get the dimensions
    const dimensions = await FF.getDimensions(videoFilePathToWrite);

    db.update();
    db.videos.unshift({
      id: db.videos.length + 1,
      videoId,
      name,
      extension,
      dimensions,
      userId: req.userId,
      extractedAudio: false,
      resizes: {},
    });
    db.save();

    res.status(201).json({
      status: "success",
      message: "The file was uploaded successfully!",
    });
  } catch (error) {
    await util.deleteFolder(videoStorageFolderPath);
    return handleErr(error);
  }
};

// Return the video assests
const getVideoAsset = async (req, res, handleErr) => {
  const videoId = req.params.get("videoId");
  const type = req.params.get("type");

  db.update();
  const video = db.videos.find((video) => video.videoId === videoId);

  if (!video) {
    return handleErr({
      status: 404,
      message: "Video not found!",
    });
  }

  let file, mimeType, filename;

  switch (type) {
    case "thumbnail":
      file = await fs.open(`./storage/${videoId}/thumbnail.jpg`, "r");
      mimeType = "image/jpeg";
      break;
    case "audio":
      file = await fs.open(`./storage/${videoId}/audio.aac`, "r");
      mimeType = "audio/aac";
      filename = `${video.name}-audio.aac`;
      break;
    case "resize":
      const dimensions = req.params.get("dimensions");
      file = await fs.open(
        `./storage/${videoId}/${dimensions}.${video.extension}`,
        "r"
      );
      mimeType = MIMETYPES[video.extension];
      filename = `${video.name}-${dimensions}.${video.extension}`;
      break;
    case "original":
      file = await fs.open(
        `./storage/${videoId}/original.${video.extension}`,
        "r"
      );
      mimeType = MIMETYPES[video.extension];
      filename = `${video.name}.${video.extension}`;
      break;
  }

  try {
    // Grab the file size
    const stat = await file.stat();

    const fileStream = file.createReadStream();

    if (type !== "thumbnail") {
      // Set the header to prompt for download
      res.setHeader("Content-Disposition", `attachment; filename=${filename}`);
    }

    // Set the Content-Type header based on the file type
    res.setHeader("Content-Type", mimeType);
    // Set the Content-Length to the size of the file
    res.setHeader("Content-Length", stat.size);

    res.status(200);

    await pipeline(fileStream, res);
    file.close();
  } catch (e) {
    console.log(e);
  }
};

// Extract the audio for a video file(can only be done once per video)
const extractVideo = async (req, res, handleErr) => {
  const videoId = req.params.get("videoId");

  db.update();
  const video = db.videos.find((video) => video.videoId === videoId);

  if (!video) {
    return handleErr({
      status: 404,
      message: "Video not found!",
    });
  }

  if (video.extractedAudio) {
    return handleErr({
      status: 400,
      message: "The audio has already been extracted for this video.",
    });
  }

  const originalVideoPath = `./storage/${videoId}/original.${video.extension}`;
  const targetAudioPath = `./storage/${videoId}/audio.aac`;

  try {
    await FF.extractAudio(originalVideoPath, targetAudioPath);

    video.extractedAudio = true;

    db.save();

    res.status(200).json({
      status: "success",
      message: "The audio was extracted successfully!",
    });
  } catch (error) {
    util.deleteFile(targetAudioPath);
    handleErr(error);
  }
};

//Resize a video file(creates a new video)
const resizeVideo = async (req, res, handleErr) => {
  const videoId = req.body.videoId;
  const width = Number(req.body.width);
  const height = Number(req.body.height);

  db.update();
  const video = db.videos.find((video) => video.videoId === videoId);

  if (!video) {
    return handleErr({
      status: 404,
      message: "Video not found!",
    });
  }

  if (video.resizes[`${width}x${height}`]?.processing) {
    return handleErr({
      status: 400,
      message: "The video is being processed!",
    });
  }

  video.resizes[`${width}x${height}`] = { processing: true };
  db.save();

  if (cluster.isPrimary) {
    jobs.enqueue({
      type: "resize",
      videoId: video.videoId,
      width,
      height,
    });
  } else {
    process.send({
      messageType: "new-resize",
      data: {
        videoId,
        width,
        height,
      },
    });
  }

  res.status(200).json({
    status: "success",
    message: "The video is now being processed!",
  });
};

const controller = {
  getVideos,
  uploadVideo,
  getVideoAsset,
  extractVideo,
  resizeVideo,
};

module.exports = controller;
