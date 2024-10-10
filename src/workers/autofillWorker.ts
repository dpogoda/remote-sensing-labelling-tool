import config from "@/config";

self.addEventListener('message', (event) => {
    const {
        rRaw, bRaw, gRaw, b1Raw, b5Raw, b6Raw, b7Raw, b8Raw, b8aRaw, b9Raw, b11Raw, b12Raw,
        xyRRaw, xyBRaw, xyGRaw, xyB1Raw, xyB5Raw, xyB6Raw, xyB7Raw, xyB8Raw, xyB8aRaw, xyB9Raw, xyB11Raw, xyB12Raw,
        x0, y0, width, height, layersLength, tolerance, layerType, autofillColor
    } = event.data;

    // Create an OffscreenCanvas for pixel manipulation
    const autofillCanvas = new OffscreenCanvas(width, height);
    const autofillCtx = autofillCanvas.getContext('2d')!;
    const imageData = autofillCtx.createImageData(width, height);
    const autoFillData = imageData.data;



    // Iterate through each pixel to apply autofill logic based on the layer type
    for (let i = 0, j = 0; i < autoFillData.length; i += 4, j++) {
        let xCoord = j % width;
        let yCoord = Math.floor(j / width);

        // Skip if the pixel is outside the patch area
        if (xCoord < x0 || xCoord >= x0 + config.patchSize || yCoord < y0 || yCoord >= y0 + config.patchSize) {
            continue;
        }

        // Process each layer type case
        switch (layerType) {
            case 'NDVI': {
                const intensityValue = (b8Raw[j] - rRaw[j]) / (b8Raw[j] + rRaw[j]);
                const autofillReferencePixel = [[(xyB8Raw[0] - xyRRaw[0]) / (xyB8Raw[0] + xyRRaw[0])]];
                if (Math.abs(intensityValue - autofillReferencePixel[0][0]) < tolerance) {
                    autoFillData[i] = autofillColor[0];     // Red
                    autoFillData[i + 1] = autofillColor[1]; // Green
                    autoFillData[i + 2] = autofillColor[2]; // Blue
                    autoFillData[i + 3] = autofillColor[3]; // Alpha
                }
                break;
            }
            case 'SAVI': {
                const intensityValue = (1.5 * (b8Raw[j] - rRaw[j])) / (b8Raw[j] + rRaw[j] + 0.5);
                const autofillReferencePixel = [[1.5 * (xyB8Raw[0] - xyRRaw[0]) / (xyB8Raw[0] + xyRRaw[0] + 0.5)]];
                if (Math.abs(intensityValue - autofillReferencePixel[0][0]) < tolerance) {
                    autoFillData[i] = autofillColor[0];
                    autoFillData[i + 1] = autofillColor[1];
                    autoFillData[i + 2] = autofillColor[2];
                    autoFillData[i + 3] = autofillColor[3];
                }
                break;
            }
            case 'NDBI': {
                const intensityValue = (b11Raw[j] - b8Raw[j]) / (b11Raw[j] + b8Raw[j]);
                const autofillReferencePixel = [[(xyB11Raw[0] - xyB8Raw[0]) / (xyB11Raw[0] + xyB8Raw[0])]];
                if (Math.abs(intensityValue - autofillReferencePixel[0][0]) < tolerance) {
                    autoFillData[i] = autofillColor[0];
                    autoFillData[i + 1] = autofillColor[1];
                    autoFillData[i + 2] = autofillColor[2];
                    autoFillData[i + 3] = autofillColor[3];
                }
                break;
            }
            case 'NDWI': {
                const intensityValue = (bRaw[j] - b8aRaw[j]) / (bRaw[j] + b8aRaw[j]);
                const autofillReferencePixel = [[(xyBRaw[0] - xyB8aRaw[0]) / (xyBRaw[0] + xyB8aRaw[0])]];
                if (Math.abs(intensityValue - autofillReferencePixel[0][0]) < tolerance) {
                    autoFillData[i] = autofillColor[0];
                    autoFillData[i + 1] = autofillColor[1];
                    autoFillData[i + 2] = autofillColor[2];
                    autoFillData[i + 3] = autofillColor[3];
                }
                break;
            }
            case 'Moisture': {
                const intensityValue = (b8Raw[j] - b11Raw[j]) / (b8Raw[j] + b11Raw[j]);
                const autofillReferencePixel = [[(xyB8Raw[0] - xyB11Raw[0]) / (xyB8Raw[0] + xyB11Raw[0])]];
                if (Math.abs(intensityValue - autofillReferencePixel[0][0]) < tolerance) {
                    autoFillData[i] = autofillColor[0];
                    autoFillData[i + 1] = autofillColor[1];
                    autoFillData[i + 2] = autofillColor[2];
                    autoFillData[i + 3] = autofillColor[3];
                }
                break;
            }
            case 'Agriculture': {
                const intensityValue = (b8Raw[j] - b11Raw[j]) / (b8Raw[j] + b11Raw[j]);
                const autofillReferencePixel = [[(xyB8Raw[0] - xyB11Raw[0]) / (xyB8Raw[0] + xyB11Raw[0])]];
                if (Math.abs(intensityValue - autofillReferencePixel[0][0]) < tolerance) {
                    autoFillData[i] = autofillColor[0];
                    autoFillData[i + 1] = autofillColor[1];
                    autoFillData[i + 2] = autofillColor[2];
                    autoFillData[i + 3] = autofillColor[3];
                }
                break;
            }
            case 'Short Wave Infrared': {
                const autofillReferencePixel = [
                    [
                        xyB11Raw[0],
                        xyB8Raw[0],
                        xyBRaw[0]
                    ]
                ]
                if (
                    Math.abs(b11Raw[j] - autofillReferencePixel[0][0]) < tolerance &&
                    Math.abs(b8Raw[j] - autofillReferencePixel[0][1]) < tolerance &&
                    Math.abs(bRaw[j] - autofillReferencePixel[0][2]) < tolerance
                ) {
                    autoFillData[i] = autofillColor[0];
                    autoFillData[i + 1] = autofillColor[1];
                    autoFillData[i + 2] = autofillColor[2];
                    autoFillData[i + 3] = autofillColor[3];
                }
                break;
            }
            case 'RGB': {
                const autofillReferencePixel = [
                    [
                        xyRRaw[0],
                        xyGRaw[0],
                        xyBRaw[0]
                    ]
                ]
                if (
                    Math.abs(rRaw[j] - autofillReferencePixel[0][0]) < tolerance &&
                    Math.abs(gRaw[j] - autofillReferencePixel[0][1]) < tolerance &&
                    Math.abs(bRaw[j] - autofillReferencePixel[0][2]) < tolerance
                ) {
                    autoFillData[i] = autofillColor[0];
                    autoFillData[i + 1] = autofillColor[1];
                    autoFillData[i + 2] = autofillColor[2];
                    autoFillData[i + 3] = autofillColor[3];
                }
                break;
            }
            case 'NDSI': {
                const intensityValue = (rRaw[j] - b8aRaw[j]) / (rRaw[j] + b8aRaw[j]);
                const autofillReferencePixel = [[(xyRRaw[0] - xyB8aRaw[0]) / (xyRRaw[0] + xyB8aRaw[0])]];
                if (Math.abs(intensityValue - autofillReferencePixel[0][0]) < tolerance) {
                    autoFillData[i] = autofillColor[0];
                    autoFillData[i + 1] = autofillColor[1];
                    autoFillData[i + 2] = autofillColor[2];
                    autoFillData[i + 3] = autofillColor[3];
                }
                break;
            }
        }
    }

    // Post the processed image data back to the main thread
    self.postMessage({ imageData });
});
