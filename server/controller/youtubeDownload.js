const fs = require("fs");
const youtubedl = require("youtube-dl");
const path = require("path");
const progress = require("progress-stream");
const desktopPath = `${process.env["HOME"]}/Desktop/`;
const videoFolder = path.join(desktopPath, `/videos`);
const youtubeBaseUrl = "https://www.youtube.com/watch?v";
const ytdl = require("ytdl-core");
const { info } = require("console");

exports.getAvailableFormats = async (req, res) => {
  const url = req.body.link;
  const quality = req.body.quality;
  const id = url.split("v=")[1];
  let info = await ytdl.getInfo(id);

  let formatHash = {};

  info.formats.forEach((element) => {
    if (element && element.hasVideo && element.quality && element.container == "mp4") {
      formatHash[element.quality] = {
        qualityLabel: element.qualityLabel,
        quality: element.quality,
        container: element.container,
        itag: element.itag
      }
    }
  });

  let availableFormats = Object.values(formatHash);


  // let format = availableFormats.filter(
  //   (ele) => (ele != null && ele != undefined)
  // );

  // let array = format.map((ele) => {
  //   if (ele.container == "mp4") {
  //     return ele;
  //   }
  // });
  // format = array.filter((format, i, a) => a.findIndex((data) => data.container === i));
  return res.json({ availableFormats });
};

exports.downloads = (req, res) => {
  let io = req.app.get("socketio");

  let str = progress({
    time: 100,
    length: "",
  });

  const url = req.body.link;
  const quality = req.body.quality;
  const id = url.split("v=")[1];

  // const formatsPixels = { '2160': '401', '1440': '400', '1080': '137', '720': '136', '480': '135', '360': '18', '240':'133' };

  if (!fs.existsSync(videoFolder)) {
    console.log(`creating video folder to ${desktopPath}`);
    fs.mkdirSync(videoFolder);
  }

  const output = path.join(desktopPath, `${id}-${quality.qualityLabel || "auto"}.mp4`);

  const videos = () => {
    let prevPercentage = "";

    const video = youtubedl(
      `${youtubeBaseUrl}=${id}`,
      [`--format=${quality.itag}`],
      // ['--merge-output-format= -f 18'],
      // Additional options can be given for calling `child_process.execFile()`.
      { cwd: __dirname }
    );
    console.log('video', video);
    video
      .on("info", function ({ size }) {
        str.length = size;
        console.log("video file size", size);
      })
      .on("error", function (e) {
        console.log("here writable");
      });

    str
      .on("progress", function (progress) {
        let percentage = Math.round((progress.transferred / str.length) * 100);
        if (!(percentage == prevPercentage) && percentage) {
          console.log("download percentage", `${percentage}%`);

          io.emit("posts", { percentage, size: str.length });
          prevPercentage = percentage;
        }
      })
      .on("error", function (e) {
        console.log("here writable");
      });

    video
      .pipe(str)
      .on("error", function (e) {
        console.log("here writable");
        // handleError(e)
        return res.json({ messgae: "error in loading" });
      })
      .pipe(fs.createWriteStream(output))
      .on("error", function (e) {
        console.log("here readable");
        // handleError(e)
      });

    video
      .on("end", function () {
        return res.json({
          message: `Successfully Downloaded  ${id}-${
            quality.qualityLabel || "auto"
            }.mp4 to path ${desktopPath}`,
        });
      })
      .on("error", function (e) {
        console.log("here readable");
      });
  };

  if (fs.existsSync(output)) {
    downloaded = fs.statSync(output).size;
    console.log(output, downloaded);
    return res.json({ error: "File Already Exists" });
  } else {
    videos();
  }
};

// 1080p video file size 45714552  45.714552 MB
// 720p video file size 19475896   19.475896 MB
// 480p video file size 14656416   14.656416 MB
// 360p video file size 8382849    8.382849  MB
// 240p video file size 4276618    4.276618  MB
// 144p video file size 2245052    2.245052  MB
// 2160p video file size 6573485920