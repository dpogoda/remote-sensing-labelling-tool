self.addEventListener('message', (event) => {
    const { drawingPixels, bands } = event.data;

    // Assuming bands are linear arrays (1D)
    const N = bands.b2.length;
    const newImageData = new Uint8ClampedArray(N * 4); // RGBA for each pixel

    // Function to calculate Euclidean distance between two sets of band values
    const calculateDistance = (a: number[], b: number[]) => {
        let sum = 0;
        for (let i = 0; i < a.length; i++) {
            sum += (a[i] - b[i]) ** 2;
        }
        return Math.sqrt(sum);
    };

    // Iterate over all pixels in the source image
    for (let i = 0; i < N; i++) {
        let minDistance = Infinity;
        let closestColor = null;

        // Retrieve the band values for the current pixel
        const currentPixelBands = [
            bands.b2[i], bands.b3[i], bands.b4[i], bands.b1[i], bands.b5[i],
            bands.b6[i], bands.b7[i], bands.b8[i], bands.b9[i],
            bands.b11[i], bands.b12[i], bands.b8a[i]
        ];

        // Compare current pixel to each labeled pixel
        Object.keys(drawingPixels).forEach((key) => {
            const labeledPixel = drawingPixels[key];
            const labeledBands = [
                labeledPixel.b2[0], labeledPixel.b3[0], labeledPixel.b4[0], labeledPixel.b1[0], labeledPixel.b5[0],
                labeledPixel.b6[0], labeledPixel.b7[0], labeledPixel.b8[0], labeledPixel.b9[0],
                labeledPixel.b11[0], labeledPixel.b12[0], labeledPixel.b8a[0]
            ];

            const distance = calculateDistance(currentPixelBands, labeledBands);
            if (distance < minDistance) {
                minDistance = distance;
                closestColor = key.split('-').map(Number); // Convert color key back to RGB
            }
        });

        // Set the pixel in the new image data to the closest labeled color
        if (closestColor) {
            newImageData[i * 4] = closestColor[0]; // R
            newImageData[i * 4 + 1] = closestColor[1]; // G
            newImageData[i * 4 + 2] = closestColor[2]; // B
            newImageData[i * 4 + 3] = 255; // A (full opacity)
        }
    }

    // Send the result back to the main thread
    self.postMessage({ newImageData });
});

