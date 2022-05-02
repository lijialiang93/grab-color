#!/usr/bin/env node
const util = require("util");
const sharp = require("sharp");
const kmeans = require("node-kmeans");
const commander = require("commander");
const chalk = require("chalk");
const clusterize = util.promisify(kmeans.clusterize);

const MAX_COLORS = 10;
const DEFAULT_COLORS = 3;
const MAX_HEIGHT = 512;

const getVectors = async (path) => {
  const image = sharp(path);
  const { height, width } = await image.metadata();
  let rHeight = height;
  let rWidth = width;

  if (height > MAX_HEIGHT) {
    rHeight = MAX_HEIGHT;
    rWidth = parseInt(width / (height / MAX_HEIGHT));
  }

  const { data } = await sharp(path)
    .resize(rHeight, rWidth)
    .raw()
    .toBuffer({ resolveWithObject: true });

  const pixelArray = new Uint8ClampedArray(data.buffer);

  const offset = 3;
  const vectors = new Array();

  for (let i = 0; i < pixelArray.length; i += offset) {
    vectors.push([pixelArray[i], pixelArray[i + 1], pixelArray[i + 2]]);
  }

  return vectors;
};

const applyKmeans = async (vectors, k) => {
  const colors = [];
  const res = await clusterize(vectors, { k });
  for (const point of res) {
    const [r, g, b] = point.centroid;
    const hex = RGBToHex(Math.floor(r), Math.floor(g), Math.floor(b));
    const percentage = (point.cluster.length / vectors.length).toFixed(4);
    colors.push({ hex, percentage });
  }

  return colors;
};

const RGBToHex = (r, g, b) => {
  r = r.toString(16).toUpperCase();
  g = g.toString(16).toUpperCase();
  b = b.toString(16).toUpperCase();

  if (r.length == 1) r = "0" + r;
  if (g.length == 1) g = "0" + g;
  if (b.length == 1) b = "0" + b;

  return "#" + r + g + b;
};

const printColor = (colors) => {
  for (const color of colors) {
    const chalkColor = chalk.bgHex(color.hex).hidden("        ");
    const chalkHex = chalk.hex(color.hex).visible(color.hex);
    const chalkPercent = chalk
      .hex(color.hex)
      .visible((color.percentage * 100).toFixed(2).toString().concat("%"));
    console.log(`${chalkColor}   ${chalkHex}   ${chalkPercent}`);
  }
};

const commandInit = () => {
  const { program } = commander;
  program
    .name("ext-color")
    .description("CLI to get dominant colors out of an image")
    .version("1.0.0")
    .requiredOption("-p --path <path>", "image path")
    .option(
      "-c --color <color>",
      `the number of colors to extract from image, range = [1,${MAX_COLORS}]`,
      (value, _) => {
        const parsedValue = parseInt(value, 10);
        if (isNaN(parsedValue)) {
          throw new commander.InvalidArgumentError("c is not a number");
        }
        if (parsedValue > MAX_COLORS || parsedValue <= 0) {
          throw new commander.InvalidArgumentError(`range of c is [1,${MAX_COLORS}]`);
        }
        return parsedValue;
      },
      DEFAULT_COLORS
    )
    .parse(process.argv);

  return program;
};

const app = async () => {
  let colors = [];

  const { program } = commandInit();
  const { path, color: colorNum } = program.opts();

  const vector = await getVectors(path);
  if (vector && vector.length > 0) {
    colors = await applyKmeans(vector, colorNum);
  }

  if (colors.length > 0) {
    colors.sort((a, b) => {
      return b.percentage - a.percentage;
    });
    printColor(colors);
  }
};

app();
