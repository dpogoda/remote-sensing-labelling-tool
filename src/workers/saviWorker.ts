// saviWorker.ts
// import { getCanvasTemplate } from "../canvashandlers/canvastemplate";

self.addEventListener('message', (event) => {
    const b8Raw: Uint16Array = event.data.b8Raw;
    const rRaw: Uint16Array = event.data.rRaw;
    const width: number = event.data.width;
    const height: number = event.data.height;

    const saviArray: number[] = [];
    for (let i = 0; i < b8Raw.length; i++) {
        let savi = (1.5 * (b8Raw[i] - rRaw[i])) / (b8Raw[i] + rRaw[i] + 0.5);
        saviArray.push(savi);
    }

    // const ctx = canvas.getContext('2d');
    const imageData = new ImageData(width, height);
    // if (ctx) {
    for (let i = 0; i < saviArray.length; i++) {
        imageData.data[i * 4] = saviArray[i] * 255;
        imageData.data[i * 4 + 1] = saviArray[i] * 255;
        imageData.data[i * 4 + 2] = saviArray[i] * 255;
        imageData.data[i * 4 + 3] = 255;
    }
    // }

    self.postMessage({
        imageData
    });
});
