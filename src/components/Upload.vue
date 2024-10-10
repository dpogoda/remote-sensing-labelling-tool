<script setup lang="ts">
import { ref } from 'vue';
import { VCard, VCardItem, VFileInput, VList, VListItem, VRow, VCol, VStepper, VSelect, VBtn, VInput, VTextField } from 'vuetify/components';
import draggable from "vuedraggable";
import { useTheme } from 'vuetify';
import GeoTIFF, { fromUrl, fromUrls, fromArrayBuffer, fromBlob, type ReadRasterResult } from 'geotiff';
import proj4 from 'proj4';
//@ts-ignore
import defs from "proj4js-definitions";
import { useLabelCanvasStore, type ClassItem } from '@/stores/canvasHandlerStore';

proj4.defs(defs);

const activeStep = ref(0);
const items = [
    { title: 'Upload files', icon: 'mdi-paperclip' },
    { title: 'Define classes', icon: 'mdi-clipboard-list' },
    { title: 'Review', icon: 'mdi-check' }
];

const classes = ref<ClassItem[]>([]);

// Array of band metadata
const bands = ref([
    { name: "B1", resolution: "60m", centralWaveLength: "443 nm", description: "Ultra Blue (Coastal and Aerosol)" },
    { name: "B2", resolution: "10m", centralWaveLength: "490 nm", description: "Blue" },
    { name: "B3", resolution: "10m", centralWaveLength: "560 nm", description: "Green" },
    { name: "B4", resolution: "10m", centralWaveLength: "665 nm", description: "Red" },
    { name: "B5", resolution: "20m", centralWaveLength: "705 nm", description: "Visible and Near Infrared (VNIR)" },
    { name: "B6", resolution: "20m", centralWaveLength: "740 nm", description: "Visible and Near Infrared (VNIR)" },
    { name: "B7", resolution: "20m", centralWaveLength: "783 nm", description: "Visible and Near Infrared (VNIR)" },
    { name: "B8", resolution: "10m", centralWaveLength: "842 nm", description: "Visible and Near Infrared (VNIR)" },
    { name: "B8A", resolution: "20m", centralWaveLength: "865 nm", description: "Visible and Near Infrared (VNIR)" },
    { name: "B9", resolution: "60m", centralWaveLength: "940 nm", description: "Short Wave Infrared (SWIR)" },
    { name: "B10", resolution: "60m", centralWaveLength: "1375 nm", description: "Short Wave Infrared (SWIR)" },
    { name: "B11", resolution: "20m", centralWaveLength: "1610 nm", description: "Short Wave Infrared (SWIR)" },
    { name: "B12", resolution: "20m", centralWaveLength: "2190 nm", description: "Short Wave Infrared (SWIR)" }
]);

const fileNameToImage: {
    [key: string]: Uint16Array;
} = {
}

const fileNameToBand: {
    [key: string]: number;
} = {
}

const fileNameToCornerCoordinates: {
    [key: string]: {
        topLeft: [number, number];
        topRight: [number, number];
        bottomLeft: [number, number];
        bottomRight: [number, number];
    };
} = {
}

// Initialize an array with empty slots for each band to store file names
const list_b = ref(Array(bands.value.length).fill(''));
const lerp = (a: number, b: number, t: number) => (1 - t) * a + t * b;

function transform(a: number, b: number, M: number[], roundToInt = false) {
  const round = (v: number) => (roundToInt ? v | 0 : v);
  return [
    round(M[0] + M[1] * a + M[2] * b),
    round(M[3] + M[4] * a + M[5] * b),
  ];
}

const labelStore = useLabelCanvasStore();

let allW = 0;
let allH = 0;

function prepareEditor() {

    fileNameToBand[list_b.value[0]] = 0;
    fileNameToBand[list_b.value[1]] = 1;
    fileNameToBand[list_b.value[2]] = 2;
    fileNameToBand[list_b.value[3]] = 3;
    fileNameToBand[list_b.value[4]] = 4;
    fileNameToBand[list_b.value[5]] = 5;
    fileNameToBand[list_b.value[6]] = 6;
    fileNameToBand[list_b.value[7]] = 7;
    fileNameToBand[list_b.value[8]] = 8;
    fileNameToBand[list_b.value[9]] = 9;
    fileNameToBand[list_b.value[10]] = 10;
    fileNameToBand[list_b.value[11]] = 11;
    fileNameToBand[list_b.value[12]] = 12;

    labelStore.prepareEditor({
        fileNameToImage,
        fileNameToCornerCoordinates,
        fileNameToBand,
        classes: classes.value,
        width: allW,
        height: allH
    });
}

function bilinearInterpolation(raster: Uint16Array, width: number, height: number, x: number, y: number): number {
  const x1 = Math.floor(x);
  const x2 = Math.min(Math.ceil(x), width - 1);
  const y1 = Math.floor(y);
  const y2 = Math.min(Math.ceil(y), height - 1);

  // Handle edge cases where x1 == x2 or y1 == y2 to avoid division by zero
  if (x1 === x2 && y1 === y2) {
    return raster[y1 * width + x1];
  }
  if (x1 === x2) {
    const Q1 = raster[y1 * width + x1];
    const Q2 = raster[y2 * width + x1];
    return ((y2 - y) / (y2 - y1)) * Q1 + ((y - y1) / (y2 - y1)) * Q2;
  }
  if (y1 === y2) {
    const Q1 = raster[y1 * width + x1];
    const Q2 = raster[y1 * width + x2];
    return ((x2 - x) / (x2 - x1)) * Q1 + ((x - x1) / (x2 - x1)) * Q2;
  }

  const Q11 = raster[y1 * width + x1];
  const Q21 = raster[y1 * width + x2];
  const Q12 = raster[y2 * width + x1];
  const Q22 = raster[y2 * width + x2];

  const R1 = ((x2 - x) / (x2 - x1)) * Q11 + ((x - x1) / (x2 - x1)) * Q21;
  const R2 = ((x2 - x) / (x2 - x1)) * Q12 + ((x - x1) / (x2 - x1)) * Q22;

  const P = ((y2 - y) / (y2 - y1)) * R1 + ((y - y1) / (y2 - y1)) * R2;

  return P;
}

async function resizeRaster(image: ReadRasterResult, newWidth: number, newHeight: number) {
  const raster = image[0] as Uint16Array;
  const oldWidth = image.width;
  const oldHeight = image.height;

  const resizedRaster = new Uint16Array(newWidth * newHeight);

  for (let y = 0; y < newHeight; y++) {
    for (let x = 0; x < newWidth; x++) {
      const oldX = (x / newWidth) * oldWidth;
      const oldY = (y / newHeight) * oldHeight;
      resizedRaster[y * newWidth + x] = Math.round(bilinearInterpolation(raster, oldWidth, oldHeight, oldX, oldY));
    }
  }

  return resizedRaster;
}


function getCorners(width: number, height: number, M: number[]) {
  function transformPixelToGeo(x: number, y: number, M: number[]) {
    const geoX = M[0] * x + M[1] * y + M[3];
    const geoY = M[4] * x + M[5] * y + M[7];
    return [geoX, geoY];
  }

  const corners = {
    topLeft: transformPixelToGeo(0, 0, M),
    topRight: transformPixelToGeo(width, 0, M),
    bottomLeft: transformPixelToGeo(0, height, M),
    bottomRight: transformPixelToGeo(width, height, M),
  };

  return corners;
}

function getCornersFromTiePoints(width: number, height: number, tiePoints: any[], pixelScale: number[]) {
  const [scaleX, scaleY] = pixelScale;
  const { i: tiePointX, j: tiePointY, x: tiePointGeoX, y: tiePointGeoY } = tiePoints[0];

  function transformPixelToGeo(x: number, y: number) {
    const geoX = tiePointGeoX + (x - tiePointX) * scaleX;
    const geoY = tiePointGeoY - (y - tiePointY) * scaleY; // Note the minus sign for y
    return [geoX, geoY];
  }

  const corners = {
    topLeft: transformPixelToGeo(0, 0),
    topRight: transformPixelToGeo(width, 0),
    bottomLeft: transformPixelToGeo(0, height),
    bottomRight: transformPixelToGeo(width, height),
  };

  return corners;
}

// const uploadedRasterImages = ref<Array<GeoTIFF.Image>>([]);

// Function to handle file changes and process GeoTIFFs
async function handleFileChange(newFiles: File[]) {
  // Clear previous file list
  list_b.value = Array(bands.value.length).fill('');

  let referenceWidth = 0;
  let referenceHeight = 0;
  for (const file of newFiles) {
    const arrayBuffer = await file.arrayBuffer();
    const tiff = await fromArrayBuffer(arrayBuffer);
    const image = await tiff.getImage();
    let w = image.getWidth();
    let h = image.getHeight();
    console.log(image);
    console.log(w, h);
    if (w > referenceWidth) {
        referenceWidth = w;
        referenceHeight = h;
    }
  }

  allW = referenceWidth;
    allH = referenceHeight;

  // Loop through each file
  for (const file of newFiles) {
    // Match the file to the appropriate band based on its name
    for (let i = bands.value.length - 1; i >= 0; i--) {
      if (file.name.toLocaleLowerCase().includes(bands.value[i].name.toLocaleLowerCase())) {
        list_b.value[i] = file.name;

        // Parse the GeoTIFF file using GeoTIFF.js
        const arrayBuffer = await file.arrayBuffer();
        const tiff = await fromArrayBuffer(arrayBuffer);
        const image = await tiff.getImage();

        const rasterImage = await image.readRasters();

        const epsgCode = image.geoKeys.ProjectedCSTypeGeoKey || image.geoKeys.GeographicTypeGeoKey;

        // Check if ModelTransformation is available
        const modelTransformation = image.fileDirectory.ModelTransformation;

        let gpsCorners = null;
        if (modelTransformation) {
            const M = modelTransformation;
            gpsCorners = getCorners(image.getWidth(), image.getHeight(), M);
        } else {
            const tiePoints = image.getTiePoints();
            const pixelScale = image.getFileDirectory().ModelPixelScale;

            if (tiePoints && pixelScale) {
                gpsCorners = getCornersFromTiePoints(image.getWidth(), image.getHeight(), tiePoints, pixelScale);
            }
        }

        if(!gpsCorners) throw new Error("No GPS corners found.");

        const utmToWgs84 = proj4('EPSG:' + epsgCode, 'EPSG:4326');
        const topLeftWGS84 = utmToWgs84.forward(gpsCorners.topLeft);
        const topRightWGS84 = utmToWgs84.forward(gpsCorners.topRight);
        const bottomLeftWGS84 = utmToWgs84.forward(gpsCorners.bottomLeft);
        const bottomRightWGS84 = utmToWgs84.forward(gpsCorners.bottomRight);

        fileNameToCornerCoordinates[file.name] = {
            topLeft: [topLeftWGS84[0], topLeftWGS84[1]],
            topRight: [topRightWGS84[0], topRightWGS84[1]],
            bottomLeft: [bottomLeftWGS84[0], bottomLeftWGS84[1]],
            bottomRight: [bottomRightWGS84[0], bottomRightWGS84[1]],
        };


        const newRaster = await resizeRaster(rasterImage, referenceWidth, referenceHeight);
        fileNameToImage[file.name] = newRaster; // rasterImage[0] as Uint16Array;

        break;
      }
    }
  }
}


const theme = useTheme();
const selectedSatellite = ref('Sentinel S2 L2A');

</script>

<template>
    <VStepper show-actions v-model="activeStep" :items="items" vertical elevation="0" class="ma-4">
        <template v-slot:item.1>
            <perfect-scrollbar class="scrollnavbar">
                <VCard class="ma-4 pa-4" outlined>
                    <VCardItem>
                        <h2 class="text-h4">1. Select the Satellite</h2>
                    </VCardItem>
                    <VSelect variant="outlined" v-model="selectedSatellite" :items="['Sentinel S2 L2A']"
                        label="Select your data source" />
                    <VCardItem>
                        <h2 class="text-h4">2. Upload your GeoTiff and other layers</h2>
                    </VCardItem>
                    <!-- <VCardItem> -->
                    <VFileInput variant="outlined" @update:modelValue="handleFileChange" label="File input"
                        placeholder="Select your files" prependIcon="mdi-paperclip" multiple />
                    <VCardItem>
                        <p>Assign your uploaded files to the correct Sentinel S2 bands. Provide at least one layer. The more complete your upload, the more indices can be computed that might help during labelling.</p>
                    </VCardItem>
                    <VCardItem>
                        <VRow>
                            <VCol cols="12" md="6">
                                <VList>
                                    <VListItem class="text-h3">Assign uploaded files to bands</VListItem>
                                    <draggable v-model="list_b">
                                        <template #item="{ element, index }">
                                            <VListItem :key="element" class="mt-2" :style="{
                                                cursor: 'grab',
                                                color: element ? theme.current.value.colors.surface : theme.current.value.colors['on-secondary'],
                                                backgroundColor: element ? theme.current.value.colors['success'] : theme.current.value.colors['secondary']
                                            }">
                                                <strong>Expecting: Sentinel S2 Band {{ bands[index].name }}, {{
                                                    bands[index].resolution
                                                }},
                                                    {{ bands[index].centralWaveLength }}</strong>
                                                <br />
                                                <em>Uploaded: {{ element?.trim() === "" ? 'Unassigned' : element }}</em>
                                                <!-- <strong>{{ element }}</strong> -->
                                            </VListItem>
                                        </template>
                                    </draggable>
                                </VList>
                            </VCol>
                        </VRow>
                    </VCardItem>
                </VCard>
            </perfect-scrollbar>
        </template>
        <template v-slot:item.2>
            <VCard>
                <VCardItem>
                    <h2 class="text-h4">Define your classes</h2>
                </VCardItem>
                <VCardItem>
                    <p>Define the classes you want to label in your data</p>
                </VCardItem>
                <VInput label="Class name" />
                <VBtn color="primary" @click="() => {
                    classes.push({ className: '', color: '#FF0000', classNumber: classes.length, displayOrder: classes.length, id: classes.length });
                }">Add class</VBtn>

                <VCardItem v-for="class_ in classes">
                    <div class="d-flex" style="max-width: 400px;">
                        <VTextField clearable variant="solo-filled" v-model="class_.className" label="Class name" />
                        <div class="ma-5" />
                        <input type="color" name="head" v-model="class_.color" />
                    </div>
                </VCardItem>

            </VCard>
        </template>
        <template v-slot:item.3>
            <perfect-scrollbar class="scrollnavbar">
                <VCard>
                    <VCardItem>
                        <h2 class="text-h4">Review your data</h2>
                    </VCardItem>
                    <VCardItem>
                        <p>Review the data you have uploaded and the classes you have defined</p>
                    </VCardItem>
                    <VCardItem>
                        <VList>
                            <VListItem class="text-h3">Uploaded files</VListItem>
                            <VList>
                                <VListItem v-for="(file, index) in list_b" :key="index">
                                    <strong>{{ bands[index].name }}: {{ file }}</strong>
                                </VListItem>
                                </VList>
                            <!-- <VListItem v-for="(file, index) in files" :key="index">
                                <strong>{{ bands[index].name }}: {{ file }}</strong>
                            </VListItem> -->
                        </VList>
                    </VCardItem>
                    <VCardItem>
                        <VList>
                            <VListItem class="text-h3">Classes</VListItem>
                            <VList>
                                <VListItem v-for="class_ in classes" :key="class_.className">
                                    <strong>{{ class_.className }}</strong>
                                    <br />
                                    <em :style="{
                                        color: class_.color
                                    }">{{ class_.color }}</em>
                                </VListItem>
                            </VList>
                        </VList>
                        </VCardItem>
                        <VBtn color="primary" @click="() => {
                            prepareEditor();
                        }">Continue</VBtn>
                </VCard>
            </perfect-scrollbar>
        </template>
    </VStepper>
</template>

<style scoped>
.band-info {
    padding: 0px;
    background-color: #f5f5f5;
    border-radius: 8px;
    margin-bottom: 8px;
}
</style>
