import config from "@/config";
import { patchNumberToCoords, useLabelCanvasStore } from "@/stores/canvasHandlerStore";
import type { CanvasStore } from "@/types";
import type { Canvas } from "leaflet";

// let labelStore = useLabelCanvasStore();

export function rgbToHex(r: number, g: number, b: number) {
    return ((r << 16) | (g << 8) | b).toString(16).toUpperCase();
}

function isOpacityPixel(pixel: Uint8ClampedArray) {
    return pixel[3] === 0;
}

export function getHexStringAt(x: number, y: number, labelStore: CanvasStore): {
    layerName: string,
    hex: string
} {

    // let patchNumber = labelStore.listOfImages.find((img) => img.title === labelStore.currentImage.title)!.patchNumber;

    let allClassColors = Object.keys(labelStore.hexColorToClassName);

    for (let i = 0; i < labelStore.drawingLayerNameDisplayOrder.length; i++) {
        let layerName = labelStore.drawingLayerNameDisplayOrder[i];
        let canvas = labelStore.layerNameToCanvas.get(layerName);
        if (canvas?.style.opacity === '0') {
            continue;
        }

        let ctx = canvas!.getContext('2d', {
            willReadFrequently: true
        });
        let pixel = ctx!.getImageData(x, y, 1, 1).data;

        if (isOpacityPixel(pixel)) {
            continue;
        }


        let hex = '#' + ('000000' + rgbToHex(pixel[0], pixel[1], pixel[2])).slice(-6);
        // if (allClassColors.includes(hex)) {
        return {
            layerName: layerName,
            hex: hex
            // };
        }
    }

    for (let i = 0; i < labelStore.layerNameDisplayOrder.length; i++) {
        let layerName = labelStore.layerNameDisplayOrder[i];

        let canvas = labelStore.layerNameToCanvas.get(layerName);
        if (canvas?.style.opacity === '0') {
            continue;
        }

        let ctx = canvas!.getContext('2d', {
            willReadFrequently: true
        });


        let xmod = x;
        let ymod = y;
        if (layerName === 'GMM' || layerName === 'SCL') {
            // xmod -= patchNumberToCoords(patchNumber).x;
            // ymod -= patchNumberToCoords(patchNumber).y;
        }

        let pixel = ctx!.getImageData(xmod, ymod, 1, 1).data;

        let hex = '#' + ('000000' + rgbToHex(pixel[0], pixel[1], pixel[2])).slice(-6);


        if (isOpacityPixel(pixel)) {
            continue;
        }


        // if (allClassColors.includes(hex)) {
        return {
            layerName: layerName,
            hex: hex
        };
        // }
    }

    return {
        layerName: 'Drawing Layer 1',
        hex: '#000000'
    };
}

/**
 * Get the current active layer defined at the most top layer without opacity 0
 * @param hasProperty 
 * @returns 
 */
export function getActiveLayer(labelStore: CanvasStore, hasProperties?: string[], ignoreHasProperties?: string[]) {

    const checkLayer = (layerName: string) => {
        let canvas = labelStore.layerNameToCanvas.get(layerName);
        if (canvas?.style.opacity === '0') {
            return false;
        }
        if (ignoreHasProperties && ignoreHasProperties.length > 0) {
            if (ignoreHasProperties.every(prop => !canvas?.hasAttribute(prop))) {
                return false;
            }
        }
        if (hasProperties && hasProperties.length > 0) {
            if (hasProperties.every(prop => canvas!.hasAttribute(prop))) {
                return true;
            }
        } else {
            return true;
        }

    }

    // drawing layers are always on top, that's why we check them first
    for (let i = 0; i < labelStore.drawingLayerNameDisplayOrder.length; i++) {
        let layerName = labelStore.drawingLayerNameDisplayOrder[i];
        if (checkLayer(layerName)) return layerName;
    }

    for (let i = 0; i < labelStore.layerNameDisplayOrder.length; i++) {
        let layerName = labelStore.layerNameDisplayOrder[i];
        if (checkLayer(layerName)) return layerName;
    }

    return 'Drawing Layer 1';
}

export function coordinatesToIndex(x: number, y: number, componentsPerPixel: number = 4) {
    return (y * config.imageSize + x);
}

export function getMousePos(event: MouseEvent, labelStore: CanvasStore) {
    // let canvas = labelStore.layerNameToCanvas.get(labelStore.selectedLayer);
    // let labelStore = ActionEventHandler.getInstance().canvasHandlerStore;
    if (labelStore) {
        let canvas = labelStore.layerNameToCanvas.get('Drawing Layer 1');
        let rect = canvas!.getBoundingClientRect();
        let scaleX = canvas!.width / rect.width;    // relationship bitmap vs. element for X
        let scaleY = canvas!.height / rect.height;  // relationship bitmap vs. element for Y

        return {
            x: (event.clientX - rect.left) * scaleX,   // scale mouse coordinates after they have
            y: (event.clientY - rect.top) * scaleY     // been adjusted to be relative to element
        };
    }
}

export function hexToColor(hex: string): number {
    // Remove the '#' if it's there
    hex = hex.replace('#', '');

    // Parse the hex string as an integer with base 16
    return parseInt(hex, 16);
}


export function colorDistance(color1: number, color2: number) {
    // Extract RGB components from color1
    const r1 = (color1 >> 16) & 0xFF;
    const g1 = (color1 >> 8) & 0xFF;
    const b1 = color1 & 0xFF;

    // Extract RGB components from color2
    const r2 = (color2 >> 16) & 0xFF;
    const g2 = (color2 >> 8) & 0xFF;
    const b2 = color2 & 0xFF;

    // Compute the distance using Euclidean formula
    const distance = Math.sqrt(
        Math.pow(r2 - r1, 2) +
        Math.pow(g2 - g1, 2) +
        Math.pow(b2 - b1, 2)
    );

    return distance;    
}  

export function formatHkBadge(name: string, settingsStore: any) {
    return settingsStore.hotKeys.find((x: any) => x.name == name)?.keys.map((x: any) => x.toLocaleUpperCase().replace('CONTROL', 'Ctrl').replace('META', '⌘')).join(' + ');
}

export function toggleCursor(cursor: string) {
    let labelContainer = document.getElementById('labelContainer');
    // remove class
    labelContainer?.classList.remove('cursor-draw');
    labelContainer?.classList.remove('cursor-move');
    labelContainer?.classList.remove('cursor-ab');
    labelContainer?.classList.remove('cursor-bucket');
    labelContainer?.classList.remove('cursor-wand');
    labelContainer?.classList.remove('cursor-delete');

    // add class
    labelContainer?.classList.add(`cursor-${cursor}`);

}

export function invertColor(r: number, g: number, b: number): string {
    const invertedR = 255 - r;
    const invertedG = 255 - g;
    const invertedB = 255 - b;
    return `rgb(${invertedR}, ${invertedG}, ${invertedB})`;
  }