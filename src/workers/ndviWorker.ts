self.addEventListener('message', (event) => {
    const b8Raw: Uint16Array = event.data.b8Raw;
    const rRaw: Uint16Array = event.data.rRaw;
    const width: number = event.data.width;
    const height: number = event.data.height;

    const ndwiArray: number[] = [];
    for (let i = 0; i < b8Raw.length; i++) {
        //let ndvi = (labelStore.b8Raw[i] - labelStore.rgbRaw[0][i]) / (labelStore.b8Raw[i] + labelStore.rgbRaw[0][i]);
        let ndvi = ((b8Raw[i] - rRaw[i]) / (b8Raw[i] + rRaw[i]));
        ndwiArray.push(ndvi);
    }

    const imageData = new ImageData(width, height);
    for (let i = 0; i < ndwiArray.length; i++) {
        imageData.data[i * 4] = ndwiArray[i] * 255;
        imageData.data[i * 4 + 1] = ndwiArray[i] * 255;
        imageData.data[i * 4 + 2] = ndwiArray[i] * 255;
        imageData.data[i * 4 + 3] = 255;
    }

    self.postMessage({
        imageData
    });
});