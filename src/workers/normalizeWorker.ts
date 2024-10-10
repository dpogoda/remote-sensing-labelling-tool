import type { NormType } from "@/types";
import type { TypedArray } from "geotiff";

self.addEventListener('message', (event) => {
    const rRaw: Uint16Array = event.data.rRaw;
    const gRaw: Uint16Array = event.data.gRaw;
    const bRaw: Uint16Array = event.data.bRaw;
    const width: number = event.data.width;
    const height: number = event.data.height;
    const normType: NormType = event.data.normType;

    let imageData: ImageData;

    switch (normType) {
        case '1and99percentile':
            imageData = normalizeBy1And99Percentile([rRaw, gRaw, bRaw], width, height);
            break;
        case '5and95percentile':
            imageData = normalizeBy5And95Percentile([rRaw, gRaw, bRaw], width, height);
            break;
        case 'minmax':
            imageData = normalizeByMinMax([rRaw, gRaw, bRaw], width, height);
            break;
        case 'histogram':
            imageData = histogramEqualizationGrayScale(rRaw, width, height);
            break;
        default:
            imageData = normalizeBy10000([rRaw, gRaw, bRaw], width, height);
    }


    self.postMessage({
        imageData
    });
});


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

function normalizeBy1And99Percentile(img: Uint16Array[], width: number, height: number): ImageData {
    const r = img[0];
    const g = img[1];
    const b = img[2];

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

function normalizeByMinMax(img: Uint16Array[], width: number, height: number): ImageData {
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

function normalizeBy5And95Percentile(img: Uint16Array[], width: number, height: number): ImageData {
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

function histogramEqualizationGrayScale(img: Uint16Array, width: number, height: number): ImageData {
    const returnImage = new ImageData(width, height);
    const hist = new Array(65536).fill(0);
    for (let i = 0; i < width * height; i++) {
        hist[img[i]]++;
    }
    const cdf = new Array(65536).fill(0);
    cdf[0] = hist[0];
    for (let i = 1; i < 65536; i++) {
        cdf[i] = cdf[i - 1] + hist[i];
    }
    for (let i = 0; i < width * height; i++) {
        const norm = Math.floor(cdf[img[i]] / cdf[65535] * 255);
        returnImage.data[i * 4] = norm;
        returnImage.data[i * 4 + 1] = norm;
        returnImage.data[i * 4 + 2] = norm;
        returnImage.data[i * 4 + 3] = 255;
    }
    return returnImage;
}