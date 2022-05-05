const { createCanvas, loadImage } = require("canvas");
const fs = require("fs");

const imageWidth = 512;
const colorWidth = 400;
const hexTextX = 430;
const offset = 50;

const createColorDataImage = (colors, outputPath) => {
  const height = offset * colors.length;
  const canvas = createCanvas(imageWidth, height);
  const ctx = canvas.getContext("2d");

  //background color
  ctx.fillStyle = "#FFFFFF";
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  for (let i = 0, startY = 0; i < colors.length; i++, startY += offset) {
    const color = colors[i];
    ctx.fillStyle = color.hex;
    ctx.fillRect(0, startY, colorWidth, offset);
    ctx.font = "14px Helvetica";
    ctx.fillText(color.hex, hexTextX, startY + 30);
  }

  const stream = canvas.createJPEGStream({
    quality: 0.95,
    chromaSubsampling: false,
  });

  const out = fs.createWriteStream(outputPath);
  stream.pipe(out);
};

module.exports = {
  createColorDataImage,
};
