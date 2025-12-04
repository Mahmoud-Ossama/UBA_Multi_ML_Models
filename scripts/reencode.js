const path = require("path");
const { spawnSync } = require("child_process");
try {
  const ffmpegPath = require("ffmpeg-static");
  const cwd = process.cwd();
  const input = path.join(
    cwd,
    "public",
    "assets",
    "3163534-uhd_3840_2160_30fps.mp4"
  );
  const output = path.join(cwd, "public", "assets", "cyber-loop.mp4");
  console.log("Using ffmpeg binary at", ffmpegPath);
  const args = [
    "-y",
    "-i",
    input,
    "-t",
    "10",
    "-c:v",
    "libx264",
    "-preset",
    "veryfast",
    "-crf",
    "28",
    "-movflags",
    "+faststart",
    "-vf",
    "scale=1280:-2",
    "-c:a",
    "aac",
    "-b:a",
    "96k",
    output,
  ];
  console.log("Running ffmpeg with args:", args.join(" "));
  const res = spawnSync(ffmpegPath, args, { stdio: "inherit" });
  if (res.error) {
    console.error("ffmpeg failed:", res.error);
    process.exit(1);
  }
  if (res.status !== 0) {
    console.error("ffmpeg exited with code", res.status);
    process.exit(res.status);
  }
  console.log("Re-encode finished. Output written to", output);
} catch (e) {
  console.error("Error running re-encode script:", e.message);
  process.exit(1);
}
