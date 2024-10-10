import { getCanvasTemplate } from "../canvastemplate";

export function loadNDSI(labelStore: any) {

    let tooltips = 'NDSI is specifically designed to detect salinity levels in soil and vegetation using specific bands that are sensitive to salt content.';
    let canvas = getCanvasTemplate(labelStore, 'NDSI', tooltips, true);

    let ndsiArray: number[] = [];
    for (let i = 0; i < labelStore.b8Raw.length; i++) {
        let ndsi = (labelStore.rgbRaw[0][i] - labelStore.b8aRaw[i]) / (labelStore.rgbRaw[0][i] + labelStore.b8aRaw[i]);
        ndsiArray.push(ndsi);
    }

    let ctx = canvas.getContext('2d');
    if (ctx) {
        // ctx.putImageData(this.rgbNormalised, 0, 0);
        let ndviImageData = ctx!.createImageData(labelStore.width, labelStore.height);
        for (let i = 0; i < ndsiArray.length; i++) {
            ndviImageData.data[i * 4] = ndsiArray[i] * 255;
            ndviImageData.data[i * 4 + 1] = ndsiArray[i] * 255;
            ndviImageData.data[i * 4 + 2] = ndsiArray[i] * 255;
            ndviImageData.data[i * 4 + 3] = 255;
        }
        ctx!.putImageData(ndviImageData, 0, 0);
        ctx!.imageSmoothingEnabled = false;
    }

}