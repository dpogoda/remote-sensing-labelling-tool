<script setup lang="ts">

import Header from '@/views/editor/components/Header.vue';
import Loading from '@/views/editor/components/Loading.vue';
import Map from '@/views/editor/components/Map.vue';
import Margin from "@/views/editor/components/Margin.vue";
import _, { } from 'lodash';
import 'esri-leaflet';
import { onBeforeRouteUpdate, useRoute } from 'vue-router'
import { useLabelCanvasStore } from '@/stores/canvasHandlerStore';
import { ref, watch, type Ref } from 'vue';
import { onMounted } from 'vue';
import { onBeforeUnmount } from 'vue';
import config from '@/config';
import { contrastImage, adjustBrightness } from '@/canvashandlers/drawingtools/Simple';
import { LayersHandler } from '@/eventhandlers/LayersHandler';
import { PanzoomHandler } from '@/eventhandlers/PanzoomHandler';
import { CursorShadowHandler } from '@/eventhandlers/CursorShadowHandler';
import { ActionEventHandler } from '@/eventhandlers/ActionEventHandler';
import { useTheme } from 'vuetify';
import TabFill from './components/TabFill.vue';
import Upload from '@/components/Upload.vue';
import { useNavStore } from '@/stores/navStore';

const route = useRoute();
const theme = useTheme();

const labelCanvasStore = useLabelCanvasStore();
const navStore = useNavStore();

const showClassLegend: Ref<boolean> = ref(false);

let isMounted = false;

function adjustContainerSize() {
    let labelContainer = document.getElementById('labelContainer');
    if (labelContainer) {
        labelContainer.style.width = labelCanvasStore.width + 'px';
        labelContainer.style.height = labelCanvasStore.height + 'px';
    }
}

watch(() => labelCanvasStore.propMaskActive, (newLayer) => {
    if (newLayer) {
        document.getElementById('probabilities')!.style!.opacity = '1';
    } else {
        document.getElementById('probabilities')!.style!.opacity = '0';
    }

});

watch(() => labelCanvasStore.rawMapContrast, (newVal) => {
    const canvas: HTMLCanvasElement = labelCanvasStore.layerNameToCanvas.get('Source Image')!;
    const ctx = canvas.getContext('2d');
    if (canvas && ctx) {
        const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const imgDataCopy = new ImageData(new Uint8ClampedArray(labelCanvasStore.rgbNormalised.data), imgData.width, imgData.height);
        const contrastedImgData = contrastImage(imgDataCopy, newVal);
        ctx.putImageData(contrastedImgData, 0, 0);
    }
});

watch(() => labelCanvasStore.rawMapBrightness, (newVal) => {
    const canvas: HTMLCanvasElement = labelCanvasStore.layerNameToCanvas.get('Source Image')!;
    const ctx = canvas.getContext('2d');
    if (canvas && ctx) {
        const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const imgDataCopy = new ImageData(new Uint8ClampedArray(labelCanvasStore.rgbNormalised.data), imgData.width, imgData.height);
        const brightenedImgData = adjustBrightness(imgDataCopy, newVal);
        ctx.putImageData(brightenedImgData, 0, 0);
    }
});

watch(() => labelCanvasStore.rgbNormalised, () => {
    LayersHandler.getInstance().clearSourceCanvas();

    adjustContainerSize();

    let patchNumber = labelCanvasStore.listOfImages.find(x => x.fullTitle === labelCanvasStore.currentImage.fullTitle)?.patchNumber;
    // each row has config.patchColumns patches
    let row = Math.floor(patchNumber! / config.patchColumns);
    let col = patchNumber! % config.patchColumns;

    let dashedLine = document.getElementById('dashedLine');
    dashedLine!.style.top = row * config.patchSize + 'px';
    dashedLine!.style.left = col * config.patchSize + 'px';

    LayersHandler.getInstance().clearDrawingCanvas();
});

watch(() => labelCanvasStore.layerNameToCanvas, () => {
    LayersHandler.getInstance().clearLayerCanvases();
    for (let i = labelCanvasStore.layerNameDisplayOrder.length - 1; i >= 0; i--) {
        let layerName = labelCanvasStore.layerNameDisplayOrder[i];
        let canvas = labelCanvasStore.layerNameToCanvas.get(layerName);
        if (canvas) {
            document.getElementById('layers')?.appendChild(canvas);
        }
    }
    labelCanvasStore.drawingLayerNameDisplayOrder.forEach((layerName) => {
        let canvas = labelCanvasStore.layerNameToCanvas.get(layerName);
        if (canvas) {
            document.getElementById('layers')?.appendChild(canvas);
        }
    });

}, { deep: true });

watch(() => labelCanvasStore.panMoveActive, (isActive) => {
    if (isActive) {
        // document.getElementById('panContainer')!.style.cursor = 'grab';
        PanzoomHandler.getInstance().addPanzoom(document.getElementById('panContainer')!);
    } else {
        // document.getElementById('panContainer')!.style.cursor = 'crosshair';
        if (PanzoomHandler.getInstance().panzoom) {
            PanzoomHandler.getInstance().lastPan = PanzoomHandler.getInstance().panzoom!.getPan();
            PanzoomHandler.getInstance().lastPanScale = PanzoomHandler.getInstance().panzoom!.getScale();
            PanzoomHandler.getInstance().lastPanOptions = PanzoomHandler.getInstance().panzoom!.getOptions();
            PanzoomHandler.getInstance().lastLabelContainerStyle = document.getElementById('panContainer')!.style.transform;
            PanzoomHandler.getInstance().removePanZoom();
        }
    }
});


// watch(() => labelCanvasStore.intensityFillerTolerance, newTolerance => {
//     console.log(newTolerance);
//     prefillAutofill(newTolerance);
// });

// watch(() => labelCanvasStore.intensityFillerMenuOpen, isOpen => {
//     if (isOpen) {
//         prefillAutofill(labelCanvasStore.intensityFillerTolerance);
//     } else {
//         const autofillCanvas = document.getElementById('autofill') as HTMLCanvasElement;
//         const autofillCtx = autofillCanvas.getContext('2d');
//         autofillCtx?.clearRect(0, 0, autofillCanvas.width, autofillCanvas.height);
//         labelCanvasStore.intensityAutoFillPixel = new Uint8ClampedArray([0, 0, 0, 0]);
//         labelCanvasStore.intensityImagePixel = [];
//         console.log('closing')
//     }
// });

// watch(() => labelCanvasStore.listOfImages, () => {
//     console.log(isMounted);
//     if (isMounted) {
//         console.log("A")
//         labelCanvasStore.setCurrentImage(route.query.title as string, route.query['full-title'] as string);
//         labelCanvasStore.cleanAndLoadNewImage(route.query.title as string).then(() => {
//             labelCanvasStore.selectLayer('Drawing Layer 1')
//         })
//     }
// });


/**
 * - set the current image
 * - clean and load the new image
 */
onBeforeRouteUpdate((to, from, next) => {
    labelCanvasStore.setCurrentImage(to.query.title as string, to.query['full-title'] as string);
    labelCanvasStore.selectLayer('');
    labelCanvasStore.cleanAndLoadNewImage(to.query.title as string);
    next();
});

/**
 * - update cursor size
 */
watch(() => labelCanvasStore.penSize, (newSize) => {
    // update cursor shadow
    CursorShadowHandler.getInstance().updateCursorShadow();
})

/**
 * - Wait for the images to load
 * - Order the layers
 * - Add panzoom
 * - Add cursor shadow
 */
onMounted(async () => {
    // while (!labelCanvasStore.listOfImages.length) {
    //     await new Promise(resolve => setTimeout(resolve, 100));
    // }
    // labelCanvasStore.setCurrentImage(route.query.title as string, route.query['full-title'] as string);
    // await labelCanvasStore.cleanAndLoadNewImage(route.query.title as string)
    // LayersHandler.getInstance().orderLayers('Drawing Layer 1')

    // PanzoomHandler.getInstance().addPanzoom(document.getElementById('panContainer')!);
    // CursorShadowHandler.getInstance().addMouseOverContainer();
    // PanzoomHandler.getInstance().addRightMouseButtonDownEvent();
    // PanzoomHandler.getInstance().addRightMouseButtonUpEvent();
    // ActionEventHandler.getInstance().updateMouseListeners();

    // isMounted = true;
});

onBeforeUnmount(() => {
    PanzoomHandler.getInstance().removePanZoom();
    CursorShadowHandler.getInstance().removeMouseOverContainer();
});

</script>


<template>
    <!-- <Headline /> -->
    <div style="position: relative;" oncontextmenu="return false;">
        <!-- <BaseBreadcrumb :title="page.title" :breadcrumbs="breadcrumbs"></BaseBreadcrumb> -->
        <Loading />
        <!-- <Header /> -->
        <v-main style="min-height: 100vh">

            <v-card v-if="labelCanvasStore.bucketFill.active" style="z-index: 99; position: absolute; top: 10px; width: 400px; left: calc(50% - 100px); padding: 5px; height: 50px;" class="d-flex align-center justify-center">
                <p>Bucket Fill Tolerance</p>
                <div class="ma-3"></div>
                <v-slider hide-details step="1" min="0" max="100" v-model="labelCanvasStore.bucketFillTolerance"></v-slider>
            </v-card>

            <!-- <v-file-input multiple label="File input" @change="handleFileUpload"></v-file-input>
                <v-btn @click="processFile">Upload GeoTiff</v-btn> -->
            <!-- <FileUploader :fileType="FileType.Tiff" buttonText="Upload GeoTIFF" /> -->

            <Upload v-if="navStore.uploadActive" />
            <div @mouseenter="showClassLegend = true" @mouseleave="showClassLegend = false"
                style="position: absolute; bottom:0; left: 0; height: 100vh; z-index: 1;">
                <perfect-scrollbar class="scrollnavbar">
                    <div @click="labelCanvasStore.selectClass(labelClass.className)"
                        v-for="labelClass in labelCanvasStore.classDetails" :key="labelClass.id"
                        style="cursor: pointer; display: flex; align-items: center; margin: 20px;">
                        <div :style="{ width: '20px', height: '20px', backgroundColor: labelClass.color }" />
                        <Margin />
                        <transition name="fade">
                            <div v-show="showClassLegend" class="legend-text text-no-wrap text-truncate" :style="{
                                color: labelCanvasStore.theme === 'PurpleTheme' ? theme.current.value.colors.primary : 'lime'
                            }">{{
                labelClass.className }}</div>
                        </transition>
                    </div>
                    <div style="height: 100px" />
                </perfect-scrollbar>
            </div>

            <img src="" id="colorbar"
                style="position: absolute; top: 20px; right: 0; width: 200; height: 400; background: lightgreen; z-index: 2;"
                :style="{
                display: labelCanvasStore.selectedLayer === 'Heatmap' || labelCanvasStore.selectedLayer === 'Contour' ? 'block' : 'none'
                }" />

            <TabFill />

            <div id="panContainer">
                <div id="labelContainer">
                    <div id="sourceImage"></div>
                    <div id="layers"></div>
                    <div id="probabilities"></div>
                    <div id="drawingContainer"></div>
                    <canvas id="cursorShadow"></canvas>
                    <canvas id="certainties"></canvas>
                    <canvas id="autofill"></canvas>
                    <div id="dashedLine"></div>
                </div>
            </div>
            <Map />
        </v-main>
    </div>

</template>

<style>
#labelContainer {
    position: relative;
    /* height: 100vh; */
    /* todo */
    overflow: hidden;
}

/* #dashedLine {
    position: absolute;
    width: 128px;
    height: 128px;
    outline: 2px dashed lime;
    top: 0px;
    left: 0px;
    pointer-events: none;
} */

.legend-text {
    height: 20px;
    /* Adjust this height based on your text content */
    line-height: 20px;
    /* Ensure text is vertically centered */
    overflow: hidden;
    /* Ensure text doesn't overflow the container */
    /* color: lime */
}

.fade-enter-active,
.fade-leave-active {
    transition: opacity 0.5s ease;
}

.fade-enter,
.fade-leave-to {
    opacity: 0;
}

#labelContainer.cursor-draw {
    cursor: url('../../assets/cursors/draw-pen.svg'), auto;
}

#labelContainer.cursor-move {
    cursor: move;
}

#labelContainer.cursor-ab {
    cursor: url('../../assets/cursors/ab-testing.svg'), auto;
}

#labelContainer.cursor-bucket {
    cursor: url('../../assets/cursors/format-color-fill.svg'), auto;
}

#labelContainer.cursor-wand {
    cursor: url('../../assets/cursors/auto-fix.svg'), auto;
}

#labelContainer.cursor-delete {
    cursor: url('../../assets/cursors/eraser.svg'), auto;
}

</style>