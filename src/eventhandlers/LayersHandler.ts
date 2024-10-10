import { useLabelCanvasStore } from "@/stores/canvasHandlerStore";
import type { CanvasStore } from "@/types";

export class LayersHandler {
    static instance: LayersHandler | null = null;


    canvasStore: CanvasStore | null = null;

    constructor() {
        if (LayersHandler.instance) {
            return LayersHandler.instance;
        }
        this.canvasStore = useLabelCanvasStore();
    }

    static getInstance() {
        if (!LayersHandler.instance) {
            LayersHandler.instance = new LayersHandler();
        }
        return LayersHandler.instance;
    }

    /**
     * Orders the layers in the layers container
     * @param layerName Layer to come to the front
     */
    orderLayers(layerName: string) {
        let labelCanvasStore = LayersHandler.getInstance().canvasStore;
        if (labelCanvasStore) {
            const layers = document.getElementById('layers');
            const newSelectedLayerNode = document.getElementById(layerName);
            if (layers && newSelectedLayerNode) {
                layers.appendChild(newSelectedLayerNode);
            }
            // move canvas with IDs that start with 'Drawing Layer' to th last of the list
            const drawingLayers = document.getElementById('layers')?.querySelectorAll('canvas[id^="Drawing Layer"]');
            drawingLayers?.forEach((layer) => {
                layers?.appendChild(layer);
            });
            if (layerName.startsWith('Drawing Layer') && layers && newSelectedLayerNode) {
                layers.appendChild(newSelectedLayerNode);
            }

            // reoder labelCanvasStore.layerNameToCanvas
            labelCanvasStore.layerNameDisplayOrder = labelCanvasStore.layerNameDisplayOrder.sort((a, b) => {
                if (a === layerName) {
                    return -1;
                } else if (b === layerName) {
                    return 1;
                } else {
                    return 0;
                }
            });

            labelCanvasStore.drawingLayerNameDisplayOrder = labelCanvasStore.drawingLayerNameDisplayOrder.sort((a, b) => {
                if (a === layerName) {
                    return -1;
                } else if (b === layerName) {
                    return 1;
                } else {
                    return 0;
                }
            });

            labelCanvasStore.layerType = LayersHandler.getInstance().getLayerType();
        }
    }

    getLayerType() {
        let layerType: 'Moisture' | 'Agriculture' | 'NDVI' | 'Short Wave Infrared' | 'RGB' = 'Moisture';

        let layers = document.getElementById('layers')!.children
        for (let i = layers.length - 1; i >= 0; i--) {
            let layer = layers[i] as HTMLCanvasElement;
            if (!layer.id.startsWith('Drawing Layer')) {
                if (layer.id === 'Moisture') {
                    layerType = 'Moisture';
                    break;
                }
                if (layer.id === 'Agriculture') {
                    layerType = 'Agriculture';
                    break;
                }
                if (layer.id === 'NDVI') {
                    layerType = 'NDVI';
                    break;
                }
                if (layer.id === 'Short Wave Infrared') {
                    layerType = 'Short Wave Infrared';
                    break;
                }

                layerType = 'RGB';
                break;
            }
        }

        return layerType;
    }


    clearSourceCanvas() {
        let labelCanvas = document.getElementById('sourceImage');
        if (labelCanvas) {
            labelCanvas.innerHTML = '';
        }
    }

    clearDrawingCanvas() {
        let labelCanvas = document.getElementById('drawingContainer');
        if (labelCanvas) {
            labelCanvas.innerHTML = '';
        }
    }

    clearLayerCanvases() {
        let labelCanvas = document.getElementById('layers');
        if (labelCanvas) {
            labelCanvas.innerHTML = '';
        }
    }
}