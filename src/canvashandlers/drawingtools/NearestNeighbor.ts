import _ from "lodash";

let worker: Worker | null = null;

export function performNearestNeighbor(sourceCanvas: HTMLCanvasElement, drawingCanvas: HTMLCanvasElement, bands: {
    b1: Uint16Array,
    b2: Uint16Array,
    b3: Uint16Array,
    b4: Uint16Array,
    b5: Uint16Array,
    b6: Uint16Array,
    b7: Uint16Array,
    b8: Uint16Array,
    b9: Uint16Array,
    b11: Uint16Array,
    b12: Uint16Array,
    b8a: Uint16Array
}) {

    const drawingContext = drawingCanvas.getContext('2d')!;
    const drawingImageDataRaw = drawingContext.getImageData(0, 0, drawingCanvas.width, drawingCanvas.height);
    const drawingImageData = drawingImageDataRaw.data;

    let drawingPixels: {
        [key: string]: {
            b2: number[],
            b3: number[],
            b4: number[],
            b1: number[],
            b5: number[],
            b6: number[],
            b7: number[],
            b8: number[],
            b9: number[],
            b11: number[],
            b12: number[],
            b8a: number[]
        }
    } = {};

    for (let i = 0, j = 0; i < drawingImageData.length; i += 4, j++) {
        // Skip if pixel is black (unlabeled)
        if (drawingImageData[i] === 0 && drawingImageData[i + 1] === 0 && drawingImageData[i + 2] === 0) continue;

        let key = `${drawingImageData[i]}-${drawingImageData[i + 1]}-${drawingImageData[i + 2]}`;

        if (!drawingPixels[key]) {
            drawingPixels[key] = {
                b2: [], b3: [], b4: [],
                b1: [], b5: [], b6: [], b7: [], b8: [],
                b9: [], b11: [], b12: [], b8a: []
            };
        }

        drawingPixels[key]['b2'].push(bands.b2[j]);
        drawingPixels[key]['b3'].push(bands.b3[j]);
        drawingPixels[key]['b4'].push(bands.b4[j]);
        drawingPixels[key]['b1'].push(bands.b1[j]);
        drawingPixels[key]['b5'].push(bands.b5[j]);
        drawingPixels[key]['b6'].push(bands.b6[j]);
        drawingPixels[key]['b7'].push(bands.b7[j]);
        drawingPixels[key]['b8'].push(bands.b8[j]);
        drawingPixels[key]['b9'].push(bands.b9[j]);
        drawingPixels[key]['b11'].push(bands.b11[j]);
        drawingPixels[key]['b12'].push(bands.b12[j]);
        drawingPixels[key]['b8a'].push(bands.b8a[j]);
    }

    // Average the bands
    drawingPixels = _.mapValues(drawingPixels, (value) => {
        return {
            b2: [_.mean(value.b2)],
            b3: [_.mean(value.b3)],
            b4: [_.mean(value.b4)],
            b1: [_.mean(value.b1)],
            b5: [_.mean(value.b5)],
            b6: [_.mean(value.b6)],
            b7: [_.mean(value.b7)],
            b8: [_.mean(value.b8)],
            b9: [_.mean(value.b9)],
            b11: [_.mean(value.b11)],
            b12: [_.mean(value.b12)],
            b8a: [_.mean(value.b8a)]
        }
    });

    // Terminate previous worker if exists
    if (worker) worker.terminate();

    worker = new Worker(new URL('../../workers/nearestNeighborWorker.ts', import.meta.url), { type: 'module' });
    worker.onmessage = (event) => {
        const { newImageData } = event.data;
        const drawingImageData = drawingContext.getImageData(0, 0, drawingCanvas.width, drawingCanvas.height);
        drawingImageData.data.set(newImageData);
        drawingContext.putImageData(drawingImageData, 0, 0);
    };

    // Send data to worker
    worker.postMessage({ drawingPixels, bands });
}

