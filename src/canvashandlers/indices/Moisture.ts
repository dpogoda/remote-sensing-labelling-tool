import { getCanvasTemplate } from "../canvastemplate";

let worker: Worker | null = null;

export function loadMoisture(labelStore: any) {

    let tooltips = 'The moisture index is ideal for finding water stress in plants. It uses the short-wave and near-infrared to generate an index of moisture content. In general, wetter vegetation has higher values. But lower moisture index values suggest plants are under stress from insufficient moisture.';
    let canvas = getCanvasTemplate(labelStore, 'Moisture', tooltips, true);

    if (worker) {
        worker.terminate();  // Terminate any existing worker
    }

    worker = new Worker(new URL('../../workers/moistureWorker.ts', import.meta.url), { type: 'module' });
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