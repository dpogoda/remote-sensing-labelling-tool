
let worker: Worker | null = null;

export function discretize(canvas: HTMLCanvasElement, k: number) {
    // let canvas = labelStore.layerNameToCanvas.get(layerName)!;
    const ctx = canvas.getContext('2d')!;
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const data = imageData.data;

    // Prepare the data for clustering (flatten the 2D image into a 1D array of pixels)
    let pixels = [];
    for (let i = 0; i < data.length; i += 4) {
        // Get the RGBA components and push them as a single array
        pixels.push([data[i], data[i + 1], data[i + 2]]);
    }

    if (worker) {
        worker.terminate();
    }


    worker = new Worker(new URL('../../workers/kmeansWorker.ts', import.meta.url), { type: 'module' });
    worker.onmessage = (event) => {
        const { labels, centroids } = event.data;

        // Replace each pixel with its corresponding cluster's centroid color
        for (let i = 0; i < labels.length; i++) {
            const centroid = centroids[labels[i]];
            data[i * 4] = centroid[0];     // Red
            data[i * 4 + 1] = centroid[1]; // Green
            data[i * 4 + 2] = centroid[2]; // Blue
            // Alpha remains the same
        }

        // Put the updated imageData back into the context
        ctx.putImageData(imageData, 0, 0);
    };


    // Send the data to the worker
    worker.postMessage({ pixels, k }); // Example k value
}
