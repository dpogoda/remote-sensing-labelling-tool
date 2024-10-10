import type { NormType } from "@/types";
import { getCanvasTemplate } from "../canvastemplate";

let worker: Worker | null = null;

export function normalize(labelStore: any, normType: NormType) {

    let tooltips = 'Source Image';
    // let canvas = getCanvasTemplate(labelStore, 'Source Image', tooltips);

    let canvas: HTMLCanvasElement = document.getElementById('Source Image') as HTMLCanvasElement;

    if (worker) {
        worker.terminate();  // Terminate any existing worker
    }

    worker = new Worker(new URL('../../workers/normalizeWorker.ts', import.meta.url), { type: 'module' });
    worker.onmessage = (event) => {
        // const { canvas } = event.data;
        // labelStore.layerNameToCanvas.set('savi', canvas);

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
        normType,
        width: labelStore.width,
        height: labelStore.height
    });
}