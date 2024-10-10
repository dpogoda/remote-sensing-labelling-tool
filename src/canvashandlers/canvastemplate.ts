export function getCanvasTemplate(labelStore: any, canvasId: string, tooltips: string, discretizable: boolean = false) {

    let canvas = null;
    if (labelStore.layerNameToCanvas.has(canvasId)) {
        canvas = labelStore.layerNameToCanvas.get(canvasId)!;
    } else {
        canvas = document.createElement('canvas');
    }
    canvas.width = labelStore.width;
    canvas.height = labelStore.height;
    canvas.style.imageRendering = 'pixelated';
    canvas.style.position = 'absolute';
    canvas.style.top = '0';
    canvas.style.left = '0';
    canvas.id = canvasId;
    if (!labelStore.layerNameDrawerSettings.has(canvasId)) {
        labelStore.addLayer(canvasId, canvas, discretizable);
        labelStore.tooltips[canvasId] = tooltips;
    }

    return canvas;

}