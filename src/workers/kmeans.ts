export class KMeans {
    centroids: number[][] = [];

    constructor(private k: number) {}

    fit(data: number[][]) {
        // Initialize centroids randomly
        this.centroids = this.initializeCentroids(data);

        let assignments = new Array(data.length);
        let oldAssignments;
        
        do {
            oldAssignments = [...assignments];

            // Assign each data point to the nearest centroid
            for (let i = 0; i < data.length; i++) {
                assignments[i] = this.getNearestCentroidIndex(data[i]);
            }

            // Recalculate the centroids based on current assignments
            this.centroids = this.calculateNewCentroids(data, assignments);

        } while (!this.areAssignmentsEqual(assignments, oldAssignments));
    }

    predict(data: number[][]): number[] {
        return data.map(pixel => this.getNearestCentroidIndex(pixel));
    }

    private initializeCentroids(data: number[][]): number[][] {
        let centroids = [];
        for (let i = 0; i < this.k; i++) {
            centroids.push(data[Math.floor(Math.random() * data.length)]);
        }
        return centroids;
    }

    private getNearestCentroidIndex(pixel: number[]): number {
        let minDist = Infinity;
        let nearestIndex = 0;
        for (let i = 0; i < this.centroids.length; i++) {
            let dist = this.euclideanDistance(pixel, this.centroids[i]);
            if (dist < minDist) {
                minDist = dist;
                nearestIndex = i;
            }
        }
        return nearestIndex;
    }

    private calculateNewCentroids(data: number[][], assignments: number[]): number[][] {
        let sums = new Array(this.k).fill(0).map(() => [0, 0, 0]);
        let counts = new Array(this.k).fill(0);

        for (let i = 0; i < data.length; i++) {
            let centroidIndex = assignments[i];
            sums[centroidIndex] = sums[centroidIndex].map((sum, j) => sum + data[i][j]);
            counts[centroidIndex]++;
        }

        return sums.map((sum, i) => sum.map(value => value / (counts[i] || 1)));
    }

    private euclideanDistance(a: number[], b: number[]): number {
        return Math.sqrt(a.reduce((sum, val, i) => sum + Math.pow(val - b[i], 2), 0));
    }

    private areAssignmentsEqual(a: number[], b: number[]): boolean {
        return a.every((val, i) => val === b[i]);
    }
}