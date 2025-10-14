const fs = require("fs").promises;
const path = require("path");
const zlib = require("zlib");
const { performance } = require("perf_hooks");

const METHOD = "deflate"; // gzip, brotli, deflate

// Directories
const filesDir = path.join(__dirname, "files");
const compressedDir = path.join(__dirname, METHOD);

console.log(METHOD.toUpperCase());

// Create a folder to save compressed files into (delete it if already exists)
const ensureCompressedDir = async () => {
  try {
    // Check if compressed directory exists
    const compressedDirExists = await fs.stat(compressedDir);
    if (compressedDirExists.isDirectory()) {
      // If it exists, delete it along with its contents
      await fs.rm(compressedDir, { recursive: true });
      console.log(`Deleted existing ${METHOD} directory and its contents.`);
    }
  } catch (error) {
    // If compressed directory doesn't exist, ignore the error
    if (error.code !== "ENOENT") {
      console.error("Error checking compressed directory:", error);
    }
  }

  // Create the compressed directory
  try {
    await fs.mkdir(compressedDir);
    console.log(`Created ${METHOD} directory.`);
  } catch (error) {
    console.error("Error creating compressed directory:", error);
  }
};

// Function to compress a file
const compressFile = async (file) => {
  const filePath = path.join(filesDir, file);
  const compressedFilePath = path.join(
    compressedDir,
    path.basename(file, path.extname(file))
  );

  const startTime = performance.now(); // Start timing

  try {
    const readFile = await fs.open(filePath, "r");
    const writeFile = await fs.open(compressedFilePath, "w");

    const readStream = readFile.createReadStream();
    const writeStream = writeFile.createWriteStream();

    // Both for gzip and deflate
    const zOptions = {
      level: 6, // -1 to 9, default -1
      // windowBits: 15, // 8 to 15, default 15
    };

    // Just for brotli
    const brotliOptions = {
      [zlib.constants.BROTLI_PARAM_QUALITY]: 4, // 0 to 11, default 11
      // [zlib.constants.BROTLI_PARAM_LGWIN]: 22, // 10 to 24, default 22
      // [zlib.constants.BROTLI_PARAM_MODE]: zlib.constants.BROTLI_MODE_TEXT,
    };

    const compressor =
      METHOD === "gzip"
        ? zlib.createGzip(zOptions)
        : METHOD === "deflate"
        ? zlib.createDeflate(zOptions)
        : METHOD === "brotli"
        ? zlib.createBrotliCompress(brotliOptions)
        : null;

    if (!compressor) {
      throw new Error("Invalid compression method:", METHOD);
    }

    console.log("-------------------------------");
    console.log(`Compressing ${file}...`);

    await new Promise((resolve, reject) => {
      readStream
        .pipe(compressor)
        .pipe(writeStream)
        .on("finish", async (err) => {
          if (err) {
            reject(new Error(`Error compressing file: ${file} ${err}`));
          } else {
            const endTime = performance.now(); // End timing
            const elapsedTime = endTime - startTime; // Calculate elapsed time in milliseconds
            console.log(`File successfully compressed.`);
            console.log(
              `Compression time: ${elapsedTime.toFixed(0)} milliseconds`
            );

            const originalStats = await fs.stat(filePath);
            const originalSize = originalStats.size;

            const compressedStats = await fs.stat(compressedFilePath);
            const compressedSize = compressedStats.size;

            console.log(`Original size: ${originalSize} bytes`);
            console.log(`Compressed size: ${compressedSize} bytes`);
            console.log(
              `Compression ratio: ${(originalSize / compressedSize).toFixed(
                2
              )}x`
            );
            console.log("-------------------------------");

            resolve();
          }

          await readFile.close();
          await writeFile.close();
        });
    });
  } catch (error) {
    console.error(error);
  }
};

// Read files directory and compress each file
const compressFiles = async () => {
  try {
    await ensureCompressedDir();

    const files = await fs.readdir(filesDir);
    for (const file of files) {
      await compressFile(file);
    }
  } catch (error) {
    console.error("Error reading files directory:", error);
  }
};

// Start compression
compressFiles();
