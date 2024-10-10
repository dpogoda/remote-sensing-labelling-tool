import { getCanvasTemplate } from "../canvastemplate";

let worker: Worker | null = null;

export function loadSAVI(labelStore: any) {

    let tooltips = 'The soil-adjusted vegetation index is a vegetation index that attempts to correct for soil brightness. It uses the near-infrared and red bands. It’s particularly good for areas with high soil brightness. In general, high SAVI values indicate dense vegetation, while low values suggest sparse vegetation.';
    let canvas = getCanvasTemplate(labelStore, 'SAVI', tooltips, true);

    if (worker) {
        worker.terminate();  // Terminate any existing worker
    }

    worker = new Worker(new URL('../../workers/saviWorker.ts', import.meta.url), { type: 'module' });
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
        b8Raw: labelStore.b8Raw,
        rRaw: labelStore.rgbRaw[0],
        width: labelStore.width,
        height: labelStore.height
    });
}