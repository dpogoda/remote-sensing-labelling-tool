import { getCanvasTemplate } from "../canvastemplate";

let worker: Worker | null = null;

export function loadGMM(labelStore: any) {

    let tooltips = 'GMM';
    let canvas = getCanvasTemplate(labelStore, 'GMM', tooltips);

    if (worker) {
        worker.terminate();  // Terminate any existing worker
    }

    worker = new Worker(new URL('../../workers/gmmWorker.ts', import.meta.url), { type: 'module' });
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
        b8Raw: labelStore.b8Raw,
        b11Raw: labelStore.b11Raw,
        width: labelStore.width,
        height: labelStore.height
    });
}