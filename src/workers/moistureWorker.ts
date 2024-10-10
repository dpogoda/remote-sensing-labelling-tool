self.addEventListener('message', (event) => {
    const b8Raw: Uint16Array = event.data.b8Raw;
    const b11Raw: Uint16Array = event.data.b11Raw;
    const width: number = event.data.width;
    const height: number = event.data.height;

    const ndwiArray: number[] = [];
    for (let i = 0; i < b8Raw.length; i++) {
        let ndwi = ((b8Raw[i] - b11Raw[i]) / (b8Raw[i] + b11Raw[i]));
        ndwiArray.push(ndwi);
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