import { getCanvasTemplate } from "../canvastemplate";

let worker: Worker | null = null;

export function loadNDBI(labelStore: any) {

    let tooltips = 'The normalized difference built-up index is a ratio of the difference between the short-wave infrared and near-infrared bands to the sum of the short-wave infrared and near-infrared bands. It’s particularly good for identifying built-up areas. In general, built-up areas have high NDBI values, while vegetation and water have low values.';
    let canvas = getCanvasTemplate(labelStore, 'NDBI', tooltips, true);

    if (worker) {
        worker.terminate();  // Terminate any existing worker
    }

    worker = new Worker(new URL('../../workers/ndbiWorker.ts', import.meta.url), { type: 'module' });
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
        b11Raw: labelStore.b11Raw,
        b8Raw: labelStore.b8Raw,
        width: labelStore.width,
        height: labelStore.height
    });
}