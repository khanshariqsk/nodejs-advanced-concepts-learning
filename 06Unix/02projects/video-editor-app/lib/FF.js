const { spawn } = require("node:child_process");
const util = require("./util");

const makeThumbnail = (videoPath, thumbnailPath) => {
  return new Promise((resolve, reject) => {
    // Command to create a thumbnail at the 5-second mark of the video
    const ffmpegProcess = spawn("ffmpeg", [
      "-i",
      videoPath,
      "-ss",
      "5",
      "-vframes",
      "1",
      thumbnailPath,
    ]);

    // Handle errors if the command fails to spawn (e.g., ffmpeg not installed)
    ffmpegProcess.on("error", (err) => {
      reject(new Error(`Failed to start ffmpeg process: ${err.message}`));
    });

    // Handle the process completion
    ffmpegProcess.on("close", (code) => {
      if (code === 0) {
        resolve(); // Success
      } else {
        // Reject with an error if ffmpeg returns a non-zero exit code
        reject(
          new Error(
            `ffmpeg process exited with code ${code}. Thumbnail creation failed.`
          )
        );
      }
    });
  });
};

const getDimensions = (videoPath) => {
  return new Promise((resolve, reject) => {
    let outputData = "";

    // Command to get video dimensions as CSV
    const ffprobeProcess = spawn("ffprobe", [
      "-v",
      "error",
      "-select_streams",
      "v:0",
      "-show_entries",
      "stream=width,height",
      "-of",
      "csv=p=0",
      videoPath,
    ]);

    ffprobeProcess.stdout.on("data", (data) => {
      outputData += data.toString();
    });

    ffprobeProcess.on("error", (err) => {
      reject(new Error(`Failed to start ffprobe process: ${err.message}`));
    });

    ffprobeProcess.on("close", (code) => {
      if (code === 0) {
        try {
          // The output will be a single line: "width,height"
          const [width, height] = outputData.trim().split(",");
          if (width && height) {
            resolve({
              width: Number(width),
              height: Number(height),
            });
          } else {
            reject(
              new Error("Could not parse dimensions from ffprobe output.")
            );
          }
        } catch (e) {
          reject(new Error(`Failed to process ffprobe output: ${e.message}`));
        }
      } else {
        reject(
          new Error(
            `ffprobe process exited with code ${code}. Failed to get dimensions.`
          )
        );
      }
    });
  });
};

// Extract the audio for a video file
const extractAudio = (videoPath, audioPath) => {
  return new Promise((resolve, reject) => {
    // ffmpeg -i input-video.mov -vn -acodec aac output-audio.aac
    const ffmpegProcess = spawn("ffmpeg", [
      "-i",
      videoPath,
      "-vn", // Disable video stream
      "-c:a", // Use audio codec for the following argument
      "copy", // Copy the audio stream without re-encoding
      audioPath,
    ]);

    // Handle errors if the command fails to spawn
    ffmpegProcess.on("error", (err) => {
      reject(new Error(`Failed to start ffmpeg process: ${err.message}`));
    });

    ffmpegProcess.on("close", (code) => {
      if (code === 0) {
        resolve(); // Success
      } else {
        reject(
          new Error(
            `ffmpeg process exited with code ${code}. Audio extraction failed.`
          )
        );
      }
    });
  });
};

// Resize a video to a specified width and height
const resize = (originalPath, targetPath, width, height) => {
  return new Promise((resolve, reject) => {
    const ffmpegProcess = spawn("ffmpeg", [
      "-i",
      originalPath,
      "-vf",
      `scale=${width}:${height}`,
      "-c:a",
      "copy",
      "-threads",
      "2", // -threads 2 uses two cpu cores only
      "-y",// to override the existing file
      targetPath,
    ]);

    // Handle errors if the command fails to spawn
    ffmpegProcess.on("error", (err) => {
      reject(new Error(`Failed to start ffmpeg process: ${err.message}`));
    });

    ffmpegProcess.on("close", (code) => {
      if (code === 0) {
        resolve(); // Success
      } else {
        reject(
          new Error(
            `ffmpeg process exited with code ${code}. Video resize failed.`
          )
        );
      }
    });
  });
};

module.exports = {
  makeThumbnail,
  getDimensions,
  extractAudio,
  resize,
};
