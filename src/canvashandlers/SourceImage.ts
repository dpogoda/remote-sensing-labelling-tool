import { getCanvasTemplate } from "./canvastemplate";
import { NormType } from "@/types";

let worker: Worker | null = null;

/**
 * Normalizes the source image and loads it into the canvas
 * @param labelStore 
 */
export function loadSourceImage(labelStore: any) {

    let tooltips = 'The source image';
    let canvas = getCanvasTemplate(labelStore, 'Source Image', tooltips, true);

    // let normalisedAgricultureTiff: ImageData = normalizeBy1And99Percentile([labelStore.b11Raw, labelStore.b8Raw, labelStore.rgbRaw[2]], labelStore.width, labelStore.height);
    if (worker) {
        worker.terminate();  // Terminate any existing worker
    }

    worker = new Worker(new URL('../workers/normalizeWorker.ts', import.meta.url), { type: 'module' });
    worker.onmessage = (event) => {
        

        const ctx = canvas.getContext('2d');
        if (ctx) {
            const { imageData } = event.data;
            ctx.putImageData(imageData, 0, 0);
            ctx.imageSmoothingEnabled = false;
        }

        worker?.terminate();  // Clean up the worker
    };

    worker.postMessage({
        rRaw: labelStore.rgbRaw[0],
        gRaw: labelStore.rgbRaw[1],
        bRaw: labelStore.rgbRaw[2],
        width: labelStore.width,
        height: labelStore.height,
        normType: NormType["1and99percentile"]
    });
}
