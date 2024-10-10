// kmeansWorker.ts
import { KMeans } from './kmeans'; // Import the KMeans class

self.addEventListener('message', (event) => {
    const { pixels, k } = event.data;

    // Perform K-means clustering
    const kmeans = new KMeans(k);
    kmeans.fit(pixels);
    const labels = kmeans.predict(pixels);
    const centroids = kmeans.centroids;

    // Return the clusters and centroids back to the main thread
    self.postMessage({ labels, centroids });
});

// KMeans class would be the same as the one shared earlier
