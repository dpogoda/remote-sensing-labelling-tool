<script setup lang="ts">

import { ref } from 'vue';
import { FileType } from '@/views/editor/components/fileTypes';
import { useLabelCanvasStore } from '@/stores/canvasHandlerStore';
import GeoTIFF, { fromArrayBuffer, type TypedArray } from 'geotiff';


const props = defineProps<{
    fileType: FileType;
    buttonText: string;
}>();

const files = ref<FileList | null>(null);
const fileNameToTiff = new Map<string, GeoTIFF>();
const labelStore = useLabelCanvasStore();

function onFileChange(event: Event) {
    const target = event.target as HTMLInputElement;
    files.value = target.files;
}

function findBandByStringInFilename(searchString: string): GeoTIFF | null {
    for (const [filename, tiff] of fileNameToTiff) {
        if (filename.includes(searchString)) {
            return tiff;
        }
    }
    return null;
}

async function processLayerFile() {
    if (!files.value || files.value.length === 0) {
        alert('Please select some files');
        return;
    }

    // const images: HTMLCanvasElement[] = [];
    for (let i = 0; i < files.value.length; i++) {
        const reader = new FileReader();
        reader.onload = function (e) {
            const img = new Image();
            img.onload = function () {
                const layerName = labelStore.getNextLayerName;
                const canvas = document.createElement('canvas');
                const ctx = canvas!.getContext('2d');
                canvas.width = labelStore.width;
                canvas.height = labelStore.height;
                canvas.style.position = 'absolute';
                canvas.style.top = '0';
                canvas.style.left = '0';
                canvas.id = labelStore.getNextLayerName;
                ctx!.drawImage(img, 0, 0);
                // const imageData = ctx!.getImageData(0, 0, canvas!.width, canvas!.height);
                // images.push(canvas);
                labelStore.addLayer(layerName, canvas);
            };
            img.src = e.target!.result as string;
        };
        reader.readAsDataURL(files.value[i]);
    }

    // while(images.length < files.value.length) {
    //     await new Promise(resolve => setTimeout(resolve, 100));
    // }

}

async function processGeoTiff() {
    if (!files.value || files.value.length === 0) {
        alert('Please select some files');
        return;
    }

    const tiffFiles: GeoTIFF[] = [];

    for (let i = 0; i < files.value.length; i++) {
        const arrayBuffer = await files.value[i].arrayBuffer();
        const tiff = await fromArrayBuffer(arrayBuffer);
        tiffFiles.push(tiff);
        fileNameToTiff.set(files.value[i].name, tiff);
        // geoTiffs.value.push(tiff);
    }

    // we pass the reference since we may decouple the function from this module
    let redBand = findBandByStringInFilename('B4');
    let greenBand = findBandByStringInFilename('B3');
    let blueBand = findBandByStringInFilename('B2');

    if (!redBand || !greenBand || !blueBand) {
        alert('Could not find all bands');
        return;
    }

    const redImage = await redBand.getImage();
    const greenImage = await greenBand.getImage();
    const blueImage = await blueBand.getImage();

    const redRasters = await redImage.readRasters();
    const greenRasters = await greenImage.readRasters();
    const blueRasters = await blueImage.readRasters();

    labelStore.setWidth(redImage.getWidth());
    labelStore.setHeight(redImage.getHeight());
    labelStore.setRGBraw([redRasters[0] as Uint16Array, greenRasters[0] as Uint16Array, blueRasters[0] as Uint16Array]);

}

function processFile() {
    if (!files.value || files.value.length === 0) {
        alert('Please select some files');
        return;
    }

    if (props.fileType === FileType.Tiff) {
        processGeoTiff();
    } else if (props.fileType === FileType.CommonImage) {
        processLayerFile();
    }

}



</script>

<template>
    <div>
        <v-file-input multiple label="File input" @change="onFileChange"></v-file-input>
        <v-btn size="small" @click="processFile">{{ props.buttonText }}</v-btn>
    </div>
</template>