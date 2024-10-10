import { getCanvasTemplate } from "../canvastemplate";

let worker: Worker | null = null;

export function loadNDWI(labelStore: any) {

    let tooltips = 'The normalized difference water index is a ratio of the difference between the green and near-infrared bands to the sum of the green and near-infrared bands. It’s particularly good for identifying water features. In general, water features have high NDWI values, while built-up areas have low values.';
    let canvas = getCanvasTemplate(labelStore, 'NDWI', tooltips, true);

    if (worker) {
        worker.terminate();  // Terminate any existing worker
    }

    worker = new Worker(new URL('../../workers/ndwiWorker.ts', import.meta.url), { type: 'module' });
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
        b8aRaw: labelStore.b8aRaw,
        bRaw: labelStore.rgbRaw[2],
        width: labelStore.width,
        height: labelStore.height
    });
}