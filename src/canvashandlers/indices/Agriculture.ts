import { getCanvasTemplate } from "../canvastemplate";
import { NormType } from "@/types";

let worker: Worker | null = null;

export function loadAgriculture(labelStore: any) {

    let tooltips = 'The agriculture band combination uses SWIR-1 (B11), near-infrared (B8), and blue (B2). It’s mostly used to monitor the health of crops because of how it uses short-wave and near-infrared. Both these bands are particularly good at highlighting dense vegetation that appears as dark green.';
    let canvas = getCanvasTemplate(labelStore, 'Agriculture', tooltips, true);

    // let normalisedAgricultureTiff: ImageData = normalizeBy1And99Percentile([labelStore.b11Raw, labelStore.b8Raw, labelStore.rgbRaw[2]], labelStore.width, labelStore.height);
    if (worker) {
        worker.terminate();  // Terminate any existing worker
    }

    worker = new Worker(new URL('../../workers/normalizeWorker.ts', import.meta.url), { type: 'module' });
    worker.onmessage = (event) => {
        

        const ctx = canvas.getContext('2d');
        if (ctx) {
            const { imageData } = event.data;
            ctx.clearRect(0, 0, labelStore.width, labelStore.height);
            ctx.putImageData(imageData, 0, 0);
            ctx.imageSmoothingEnabled = false;
        }

        worker?.terminate();  // Clean up the worker
    };

    worker.postMessage({
        rRaw: labelStore.b11Raw,
        gRaw: labelStore.b8Raw,
        bRaw: labelStore.rgbRaw[2],
        width: labelStore.width,
        height: labelStore.height,
        normType: NormType["1and99percentile"]
    });
}
