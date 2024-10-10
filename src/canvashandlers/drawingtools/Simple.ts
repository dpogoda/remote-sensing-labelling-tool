import config from "@/config";
import { patchNumberToCoords } from "@/stores/canvasHandlerStore";
import type { CanvasHandlerStore, CanvasStore, SimpleDrawType } from "@/types";
import { colorDistance, getHexStringAt, hexToColor } from "@/utils/helpers/common";

export function erasePixel(x: number, y: number, canvasHandlerStore: CanvasStore) {
    let canvas = canvasHandlerStore.layerNameToCanvas.get(canvasHandlerStore.selectedLayer);
    const context = canvas?.getContext('2d');
    if (context) {
        context.clearRect(x, y, canvasHandlerStore.penSize, canvasHandlerStore.penSize);
    }
}

export function drawPixel(x: number, y: number, color: string, canvasHandlerStore: CanvasStore) {
    let canvas = canvasHandlerStore.layerNameToCanvas.get(canvasHandlerStore.selectedLayer);
    console.log(canvasHandlerStore.selectedLayer);
    const context = canvas?.getContext('2d');
    if (context) {
        context.fillStyle = color;
        context.fillRect(x, y, canvasHandlerStore.penSize, canvasHandlerStore.penSize);
    }
}

export function drawAbPixel(x: number, y: number, color: string, canvasHandlerStore: CanvasStore) {
    const currentImage = canvasHandlerStore.listOfImages.find((img) => img.fullTitle === canvasHandlerStore.currentImage.fullTitle);
    if (!currentImage) return;

    let { x: x0, y: y0 } = patchNumberToCoords(currentImage.patchNumber);
    let canvas = canvasHandlerStore.layerNameToCanvas.get(canvasHandlerStore.selectedLayer);
    const context = canvas?.getContext('2d');

    if (context) {
        // if ((x + canvasHandlerStore.penSize / 2) < x0 || (x - canvasHandlerStore.penSize / 2) >= x0 + config.patchSize || (y + canvasHandlerStore.penSize / 2) < y0 || (y - canvasHandlerStore.penSize / 2) >= y0 + config.patchSize) {
        //     return;
        // }

        const penSize = canvasHandlerStore.penSize;

        // Iterate through the pen size area
        for (let i = 0; i < penSize; i++) {
            for (let j = 0; j < penSize; j++) {
                let shouldDraw = true;

                // Check if all pixels in the pen size area are zero
                canvasHandlerStore.layerNameToCanvas.forEach((canvas, layerName) => {
                    if (layerName.startsWith('Drawing Layer')) {
                        const ctx = canvas.getContext('2d');
                        if (ctx) {
                            const pixel = ctx.getImageData(x + i, y + j, 1, 1).data;
                            if (pixel[0] !== 0 || pixel[1] !== 0 || pixel[2] !== 0 || pixel[3] !== 0) {
                                shouldDraw = false;
                            }
                        }
                    }
                });

                // Draw only if the pixel is zero
                if (shouldDraw) {
                    context.fillStyle = color;
                    context.fillRect(x + i, y + j, 1, 1);
                }
            }
        }
    }
}

export function overDrawColor(x: number, y: number, color: string, canvasHandlerStore: CanvasStore) {
    let canvas = canvasHandlerStore.layerNameToCanvas.get(canvasHandlerStore.magicStick.drawLayer);
    console.log(canvasHandlerStore.magicStick.drawLayer);
    const context = canvas?.getContext('2d');
    if (context) {
        console.log(canvasHandlerStore.penSize);
        for (let i = 0; i < canvasHandlerStore.penSize; i++) {
            for (let j = 0; j < canvasHandlerStore.penSize; j++) {
                const colorXY = getHexStringAt(x + i, y + j, canvasHandlerStore).hex;
                if (colorXY === canvasHandlerStore.magicStick.overwriteClass.toUpperCase()) {
                    context.fillStyle = color;
                    context.fillRect(x + i, y + j, 1, 1);
                }
            }
        }
    }
}

export function clearImage(canvasHandlerStore: CanvasStore) {
    let layerToClear = canvasHandlerStore.selectedLayer;
    if (!layerToClear.startsWith('Drawing Layer')) {
        let canvas = document.getElementById('Drawing Layer 1') as HTMLCanvasElement
        let context = canvas?.getContext('2d')
        context?.clearRect(0, 0, canvas?.width!, canvas?.height!)
    } else {
        let canvas = document.getElementById(layerToClear) as HTMLCanvasElement
        let context = canvas?.getContext('2d')
        context?.clearRect(0, 0, canvas?.width!, canvas?.height!)
    }
}


export function clamp(value: number, min: number, max: number) {  // Helper function to keep values in range
    return Math.max(min, Math.min(max, value));
}

export function adjustBrightness(imgData: ImageData, brightness: number) {  // brightness range could be [-255..255]
    var d = imgData.data;
    for (var i = 0; i < d.length; i += 4) {  // iterate over each pixel; r,g,b,a
        d[i] = clamp(d[i] + brightness, 0, 255);    // Red
        d[i + 1] = clamp(d[i + 1] + brightness, 0, 255);  // Green
        d[i + 2] = clamp(d[i + 2] + brightness, 0, 255);  // Blue
        // Alpha (d[i + 3]) is not changed
    }
    return imgData;
}

export function contrastImage(imgData: ImageData, contrast: number) {  //input range [-100..100]
    let d = imgData.data;
    contrast = (contrast / 100) + 1;  //convert to decimal & shift range: [0..2]
    let intercept = 128 * (1 - contrast);
    for (let i = 0; i < d.length; i += 4) {   //r,g,b,a
        d[i] = clamp(d[i] * contrast + intercept, 0, 255);    // Red
        d[i + 1] = clamp(d[i + 1] * contrast + intercept, 0, 255);  // Green
        d[i + 2] = clamp(d[i + 2] * contrast + intercept, 0, 255);  // Blue
    }
    return imgData;
}






// import type { NormType } from "@/types";
// import { getCanvasTemplate } from "../CanvasTemplate";

// let worker: Worker | null = null;

// export function simpleDraw(labelStore: any, drawType: SimpleDrawType) {

//     // let tooltips = 'Source Image';
//     // let canvas = getCanvasTemplate(labelStore, 'Source Image', tooltips);

//     let canvas: HTMLCanvasElement = document.getElementById('Source Image') as HTMLCanvasElement;

//     if (worker) {
//         worker.terminate();  // Terminate any existing worker
//     }

//     worker = new Worker(new URL('../../workers/normalizeWorker.ts', import.meta.url), { type: 'module' });
//     worker.onmessage = (event) => {
//         // const { canvas } = event.data;
//         // labelStore.layerNameToCanvas.set('savi', canvas);

//         const ctx = canvas.getContext('2d');
//         if (ctx) {
//             const { imageData } = event.data;
//             ctx.putImageData(imageData, 0, 0);
//             ctx.imageSmoothingEnabled = false;
//         }

//         worker?.terminate();  // Clean up the worker
//     };

//     worker.postMessage({
//         rRaw: labelStore.rgbRaw[0],
//         gRaw: labelStore.rgbRaw[1],
//         bRaw: labelStore.rgbRaw[2],
//         normType,
//         width: labelStore.width,
//         height: labelStore.height
//     });
// }