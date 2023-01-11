export {};
function selectElement(selector: string) {
  const element = document.querySelector(selector);
  if (!element) throw 'Element not found for ' + selector;
  return element;
}

const originalImg = selectElement('#img-original') as HTMLImageElement;
const afterImgContainer = selectElement('#after-container') as HTMLDivElement;
const SELECTED_COLOR = selectElement('#color-value') as HTMLInputElement;
const PRIMARY_COLOR_DISPLAY = selectElement('#main-color input') as HTMLInputElement;
const SECONDARY_COLOR_DISPLAY = selectElement('#secondary-color input') as HTMLInputElement;
const TERTIARY_COLOR_DISPLAY = selectElement('#tertiary-color input') as HTMLInputElement;
const REMOVE_COLOR_BUTTON = selectElement('#remove-selected-color-btn') as HTMLButtonElement;
const UPLOAD_IMAGE_INPUT = selectElement('#image-upload') as HTMLInputElement;

let WIDTH = originalImg.naturalWidth;
let HEIGHT = originalImg.naturalHeight;

const canvas = document.createElement('canvas');
const ctx = canvas.getContext('2d')!;
canvas.width = WIDTH;
canvas.height = HEIGHT;

ctx.drawImage(originalImg, 0, 0, WIDTH, HEIGHT);

let IMAGE_DATA = ctx.getImageData(0, 0, WIDTH, HEIGHT);
let PIXEL_DATA = IMAGE_DATA.data;

let count: any = {};
for (let i = 0; i < PIXEL_DATA.length; i += 4) {
  const rgba = [PIXEL_DATA[i], PIXEL_DATA[i + 1], PIXEL_DATA[i + 2], PIXEL_DATA[i + 3]];
  let stringRGBA = JSON.stringify(rgba);
  if (!count[stringRGBA]) {
    count[stringRGBA] = 1;
  } else {
    count[stringRGBA]++;
  }
}

let colorValuesInOrder = Object.entries(count) as any;
colorValuesInOrder = colorValuesInOrder.sort((a: [string, number], b: [string, number]) => {
  if (a[1] < b[1]) {
    return 1;
  } else {
    return -1;
  }
});

const TOP_3_COLORS = colorValuesInOrder.slice(0, 3);

console.log(JSON.parse(TOP_3_COLORS[0][0]));

const MAIN_COLOR_RGBA = JSON.parse(TOP_3_COLORS[0][0]);
const SECONDARY_COLOR_RGBA = JSON.parse(TOP_3_COLORS[1][0]);
const TERTIARY_COLOR_RGBA = JSON.parse(TOP_3_COLORS[2][0]);

const MAIN_COLOR_RGB = {
  r: MAIN_COLOR_RGBA[0],
  g: MAIN_COLOR_RGBA[1],
  b: MAIN_COLOR_RGBA[2],
};
const SECONDARY_COLOR_RGB = {
  r: SECONDARY_COLOR_RGBA[0],
  g: SECONDARY_COLOR_RGBA[1],
  b: SECONDARY_COLOR_RGBA[2],
};
const TERTIARY_COLOR_RGB = {
  r: TERTIARY_COLOR_RGBA[0],
  g: TERTIARY_COLOR_RGBA[1],
  b: TERTIARY_COLOR_RGBA[2],
};
PRIMARY_COLOR_DISPLAY.value = RGBToHex(MAIN_COLOR_RGB);
SECONDARY_COLOR_DISPLAY.value = RGBToHex(SECONDARY_COLOR_RGB);
TERTIARY_COLOR_DISPLAY.value = RGBToHex(TERTIARY_COLOR_RGB);

// for (let i = 0; i < pixelData.length; i+=4) {
//   const rgba = [pixelData[i], pixelData[i+1], pixelData[i+2], pixelData[i+3]];
//   let stringRGBA = JSON.stringify(rgba);
//   if (stringRGBA === '[48,53,84,255]') {
//     pixelData[i+3] = 0;
//   }
// }

ctx.putImageData(IMAGE_DATA, 0, 0);

afterImgContainer.prepend(canvas);

originalImg.addEventListener('click', (e) => {
  const x = e.x;
  const y = e.y;
  // console.log({x,y})
  // console.log(originalImg.getBoundingClientRect())
  const imgPos = originalImg.getBoundingClientRect();
  let imageX = Math.round(x - imgPos.x);
  const imageY = Math.round(y - imgPos.y);

  const pixelIndex = imageY * 4 * WIDTH + imageX * 4;

  const pixel = {
    r: PIXEL_DATA[pixelIndex],
    g: PIXEL_DATA[pixelIndex + 1],
    b: PIXEL_DATA[pixelIndex + 2],
    a: PIXEL_DATA[pixelIndex + 3],
  };

  SELECTED_COLOR.dataset.rgba = JSON.stringify([PIXEL_DATA[pixelIndex], PIXEL_DATA[pixelIndex + 1], PIXEL_DATA[pixelIndex + 2], PIXEL_DATA[pixelIndex + 3]]);
  SELECTED_COLOR.value = RGBToHex(pixel);
});

function RGBToHex(pixel: { r: number; g: number; b: number }) {
  const { r, g, b } = pixel;
  let _r = r.toString(16);
  let _g = g.toString(16);
  let _b = b.toString(16);

  if (_r.length == 1) _r = '0' + r;
  if (_g.length == 1) _g = '0' + g;
  if (_b.length == 1) _b = '0' + b;

  return '#' + _r + _g + _b;
}

REMOVE_COLOR_BUTTON.addEventListener('click', () => {
  const RGBA = SELECTED_COLOR.dataset.rgba;
  for (let i = 0; i < PIXEL_DATA.length; i += 4) {
    const rgba = [PIXEL_DATA[i], PIXEL_DATA[i + 1], PIXEL_DATA[i + 2], PIXEL_DATA[i + 3]];
    let stringRGBA = JSON.stringify(rgba);
    if (stringRGBA === RGBA) {
      PIXEL_DATA[i + 3] = 0;
    }
  }
  ctx.putImageData(IMAGE_DATA, 0, 0);
});

UPLOAD_IMAGE_INPUT.addEventListener('change', (e: any) => {
  const url = URL.createObjectURL(e.target.files[0]);
  const image = new Image();
  image.src = url;
  image.onload = () => {
    // originalImg.width = image.naturalWidth;
    // originalImg.height = image.naturalHeight;
    originalImg.src = url;
    WIDTH = originalImg.width;
    HEIGHT = originalImg.height;
    renderAfterImage(ctx, image);
  };
});

function renderAfterImage(ctx: CanvasRenderingContext2D, image: HTMLImageElement) {
  canvas.width = WIDTH;
  canvas.height = HEIGHT;

  ctx.drawImage(image, 0, 0, WIDTH, HEIGHT);
  IMAGE_DATA = ctx.getImageData(0, 0, WIDTH, HEIGHT);
  PIXEL_DATA = IMAGE_DATA.data;
}
