// import type { NormType } from "@/types";
// import type { TypedArray } from "geotiff";

// self.addEventListener('message', (event) => {
//     const rRaw: Uint16Array = event.data.rRaw;
//     const gmmArray: number[][] = event.data.gmmArray;

//     let imageData: ImageData;

//     let height = gmmArray.length;
//     let width = gmmArray[0].length;

//     const returnImage = new ImageData(width, height);

//     for (let y = 0; y < height; y++) {
//         for (let x = 0; x < width; x++) {
//             const clusterNumber: number = gmmArray[y][x];
//             returnImage.data[(y * width + x) * 4] = clusterNumber * 255;
//             returnImage.data[(y * width + x) * 4 + 1] = clusterNumber * 255;
//             returnImage.data[(y * width + x) * 4 + 2] = clusterNumber * 255;
//             returnImage.data[(y * width + x) * 4 + 3] = 255;
//         }
//     }



//     // let gmmCanvas = document.createElement('canvas');
//     // gmmCanvas.width = config.patchSize //this.width;
//     // gmmCanvas.height = config.patchSize //this.height;
//     // gmmCanvas.style.position = 'absolute';
//     // gmmCanvas.style.top = patchNumberToCoords(imageOfInterest.patchNumber).y + 'px';
//     // gmmCanvas.style.left = patchNumberToCoords(imageOfInterest.patchNumber).x + 'px';
//     // gmmCanvas.style.imageRendering = 'pixelated';
//     // gmmCanvas.id = 'GMM';
//     // this.gmmArray = await getGMM(imageOfInterest.fullTitle);
//     // let height = this.gmmArray.length;
//     // let width = this.gmmArray[0].length;

//     // let gmmContext = gmmCanvas.getContext('2d');
//     // for (let y = 0; y < height; y++) {
//     //     for (let x = 0; x < width; x++) {
//     //         const clusterNumber: number = this.gmmArray[y][x];
//     //         gmmContext!.fillStyle = this.classNumberToColors[clusterNumber];
//     //         gmmContext!.fillRect(x, y, 1, 1);
//     //     }
//     // }
//     // this.addLayer('GMM', gmmCanvas);
//     // this.layerNameDrawerSettings.set('GMM', { opacity: 100, visible: true });


//     self.postMessage({
//         imageData
//     });
// });