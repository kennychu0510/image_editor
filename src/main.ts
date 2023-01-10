export {};
function selectElement(selector: string) {
  const element = document.querySelector(selector);
  if (!element) throw 'Element not found for ' + selector;
  return element;
}

const originalImg = selectElement('#img-original') as HTMLImageElement;
const afterImgContainer = selectElement('#after-container') as HTMLDivElement;
const colorPicker = selectElement('#color-value') as HTMLInputElement;

const width = originalImg.naturalWidth;
const height = originalImg.naturalHeight;

const canvas = document.createElement('canvas');
const ctx = canvas.getContext('2d')!;
canvas.width = width;
canvas.height = height;

ctx.drawImage(originalImg, 0, 0, width, height);

const imageData = ctx.getImageData(0, 0, width, height);
const pixelData = imageData.data;
let count: any = {};
for (let i = 0; i < pixelData.length; i += 4) {
  const rgba = [pixelData[i], pixelData[i + 1], pixelData[i + 2], pixelData[i + 3]];
  let stringRGBA = JSON.stringify(rgba);
  if (!count[stringRGBA]) {
    count[stringRGBA] = 1;
  } else {
    count[stringRGBA]++;
  }
}

// for (let i = 0; i < pixelData.length; i+=4) {
//   const rgba = [pixelData[i], pixelData[i+1], pixelData[i+2], pixelData[i+3]];
//   let stringRGBA = JSON.stringify(rgba);
//   if (stringRGBA === '[48,53,84,255]') {
//     pixelData[i+3] = 0;
//   }
// }

ctx.putImageData(imageData, 0, 0);

afterImgContainer.prepend(canvas);

originalImg.addEventListener('click', (e) => {
  const x = e.x;
  const y = e.y;
  // console.log({x,y})
  // console.log(originalImg.getBoundingClientRect())
  const imgPos = originalImg.getBoundingClientRect();
  let imageX = Math.round(x - imgPos.x);
  const imageY = Math.round(y - imgPos.y);

  console.log({ imageX, imageY });

  const pixelIndex = imageY * 4 * width + imageX * 4;

  const pixel = {
    r: pixelData[pixelIndex],
    g: pixelData[pixelIndex + 1],
    b: pixelData[pixelIndex + 2],
    a: pixelData[pixelIndex + 3],
  };

  colorPicker.value = RGBToHex(pixel);
  console.log(RGBToHex(pixel));
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
