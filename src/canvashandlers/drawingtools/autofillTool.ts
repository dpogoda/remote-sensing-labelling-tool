import config from "@/config";
import { CursorShadowHandler } from "@/eventhandlers/CursorShadowHandler";
import { patchNumberToCoords } from "@/stores/canvasHandlerStore";
import type { CanvasStore } from "@/types";
import { coordinatesToIndex } from "@/utils/helpers/common";
import { canvas } from "leaflet";

let worker: Worker | null = null;

export function prefillAutofill(tolerance: number, canvasStore: CanvasStore) {
    const autofillCanvas = document.getElementById('autofill') as HTMLCanvasElement;
    const autofillCtx = autofillCanvas.getContext('2d');
    autofillCtx!.clearRect(0, 0, autofillCanvas.width, autofillCanvas.height);
    let layers = document.getElementById('layers')!.children;

    const currentImage = canvasStore.listOfImages.find((img) => img.fullTitle === canvasStore.currentImage.fullTitle)!;
    let { x: x0, y: y0 } = patchNumberToCoords(currentImage.patchNumber);

    // const xy = CursorShadowHandler.getInstance().cursorShadowPosition;
    const xy = canvasStore.autofillXY;
    if (xy) {

        const x = Math.floor(xy.x) - Math.floor(1 / 2);
        const y = Math.floor(xy.y) - Math.floor(1 / 2);

        let rRaw: number[] = [];
        let bRaw: number[] = [];
        let gRaw: number[] = [];
        let b1Raw: number[] = [];
        let b5Raw: number[] = [];
        let b6Raw: number[] = [];
        let b7Raw: number[] = [];
        let b8Raw: number[] = [];
        let b8aRaw: number[] = [];
        let b9Raw: number[] = [];
        let b11Raw: number[] = [];
        let b12Raw: number[] = [];

        rRaw.push(canvasStore.rgbRaw[0][coordinatesToIndex(x, y)]);
        gRaw.push(canvasStore.rgbRaw[1][coordinatesToIndex(x, y)]);
        bRaw.push(canvasStore.rgbRaw[2][coordinatesToIndex(x, y)]);
        b1Raw.push(canvasStore.b1Raw[coordinatesToIndex(x, y)]);
        b5Raw.push(canvasStore.b5Raw[coordinatesToIndex(x, y)]);
        b6Raw.push(canvasStore.b6Raw[coordinatesToIndex(x, y)]);
        b7Raw.push(canvasStore.b7Raw[coordinatesToIndex(x, y)]);
        b8Raw.push(canvasStore.b8Raw[coordinatesToIndex(x, y)]);
        b8aRaw.push(canvasStore.b8aRaw[coordinatesToIndex(x, y)]);
        b9Raw.push(canvasStore.b9Raw[coordinatesToIndex(x, y)]);
        b11Raw.push(canvasStore.b11Raw[coordinatesToIndex(x, y)]);
        b12Raw.push(canvasStore.b12Raw[coordinatesToIndex(x, y)]);

        // Post only serializable data to the worker
        if (worker) {
            worker.terminate();
        }


        worker = new Worker(new URL('../../workers/autofillWorker.ts', import.meta.url), { type: 'module' });

        worker.onmessage = (event) => {
            const { imageData } = event.data;
            autofillCtx!.putImageData(imageData, 0, 0);
            worker?.terminate();
        };

        // console.log('intensityImagePixel:', canvasStore.intensityImagePixel);
        // console.log('autofillReferencePixel:', canvasStore.autofillReferencePixel);


        if (canvasStore.autofillColor.every((val, index) => val === 0)) {
            for (let i = layers.length - 1; i >= 0; i--) {
                let layer = layers[i] as HTMLCanvasElement;
                if (layer.id.startsWith('Drawing Layer')) {
                    const ctx = layer.getContext('2d');
                    let color = ctx!.getImageData(x, y, 1, 1).data;
                    if (!color.every((val, index) => val === 0)) {
                        canvasStore.autofillColor = color;
                        break;
                    }
                }
            }
        }

        const serializableAutofillReferencePixel = Array.isArray(canvasStore.autofillReferencePixel)
            ? Array.from(canvasStore.autofillReferencePixel)
            : canvasStore.intensityImagePixel;

        const serializableAutofillColor = Array.from(canvasStore.autofillColor);

        worker.postMessage({
            xyRRaw: structuredClone(rRaw),
            xyBRaw: structuredClone(bRaw),
            xyGRaw: structuredClone(gRaw),
            xyB1Raw: structuredClone(b1Raw),
            xyB5Raw: structuredClone(b5Raw),
            xyB6Raw: structuredClone(b6Raw),
            xyB7Raw: structuredClone(b7Raw),
            xyB8Raw: structuredClone(b8Raw),
            xyB8aRaw: structuredClone(b8aRaw),
            xyB9Raw: structuredClone(b9Raw),
            xyB11Raw: structuredClone(b11Raw),
            xyB12Raw: structuredClone(b12Raw),
            rRaw: canvasStore.rgbRaw[0],
            bRaw: canvasStore.rgbRaw[2],
            gRaw: canvasStore.rgbRaw[1],
            b1Raw: canvasStore.b1Raw,
            b5Raw: canvasStore.b5Raw,
            b6Raw: canvasStore.b6Raw,
            b7Raw: canvasStore.b7Raw,
            b8Raw: canvasStore.b8Raw,
            b8aRaw: canvasStore.b8aRaw,
            b9Raw: canvasStore.b9Raw,
            b11Raw: canvasStore.b11Raw,
            x0,
            y0,
            width: autofillCanvas.width,
            height: autofillCanvas.height,
            layersLength: layers.length,
            tolerance,
            layerType: canvasStore.layerType,
            autofillColor: serializableAutofillColor,
            autofillReferencePixel: serializableAutofillReferencePixel
        });

    }
}
