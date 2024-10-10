import { getCanvasTemplate } from "../canvastemplate";
import { NormType } from "@/types";

let worker: Worker | null = null;

export function loadShortWaveInfrared(labelStore: any) {

    let tooltips = 'The short-wave infrared band combination uses SWIR (B12), NIR (B8A), and red (B4). This composite shows vegetation in various shades of green. In general, darker shades of green indicate denser vegetation. But brown is indicative of bare soil and built-up areas.';
    let canvas = getCanvasTemplate(labelStore, 'Short Wave Infrared', tooltips, true);

    // let normalisedAgricultureTiff: ImageData = normalizeBy1And99Percentile([labelStore.b11Raw, labelStore.b8Raw, labelStore.rgbRaw[2]], labelStore.width, labelStore.height);
    if (worker) {
        worker.terminate();  // Terminate any existing worker
    }

    worker = new Worker(new URL('../../workers/normalizeWorker.ts', import.meta.url), { type: 'module' });
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
        rRaw: labelStore.b12Raw,
        gRaw: labelStore.b8aRaw,
        bRaw: labelStore.rgbRaw[0],
        width: labelStore.width,
        height: labelStore.height,
        normType: NormType["1and99percentile"]
    });
}
