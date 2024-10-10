import { useLabelCanvasStore } from "@/stores/canvasHandlerStore";
import { useSettingsStore } from "@/stores/settingStore";
import type { CanvasStore } from "@/types";
import { ActionEventHandler } from "./ActionEventHandler";
import { set } from "lodash";

export enum HistoryAction {
    BUCKETFILL = 'BUCKETFILL',
    DRAWPIXEL = 'DRAWPIXEL',
    ERASEPIXEL = 'ERASEPIXEL',
    ABDRAW = 'ABDRAW',
    TABDRAW = 'TABDRAW',
    MAGICDRAW = 'MAGICDRAW',
}

export class HistoryHandler {

    static instance: HistoryHandler | null = null;
    canvasHandlerStore: CanvasStore | null = null;

    static letters = 'abcdefghijklmnopqrstuvwxyz';
    static letterIndex = 0;

    static history: [
        string,
        ImageData,
        // HistoryAction
        string
    ][] = [];

    static future: [
        string,
        ImageData,
        // HistoryAction
        string
    ][] = [];

    constructor() {
        if (HistoryHandler.instance) {
            return HistoryHandler.instance;
        } else {
            // add event listeners
            this.canvasHandlerStore = useLabelCanvasStore();
        }
    }

    static getInstance() {
        if (!HistoryHandler.instance) {
            HistoryHandler.instance = new HistoryHandler();
        }
        return HistoryHandler.instance;
    }


    undo() {
        if (HistoryHandler.history.length) {

            if (HistoryHandler.history[HistoryHandler.history.length - 1][0].includes('undeletable')) {
                return;
            }

            let deletedHistoryEntry = HistoryHandler.history.pop();

            let deletedHistoryEntryLayerName = deletedHistoryEntry![0];
            let deletedHistoryEntryProtocol = deletedHistoryEntry![2];

            // Check if there are deletables left 
            let countLayerHistory = 0;
            for (let i = 0; i < HistoryHandler.history.length; i++) {
                if (HistoryHandler.history[i][0].replace('_undeletable', '') === deletedHistoryEntryLayerName) {
                    countLayerHistory++;
                }
                if (countLayerHistory > 1) {
                    // deletables are left
                    break;
                }
            }

            // Special case:
            // This is only the case if a new layer was created and there are no deletables left.
            // Keep the layer but clear the canvas.
            // Also add the future image to the future stack
            if (countLayerHistory === 0) {
                let canvas = HistoryHandler.getInstance().canvasHandlerStore!.layerNameToCanvas.get(deletedHistoryEntryLayerName);
                if (canvas) {
                    let ctx = canvas.getContext('2d');
                    if (ctx) {
                        let futureImageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
                        let clonedImageData = new ImageData(
                            new Uint8ClampedArray(futureImageData.data),
                            futureImageData.width,
                            futureImageData.height
                        );
                        HistoryHandler.future.push([deletedHistoryEntryLayerName, clonedImageData, deletedHistoryEntryProtocol]);
                        ctx.clearRect(0, 0, canvas.width, canvas.height);
                        return;
                    }
                }
            }

            // Else:
            // Simply restore the previous image
            // 1. Find the corresponding history for the layer
            // 2. Restore the image
            // 3. Add the image to the future stack
            // 4. Select the layer
            let historyImageToRestore = null;
            for (let i = HistoryHandler.history.length - 1; i >= 0; i--) {
                if (HistoryHandler.history[i][0].replace('_undeletable', '') === deletedHistoryEntryLayerName) {
                    historyImageToRestore = HistoryHandler.history[i];
                    break;
                }
            }
            let canvas = HistoryHandler.getInstance().canvasHandlerStore!.layerNameToCanvas.get(deletedHistoryEntryLayerName);
            if (canvas) {
                let ctx = canvas.getContext('2d');
                if (ctx) {
                    let futureImageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
                    let clonedImageData = new ImageData(
                        new Uint8ClampedArray(futureImageData.data),
                        futureImageData.width,
                        futureImageData.height
                    );
                    HistoryHandler.future.push([deletedHistoryEntryLayerName, clonedImageData, deletedHistoryEntryProtocol]);
                    ctx.clearRect(0, 0, canvas.width, canvas.height);
                    ctx.putImageData(historyImageToRestore![1], 0, 0);
                }
            }

            HistoryHandler.getInstance().canvasHandlerStore!.selectLayer(HistoryHandler.history[HistoryHandler.history.length - 1][0].replace('_undeletable', ''));
            

        }
    }

    redo() {
        if (HistoryHandler.future.length) {

            let futureImageToRestore = HistoryHandler.future.pop();
            let canvas = HistoryHandler.getInstance().canvasHandlerStore?.layerNameToCanvas.get(futureImageToRestore![0]);
            if (canvas) {
                let ctx = canvas.getContext('2d');
                if (ctx) {
                    let futureImageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
                    let clonedImageData = new ImageData(
                        new Uint8ClampedArray(futureImageToRestore![1].data),
                        futureImageData.width,
                        futureImageData.height
                    );
                    // check if clonedImageData is different from the last one in history
                    // if (HistoryHandler.history.length > 0) {
                    //     let lastImageData = HistoryHandler.history[HistoryHandler.history.length - 1][1].data;
                    //     if (!clonedImageData.data.every((value, index) => value === lastImageData[index])) {
                    //         HistoryHandler.history.push([futureImageToRestore![0], clonedImageData, futureImageToRestore![2]]);
                    //     }
                    // }
                    HistoryHandler.history.push([futureImageToRestore![0], clonedImageData, futureImageToRestore![2]]);
                    ctx.clearRect(0, 0, canvas.width, canvas.height);
                    ctx.putImageData(futureImageToRestore![1], 0, 0);
                    HistoryHandler.getInstance().canvasHandlerStore?.selectLayer(futureImageToRestore![0]);
                }
            }
        }
        
    }

    pushToHistory() {
        
        /**
         * Push the current imageData to the history array if it is different from the last one
         */
        let store = HistoryHandler.getInstance().canvasHandlerStore;
        if (store) {
            let selectedLayer = store.selectedLayer;
            if (selectedLayer) {
                let canvas = store.layerNameToCanvas.get(selectedLayer);
                if (canvas) {
                    let ctx = canvas.getContext('2d');
                    if (ctx) {
                        let imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);

                        // Check if the new imageData is different from the last one in history
                        if (HistoryHandler.history.length > 0) {
                            let lastImageData = HistoryHandler.history[HistoryHandler.history.length - 1][1].data;

                            // Directly compare the data arrays
                            if (imageData.data.every((value, index) => value === lastImageData[index])) {
                                return;
                            }
                        }

                        let clonedImageData = new ImageData(
                            new Uint8ClampedArray(imageData.data),
                            imageData.width,
                            imageData.height
                        );

                        let historyAction: HistoryAction = HistoryAction.DRAWPIXEL;
                        if (store.bucketFill.active) {
                            historyAction = HistoryAction.BUCKETFILL;
                        }
                        if (store.magicStick.active) {
                            historyAction = HistoryAction.MAGICDRAW;
                        }
                        if (store.eraserActive) {
                            historyAction = HistoryAction.ERASEPIXEL;
                        }
                        if (store.abStick.active) {
                            historyAction = HistoryAction.ABDRAW;
                        }
                        // todo tab

                        HistoryHandler.history.push([store.selectedLayer, clonedImageData, HistoryHandler.letters[HistoryHandler.letterIndex]]);
                        HistoryHandler.letterIndex++;
                        
                    }
                }
            }
        }
    }
}