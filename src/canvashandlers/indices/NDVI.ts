import { getCanvasTemplate } from "../canvastemplate";

let worker: Worker | null = null;

export function loadNDVI(labelStore: any) {

    let tooltips = 'Because near-infrared (which vegetation strongly reflects) and red light (which vegetation absorbs), the vegetation index is good for quantifying the amount of vegetation. The formula for the normalized difference vegetation index is (B8-B4)/(B8+B4). While high values suggest dense canopy, low or negative values indicate urban and water features.';
    let canvas = getCanvasTemplate(labelStore, 'NDVI', tooltips, true);

    if (worker) {
        worker.terminate();  // Terminate any existing worker
    }

    worker = new Worker(new URL('../../workers/ndviWorker.ts', import.meta.url), { type: 'module' });
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
        rRaw: labelStore.rgbRaw[0],
        width: labelStore.width,
        height: labelStore.height
    });
}