/*
    Author: github.com/real-kijmoshi
    License: MIT   
*/

const { createCanvas } = require("canvas");
const fs = require("fs");

const baseSettings = {
  canvas: {
    width: 200,
    height: 100,
  },
  captcha: {
    length: 6,
    spacing: {
      min: 30,
      max: 40,
    },
  },
  colors: {
    background: "random",
    text: "random",
    noise: "random",
    strokes: ["random", "random", "random"],
  },
  text: {
    font: "bold 36px Arial",
    characters: "ABCDEFGHJKLMNPQRSTUVWXYZ23456789",
  },
  noise: {
    density: 0.3,
    curveCount: 10,
  },
  strokes: {
    count: 4,
    width: 2,
  },
};

function randomColor(baseColor = null) {
  if (baseColor === "random") {
    return `#${Math.floor(Math.random() * 16777215)
      .toString(16)
      .padStart(6, "0")}`;
  }
  return baseColor;
}

function ensureContrast(bgColor, fgColor) {
  const hexToRgb = (hex) => hex.match(/\w\w/g).map((x) => parseInt(x, 16));
  const [r1, g1, b1] = hexToRgb(bgColor);
  const [r2, g2, b2] = hexToRgb(fgColor);
  const brightness1 = (r1 * 299 + g1 * 587 + b1 * 114) / 1000;
  const brightness2 = (r2 * 299 + g2 * 587 + b2 * 114) / 1000;
  const diff = Math.abs(brightness1 - brightness2);

  if (diff < 128) {
    return `#${(0xffffff ^ parseInt(fgColor.slice(1), 16))
      .toString(16)
      .padStart(6, "0")}`;
  }
  return fgColor;
}

function randomText(length, characters) {
  return Array.from(
    { length },
    () => characters[Math.floor(Math.random() * characters.length)]
  ).join("");
}

function drawCurvedLine(ctx, startX, startY, endX, endY) {
  const controlX = (startX + endX) / 2;
  const controlY = Math.random() * baseSettings.canvas.height;

  ctx.beginPath();
  ctx.moveTo(startX, startY);
  ctx.quadraticCurveTo(controlX, controlY, endX, endY);
  ctx.stroke();
}

function generateCaptcha(settings) {
  settings = Object.assign({}, baseSettings, settings);
  settings.colors = Object.assign({}, baseSettings.colors, settings.colors);
  settings.text = Object.assign({}, baseSettings.text, settings.text);
  settings.noise = Object.assign({}, baseSettings.noise, settings.noise);
  settings.strokes = Object.assign({}, baseSettings.strokes, settings.strokes);
  settings.captcha = Object.assign({}, baseSettings.captcha, settings.captcha);
  settings.canvas = Object.assign({}, baseSettings.canvas, settings.canvas);

  const canvas = createCanvas(settings.canvas.width, settings.canvas.height);
  const ctx = canvas.getContext("2d");
  const captchaText = randomText(
    settings.captcha.length,
    settings.text.characters
  );

  const bgColor = randomColor(settings.colors.background);
  const noiseColor = randomColor(settings.colors.noise);
  const strokeColors = settings.colors.strokes.map((color) =>
    randomColor(color)
  );

  ctx.fillStyle = bgColor;
  ctx.fillRect(0, 0, settings.canvas.width, settings.canvas.height);

  ctx.fillStyle = noiseColor;
  for (
    let i = 0;
    i < settings.canvas.width * settings.canvas.height * settings.noise.density;
    i++
  ) {
    ctx.fillRect(
      Math.random() * settings.canvas.width,
      Math.random() * settings.canvas.height,
      2,
      2
    );
  }

  ctx.font = settings.text.font;
  ctx.textBaseline = "middle";

  let currentX = 10;
  const letterColors = [];

  captchaText.split("").forEach((char, index) => {
    const letterColor = randomColor(settings.colors.text);
    letterColors.push(letterColor);
    ctx.fillStyle = ensureContrast(bgColor, letterColor);

    const y = settings.canvas.height / 2 + (Math.random() - 0.5) * 15;
    const rotation = (Math.random() - 0.5) * 0.3;

    ctx.save();
    ctx.translate(currentX, y);
    ctx.rotate(rotation);
    ctx.fillText(char, 0, 0);
    ctx.restore();

    currentX +=
      Math.floor(
        Math.random() *
          (settings.captcha.spacing.max - settings.captcha.spacing.min + 1)
      ) + settings.captcha.spacing.min;
  });

  ctx.lineWidth = settings.strokes.width;
  for (let i = 0; i < settings.strokes.count; i++) {
    ctx.strokeStyle = strokeColors[i % strokeColors.length];
    drawCurvedLine(
      ctx,
      0,
      Math.random() * settings.canvas.height,
      settings.canvas.width,
      Math.random() * settings.canvas.height
    );
  }

  return {
    image: canvas.toDataURL(),
    text: captchaText,
  };
}

module.exports = {
  generate: generateCaptcha,
  png: (settings) => {
    const captcha = generateCaptcha(settings);
    const base64Data = captcha.image.replace(/^data:image\/png;base64,/, "");
    const buffer = Buffer.from(base64Data, "base64");
    fs.writeFileSync("captcha.png", buffer);
    return captcha.text;
  },
};
