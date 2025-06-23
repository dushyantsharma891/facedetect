const cluster = require("cluster");
const os = require("os");
const express = require("express");
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const tf = require("@tensorflow/tfjs-node");
const faceapi = require("@vladmandic/face-api");
const cocoSsd = require("@tensorflow-models/coco-ssd");
const canvas = require("canvas");

const numCPUs = os.cpus().length;
const PORT = 3000;


// if (cluster.isMaster) {
//   console.log(`🚀 Master ${process.pid} starting ${numCPUs} workers`);

//   for (let i = 0; i < numCPUs; i++) {
//     cluster.fork();
//   }

//   cluster.on("exit", (worker) => {
//     console.log(`💀 Worker ${worker.process.pid} died, restarting...`);
//     cluster.fork();
//   });
// } else {
  const app = express();

  // Middleware with increased limits
  app.use(express.json({ limit: '10000mb' }));
  app.use(express.urlencoded({ extended: true, limit: '10000mb' }));

  // Register canvas
  const { Canvas, Image, ImageData } = canvas;
  faceapi.env.monkeyPatch({ Canvas, Image, ImageData });

  // Paths
  const MODEL_PATH = path.join(__dirname, "models");
  const KNOWN_FACE_PATH = path.join(__dirname, "known_faces/1.jpeg");

  // Upload config
  const upload = multer({ dest: "uploads/" });

  // Load models once
  let faceModelLoaded = false;
  let objectModel = null;
  async function loadModelsOnce() {
    if (!faceModelLoaded) {
      await faceapi.nets.ssdMobilenetv1.loadFromDisk(MODEL_PATH);
      await faceapi.nets.faceRecognitionNet.loadFromDisk(MODEL_PATH);
      await faceapi.nets.faceLandmark68Net.loadFromDisk(MODEL_PATH);
      faceModelLoaded = true;
    }
    if (!objectModel) {
      objectModel = await cocoSsd.load();
    }
  }

  // Load image with canvas
  async function loadImage(filePath) {
    return await canvas.loadImage(filePath);
  }

  // Get face descriptor with error handling
  async function getDescriptor(imgPath) {
    try {
      const img = await loadImage(imgPath);
      const detection = await faceapi
        .detectSingleFace(img)
        .withFaceLandmarks()
        .withFaceDescriptor();
      return detection?.descriptor || null;
    } catch (error) {
      console.error("Face detection error:", error.message);
      return null;
    }
  }

  // Face matching
  async function matchFace(testPath) {
    const knownDesc = await getDescriptor(KNOWN_FACE_PATH);
    const testDesc = await getDescriptor(testPath);
    if (!knownDesc || !testDesc) return "❌ Face not detected";
    const distance = faceapi.euclideanDistance(knownDesc, testDesc);
    return distance < 0.5 ? "✅ Face Matched" : "❌ Face Not Matched";
  }

  // Simple working object detection
  async function detectObjects(imageBuffer) {
    const decoded = tf.node.decodeImage(imageBuffer);
    const preds = await objectModel.detect(decoded);
    decoded.dispose();

    console.log(
      "All detected objects:",
      preds.map((p) => `${p.class}: ${(p.score * 100).toFixed(1)}%`)
    );

    // Enhanced device detection with very low thresholds
    const devices = [
      ...preds
        .filter((p) => p.class === "cell phone" && p.score > 0.1)
        .map((p) => `📱 ${p.class} (${(p.score * 100).toFixed(1)}%)`),
      ...preds
        .filter((p) => p.class === "camera" && p.score > 0.1)
        .map((p) => `📷 ${p.class} (${(p.score * 100).toFixed(1)}%)`),
      ...preds
        .filter((p) => p.class === "laptop" && p.score > 0.2)
        .map((p) => `💻 ${p.class} (${(p.score * 100).toFixed(1)}%)`),
      ...preds
        .filter((p) => p.class === "tv" && p.score > 0.25)
        .map((p) => `📺 ${p.class} (${(p.score * 100).toFixed(1)}%)`),
      ...preds
        .filter((p) => p.class === "remote" && p.score > 0.15)
        .map((p) => `🎮 ${p.class} (${(p.score * 100).toFixed(1)}%)`),
      ...preds
        .filter((p) => p.class === "keyboard" && p.score > 0.2)
        .map((p) => `⌨️ ${p.class} (${(p.score * 100).toFixed(1)}%)`),
      ...preds
        .filter((p) => p.class === "mouse" && p.score > 0.2)
        .map((p) => `🖱️ ${p.class} (${(p.score * 100).toFixed(1)}%)`),
    ];

    const peopleCount = preds.filter(
      (p) => p.class === "person" && p.score > 0.3
    ).length;
    const results = [];

    if (peopleCount > 0) results.push(`👥 ${peopleCount} person(s)`);
    results.push(...devices);

    // Add other high-confidence objects
    const others = preds.filter(
      (p) =>
        ![
          "person",
          "cell phone",
          "camera",
          "laptop",
          "tv",
          "remote",
          "keyboard",
          "mouse",
        ].includes(p.class) && p.score > 0.5
    );
    others.forEach((obj) =>
      results.push(`${obj.class} (${(obj.score * 100).toFixed(1)}%)`)
    );

    return results;
  }

  // Helper: Process base64 image
  function processBase64Image(base64Data) {
    const base64 = base64Data.replace(/^data:image\/[a-z]+;base64,/, "");
    return Buffer.from(base64, "base64");
  }

  // Helper: Get face descriptor from buffer with validation
  async function getDescriptorFromBuffer(imageBuffer) {
    let decoded;
    try {
      decoded = tf.node.decodeImage(imageBuffer);

      // Validate image dimensions
      if (decoded.shape[0] < 10 || decoded.shape[1] < 10) {
        decoded.dispose();
        return null;
      }

      const detection = await faceapi
        .detectSingleFace(decoded)
        .withFaceLandmarks()
        .withFaceDescriptor();

      decoded.dispose();
      return detection?.descriptor || null;
    } catch (error) {
      console.error("Face detection error:", error.message);
      if (decoded) decoded.dispose();
      return null;
    }
  }

  // Helper: Get face descriptor from URL with validation
  async function getDescriptorFromURL(imageUrl) {
    try {
      const response = await fetch(imageUrl);
      if (!response.ok) {
        console.error(`HTTP error! status: ${response.status}`);
        return null;
      }

      const arrayBuffer = await response.arrayBuffer();
      if (arrayBuffer.byteLength < 100) {
        console.error("Image too small or corrupted");
        return null;
      }

      const imageBuffer = Buffer.from(arrayBuffer);
      return await getDescriptorFromBuffer(imageBuffer);
    } catch (error) {
      console.error("Error fetching image from URL:", error.message);
      return null;
    }
  }
  app.get("/working", async (req, res) => {
    return res.status(400).json({ message: "Welcome" });
  });

  // API: POST /detect (file upload)
  app.post("/detect", upload.single("image"), async (req, res) => {
    try {
      await loadModelsOnce();
      const imageBuffer = fs.readFileSync(req.file.path);

      const faceResult = await matchFace(req.file.path);
      const objects = await detectObjects(imageBuffer);

      fs.unlinkSync(req.file.path);

      return res.json({
        face: faceResult,
        objects: objects.length ? objects : ["None Detected"],
      });
    } catch (err) {
      console.error(err);
      return res.status(500).json({ error: "Detection failed" });
    }
  });

  // API: POST /detect-base64 (base64 images)
  app.post("/detect-base64", async (req, res) => {
    console.log("🚀 ~ app.post ~ req.body:", req.body);
    try {
      await loadModelsOnce();
      const { image, userImage } = req.body;
      if (!image) return res.status(400).json({ error: "No image provided" });

      const imageBuffer = processBase64Image(image);
      const knownImageUrl = userImage;

      const knownDesc = await getDescriptorFromURL(knownImageUrl);
      const testDesc = await getDescriptorFromBuffer(imageBuffer);

      let faceResult = false;
      if (knownDesc && testDesc) {
        try {
          const distance = faceapi.euclideanDistance(knownDesc, testDesc);
          faceResult = distance < 0.5;
        } catch (error) {
          console.error("Face comparison error:", error.message);
          faceResult = false;
        }
      }

      const objects = await detectObjects(imageBuffer);
      let obj = {
        face: faceResult,
        objects: objects.length ? objects : ["None Detected"],
      };
      console.log("🚀 ~ app.post ~ obj:", obj);
      return res.json({
        face: faceResult,
        objects: objects.length ? objects : ["None Detected"],
      });
    } catch (err) {
      console.error(err);
      return res.status(500).json({ error: "Detection failed" });
    }
  });

  // Start server
  app.listen(PORT, () => {
    console.log(`⚡ Worker ${process.pid} running on port ${PORT}`);
  });
// }
