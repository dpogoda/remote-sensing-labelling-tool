import type { TypedArray } from "geotiff";

export function normalizeBy10000(img: Uint16Array[], width: number, height: number): ImageData {
    const r = img[0];
    const g = img[1];
    const b = img[2];

    const returnImage = new ImageData(width, height);
    for (let i = 0; i < width * height; i++) {
        const normR = Math.floor(r[i] / 10000 * 255);
        const normG = Math.floor(g[i] / 10000 * 255);
        const normB = Math.floor(b[i] / 10000 * 255);

        returnImage.data[i * 4] = normR;
        returnImage.data[i * 4 + 1] = normG;
        returnImage.data[i * 4 + 2] = normB;
        returnImage.data[i * 4 + 3] = 255;

    }
    return returnImage;
}

export function normalizeByHistogram(img: Uint16Array[], width: number, height: number): ImageData {
    const r = img[0];
    const g = img[1];
    const b = img[2];

    const returnImage = new ImageData(width, height);

    const equalize = (channel: any) => {
        const numBins = 256;
        const hist = new Array(numBins).fill(0);
        const cdf = new Array(numBins).fill(0);

        // Compute the histogram
        for (let i = 0; i < channel.length; i++) {
            hist[channel[i]]++;
        }

        // Compute the CDF
        cdf[0] = hist[0];
        for (let i = 1; i < numBins; i++) {
            cdf[i] = cdf[i - 1] + hist[i];
        }

        // Normalize the CDF
        const cdfMin = cdf.find(value => value !== 0); // first non-zero value
        const cdfMax = cdf[numBins - 1];
        const scale = 255 / (cdfMax - cdfMin);
        for (let i = 0; i < numBins; i++) {
            cdf[i] = Math.round((cdf[i] - cdfMin) * scale);
        }

        // Map the original values to the equalized values
        const equalizedChannel = new Uint8Array(channel.length);
        for (let i = 0; i < channel.length; i++) {
            equalizedChannel[i] = cdf[channel[i]];
        }

        return equalizedChannel;
    };

    const rEqualized = equalize(r);
    const gEqualized = equalize(g);
    const bEqualized = equalize(b);

    for (let i = 0; i < width * height; i++) {
        returnImage.data[i * 4] = rEqualized[i];
        returnImage.data[i * 4 + 1] = gEqualized[i];
        returnImage.data[i * 4 + 2] = bEqualized[i];
        returnImage.data[i * 4 + 3] = 255; // Alpha channel
    }

    return returnImage;
}

export function normalizeBy1And99Percentile(img: Uint16Array[], width: number, height: number): ImageData {
    console.log('A')
    const r = img[0];
    console.log('B')
    const g = img[1];
    console.log('C')
    const b = img[2];

    console.log('..', width, height);

    const returnImage = new ImageData(width, height);
    const rSorted = r.slice().sort((a, b) => a - b);
    const gSorted = g.slice().sort((a, b) => a - b);
    const bSorted = b.slice().sort((a, b) => a - b);

    const r1 = rSorted[Math.floor(rSorted.length * 0.01)];
    const r99 = rSorted[Math.floor(rSorted.length * 0.99)];
    const g1 = gSorted[Math.floor(gSorted.length * 0.01)];
    const g99 = gSorted[Math.floor(gSorted.length * 0.99)];
    const b1 = bSorted[Math.floor(bSorted.length * 0.01)];
    const b99 = bSorted[Math.floor(bSorted.length * 0.99)];

    for (let i = 0; i < width * height; i++) {
        const normR = Math.floor((r[i] - r1) / (r99 - r1) * 255);
        const normG = Math.floor((g[i] - g1) / (g99 - g1) * 255);
        const normB = Math.floor((b[i] - b1) / (b99 - b1) * 255);

        returnImage.data[i * 4] = normR;
        returnImage.data[i * 4 + 1] = normG;
        returnImage.data[i * 4 + 2] = normB;
        returnImage.data[i * 4 + 3] = 255;

    }
    return returnImage;
}

function getMin(array: TypedArray) {
    let min = array[0];
    for (let i = 1; i < array.length; i++) {
        if (array[i] < min) {
            min = array[i];
        }
    }
    return min;
}

function getMax(array: TypedArray) {
    let max = array[0];
    for (let i = 1; i < array.length; i++) {
        if (array[i] > max) {
            max = array[i];
        }
    }
    return max;
}

export function normalizeByMinMax(img: Uint16Array[], width: number, height: number): ImageData {
    const r = img[0];
    const g = img[1];
    const b = img[2];

    const returnImage = new ImageData(width, height);
    const rMin = getMin(r);
    const rMax = getMax(r);
    const gMin = getMin(g);
    const gMax = getMax(g);
    const bMin = getMin(b);
    const bMax = getMax(b);

    for (let i = 0; i < width * height; i++) {
        const normR = Math.floor((r[i] - rMin) / (rMax - rMin) * 255);
        const normG = Math.floor((g[i] - gMin) / (gMax - gMin) * 255);
        const normB = Math.floor((b[i] - bMin) / (bMax - bMin) * 255);

        returnImage.data[i * 4] = normR;
        returnImage.data[i * 4 + 1] = normG;
        returnImage.data[i * 4 + 2] = normB;
        returnImage.data[i * 4 + 3] = 255;

    }
    return returnImage;
}

export function normalizeBy5And95Percentile(img: Uint16Array[], width: number, height: number): ImageData {
    const r = img[0];
    const g = img[1];
    const b = img[2];

    const returnImage = new ImageData(width, height);
    const rSorted = r.slice().sort((a, b) => a - b);
    const gSorted = g.slice().sort((a, b) => a - b);
    const bSorted = b.slice().sort((a, b) => a - b);

    const r1 = rSorted[Math.floor(rSorted.length * 0.05)];
    const r99 = rSorted[Math.floor(rSorted.length * 0.95)];
    const g1 = gSorted[Math.floor(gSorted.length * 0.05)];
    const g99 = gSorted[Math.floor(gSorted.length * 0.95)];
    const b1 = bSorted[Math.floor(bSorted.length * 0.05)];
    const b99 = bSorted[Math.floor(bSorted.length * 0.95)];

    for (let i = 0; i < width * height; i++) {
        const normR = Math.floor((r[i] - r1) / (r99 - r1) * 255);
        const normG = Math.floor((g[i] - g1) / (g99 - g1) * 255);
        const normB = Math.floor((b[i] - b1) / (b99 - b1) * 255);

        returnImage.data[i * 4] = normR;
        returnImage.data[i * 4 + 1] = normG;
        returnImage.data[i * 4 + 2] = normB;
        returnImage.data[i * 4 + 3] = 255;

    }
    return returnImage;
}

export function normalizeByDynamicWorldPercentiles(img: Uint16Array[], width: number, height: number): ImageData {
    const r = img[0];
    const g = img[1];
    const b = img[2];

    const percentiles = [
        [1.7417268007636313, 2.023298706048351], // b
        [1.7261204997060209, 2.038905204308012], // g
        [1.6798346251414997, 2.179592821212937], // r
    ]

    //     image = np.log(image * 0.005 + 1)
    // image = (image - NORM_PERCENTILES[:, 0]) / NORM_PERCENTILES[:, 1]

    // # Get a sigmoid transfer of the re-scaled reflectance values.
    // image = np.exp(image * 5 - 1)
    // image = image / (image + 1)


    const returnImage = new ImageData(width, height);

    for (let i = 0; i < width * height; i++) {

        let r_ = Math.log10(r[i] * 0.005 + 1);
        let g_ = Math.log10(g[i] * 0.005 + 1);
        let b_ = Math.log10(b[i] * 0.005 + 1);

        let normR = (r_ - percentiles[2][0]) / (percentiles[2][1]);
        let normG = (g_ - percentiles[1][0]) / (percentiles[1][1]);
        let normB = (b_ - percentiles[0][0]) / (percentiles[0][1]);

        normR = Math.exp(normR * 5 - 1);
        normR = normR / (normR + 1);

        normG = Math.exp(normG * 5 - 1);
        normG = normG / (normG + 1);

        normB = Math.exp(normB * 5 - 1);
        normB = normB / (normB + 1);


        returnImage.data[i * 4] = Math.floor(normR * 255);
        returnImage.data[i * 4 + 1] = Math.floor(normG * 255);
        returnImage.data[i * 4 + 2] = Math.floor(normB * 255);
        returnImage.data[i * 4 + 3] = 255;

    }
    return returnImage;

}