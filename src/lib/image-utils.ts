export const createImage = (url: string): Promise<HTMLImageElement> =>
  new Promise((resolve, reject) => {
    const image = new Image();
    image.addEventListener('load', () => resolve(image));
    image.addEventListener('error', (error) => reject(error));
    image.setAttribute('crossOrigin', 'anonymous'); // needed to avoid cross-origin issues
    image.src = url;
  });

/**
 * Crops an image based on provided pixel area
 * @param imageSrc Source of the image
 * @param pixelCrop Area to crop
 * @param fileName Name of the resulting file
 * @returns Promise with cropped File object
 */
export default async function getCroppedImg(
  imageSrc: string,
  pixelCrop: { x: number; y: number; width: number; height: number },
  fileName: string = 'image.jpg'
): Promise<File | null> {
  const image = await createImage(imageSrc);
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');

  if (!ctx) {
    return null;
  }

  // set canvas size to match the image dimensions
  canvas.width = image.width;
  canvas.height = image.height;

  // draw image
  ctx.drawImage(image, 0, 0);

  // extracted the cropped image
  const data = ctx.getImageData(
    pixelCrop.x,
    pixelCrop.y,
    pixelCrop.width,
    pixelCrop.height
  );

  // set canvas width to final desired crop size
  canvas.width = pixelCrop.width;
  canvas.height = pixelCrop.height;

  // paste generated rotate image with correct offsets for x,y crop
  ctx.putImageData(data, 0, 0);

  // Determine output type based on file extension or data URL to preserve transparency if needed
  let outputType = 'image/jpeg';
  if (fileName.toLowerCase().endsWith('.png') || imageSrc.startsWith('data:image/png')) {
    outputType = 'image/png';
  } else if (fileName.toLowerCase().endsWith('.webp') || imageSrc.startsWith('data:image/webp')) {
    outputType = 'image/webp';
  }

  // As a blob
  return new Promise((resolve) => {
    canvas.toBlob((file) => {
      if (file) {
        resolve(new File([file], fileName, { type: outputType }));
      } else {
        resolve(null);
      }
    }, outputType, outputType === 'image/jpeg' ? 0.9 : undefined);
  });
}
