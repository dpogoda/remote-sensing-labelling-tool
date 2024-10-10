import { HistoryAction, HistoryHandler } from "@/eventhandlers/HistoryHandler";
import type { CanvasStore } from "@/types";
import { getHexStringAt } from "@/utils/helpers/common";

let worker: Worker | null = null;

export function bucketFillWorker(targetCanvas: HTMLCanvasElement, startX: number, startY: number, labelStore: CanvasStore) {

    const context = targetCanvas?.getContext('2d');
    if (!context) return;

    labelStore.isLoading = true;

    const {
        layerName: sourceLayerName,
        hex: hexColorToReplace,
    } = getHexStringAt(startX, startY, labelStore);

    const sourceLayerCanvas = labelStore.layerNameToCanvas.get(sourceLayerName)!;
    const sourceContext = sourceLayerCanvas.getContext('2d')!;

    const replacingHexColor = labelStore.displayNameToColors[labelStore.selectedClass];
    const imageData = sourceContext.getImageData(0, 0, sourceLayerCanvas.width, sourceLayerCanvas.height);
    const targetImageData = context.getImageData(0, 0, targetCanvas.width, targetCanvas.height);


    if (worker) {
        worker.terminate();  // Terminate any existing worker
    }

    worker = new Worker(new URL('../../workers/bucketFillWorker.ts', import.meta.url), { type: 'module' });

    worker.onmessage = (event) => {
        const { imageData: updatedData } = event.data;

        const newImageData = new ImageData(new Uint8ClampedArray(updatedData), 480, 480);

        context.clearRect(0, 0, targetCanvas.width, targetCanvas.height);
        context.putImageData(newImageData, 0, 0);

        labelStore.isLoading = false;
        labelStore.mouseIsDown = false;
        // labelStore.pushToHistory();
        HistoryHandler.getInstance().pushToHistory();

        worker?.terminate();  // Clean up the worker
    };

    worker.postMessage({
        sourceIsPatchSize: sourceLayerCanvas.id === 'GMM' || sourceLayerCanvas.id === 'SCL',
        targetImageData,
        // patchNumber: labelStore.listOfImages.find((img) => img.title === labelStore.currentImage.title)!.patchNumber,
        imageData,
        startX,
        startY,
        hexColorToReplace,
        replacingHexColor,
        sourceCanvasWidth: sourceLayerCanvas.width,
        sourceCanvasHeight: sourceLayerCanvas.height,
        layerIsDrawingLayer: sourceLayerName.includes('Drawing Layer'),
        tolerance: labelStore.bucketFillTolerance // tolerance
    });
}
