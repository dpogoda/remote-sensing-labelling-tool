<script setup lang="ts">
import Margin from '@/views/editor/components/Margin.vue';
import CursorPicker from '@/views/editor/components/CursorPicker.vue';
import NormalizationPicker from '@/views/editor/components/NormalizationPicker.vue';
import { useLabelCanvasStore } from '@/stores/canvasHandlerStore';
import { useSettingsStore } from '@/stores/settingStore';
import { ref, type Ref } from 'vue';
import { clearImage } from '@/canvashandlers/drawingtools/Simple';
import { HistoryHandler } from '@/eventhandlers/HistoryHandler';
import { formatHkBadge } from '@/utils/helpers/common';


const labelStore = useLabelCanvasStore();
const settingsStore = useSettingsStore();

const autofillTolerance: Ref<number> = ref(labelStore.intensityFillerTolerance);

const fillerMaxTolerance = ref(1000);
const fillerStep = ref(1);

// watch(() => labelStore.layerType, (newLayerType) => {
//     let tolerance = 2;
//     switch (newLayerType) {
//         case 'Agriculture':
//             fillerMaxTolerance.value = tolerance;
//             fillerStep.value = tolerance / 1000;
//             autofillTolerance.value = tolerance / 10;
//             labelStore.intensityFillerTolerance = tolerance / 10;
//             break;
//         case 'Moisture':
//             fillerMaxTolerance.value = tolerance;
//             fillerStep.value = tolerance / 1000;
//             autofillTolerance.value = tolerance / 10;
//             labelStore.intensityFillerTolerance = tolerance / 10;
//             break;
//         case 'NDVI':

//             fillerMaxTolerance.value = tolerance;
//             fillerStep.value = tolerance / 1000;
//             autofillTolerance.value = tolerance / 10;
//             labelStore.intensityFillerTolerance = tolerance / 10;
//             break;
//         case 'RGB':
//             tolerance = 1000;
//             fillerMaxTolerance.value = tolerance;
//             fillerStep.value = tolerance / 1000;
//             autofillTolerance.value = tolerance / 10;
//             labelStore.intensityFillerTolerance = tolerance / 10;
//             break;
//         case 'Short Wave Infrared':
//             tolerance = 1000;
//             fillerMaxTolerance.value = tolerance;
//             fillerStep.value = tolerance / 1000;
//             autofillTolerance.value = tolerance / 10;
//             labelStore.intensityFillerTolerance = tolerance / 10;
//             break;
//     }
// })


// watch(() => labelStore.selectedLayer, (newLayer) => {
//     if ((labelStore.drawingActive || labelStore.eraserActive || labelStore.magicStick.active || labelStore.abStick.active || labelStore.bucketFill.active) && newLayer.startsWith('Drawing Layer')) {
//         restartDrawing();
//     } else {
//         labelStore.setDrawingActive(false);
//         labelStore.setEraserActive(false);
//         labelStore.bucketFill.active = false;
//         labelStore.bucketFill.menuOpen = false;
//         labelStore.magicStick.active = false;
//         labelStore.magicStick.menuOpen = false;
//         labelStore.abStick.active = false;
//         labelStore.abStick.menuOpen = false;
//         labelStore.setPanMoveActive(true);
//         document.getElementById('drawingContainer')!.style.cursor = 'grab';
//         removeMouseDownEventListener();
//         removeMouseUpEventListener();
//         removeMouseMoveEventListener();
//     }
// });

// function applyAutoFill() {
//     let autofillCanvas = document.getElementById('autofill')! as HTMLCanvasElement
//     let autofillContext = autofillCanvas.getContext('2d')!;
//     let autofillImage = autofillContext.getImageData(0, 0, autofillCanvas.width, autofillCanvas.height);
//     // get selected drawing layer
//     let selectedLayer = labelStore.selectedLayer;
//     let selectedCanvas = labelStore.layerNameToCanvas.get(selectedLayer)!;
//     let selectedContext = selectedCanvas.getContext('2d')!;
//     const currentImage = labelStore.listOfImages.find((img) => img.fullTitle === labelStore.currentImage.fullTitle)!;
//     let { x: x0, y: y0 } = patchNumberToCoords(currentImage.patchNumber);
//     // copy the autofill image to the selected layer where the selected layer is not already drawn (i.e. pixel value is 0)
//     for (let i = 0; i < autofillImage.width; i++) {
//         for (let j = 0; j < autofillImage.height; j++) {
//             // if (j < x0 || j >= x0 + config.patchSize || i < y0 || i >= y0 + config.patchSize) {
//             //     continue;
//             // }
//             let pixel = autofillContext.getImageData(i, j, 1, 1).data;
//             if (pixel[0] !== 0 || pixel[1] !== 0 || pixel[2] !== 0 || pixel[3] !== 0) {
//                 let selectedPixel = selectedContext.getImageData(i, j, 1, 1).data;
//                 if (selectedPixel[0] === 0 && selectedPixel[1] === 0 && selectedPixel[2] === 0 && selectedPixel[3] === 0) {
//                     selectedContext.fillStyle = `rgba(${pixel[0]}, ${pixel[1]}, ${pixel[2]}, ${pixel[3]})`;
//                     selectedContext.fillRect(i, j, 1, 1);
//                 }
//             }
//         }
//     }
//     labelStore.pushToHistory();
// }

</script>

<template>
    <v-row>
        <v-col cols="12" md="12">
            <v-card variant="flat" rounded="0" class="px-0 py-2 rounded-0">
                <!-- <v-row no-gutters class="align-center">
                    <v-col md="10" sm="10" cols="10">
                        <v-row class="pt-3 pl-3 d-flex align-center"> -->
                            <!-- <v-badge :color="labelStore.showHotKeyBadges ? 'rgba(33,33,33,1)' : 'rgba(0,0,0,0)'"
                                :content="formatHkBadge('hk_toggle_pen', settingsStore)">
                                <v-btn size="small" variant="text" icon="mdi-pen" :disabled="labelStore.mapActive"
                                    :active="labelStore.drawingActive" @click="labelStore.activateTool('simpledraw')"></v-btn>
                            </v-badge> -->
                            <!-- <Margin />
                            <v-badge :color="labelStore.showHotKeyBadges ? 'rgba(33,33,33,1)' : 'rgba(0,0,0,0)'"
                                :content="formatHkBadge('hk_toggle_eraser', settingsStore)">
                                <v-btn size="small" variant="text" icon="mdi-eraser" :disabled="labelStore.mapActive"
                                    :active="labelStore.eraserActive" @click="labelStore.activateTool('eraser')"></v-btn>
                            </v-badge> -->
                            <!-- <Margin />
                            <v-badge :color="labelStore.showHotKeyBadges ? 'rgba(33,33,33,1)' : 'rgba(0,0,0,0)'"
                                :content="formatHkBadge('hk_toggle_pan', settingsStore)">
                                <v-btn size="small" variant="text" :disabled="labelStore.mapActive"
                                    icon="mdi-cursor-move" @click="labelStore.activateTool('pan')"
                                    :active="labelStore.panMoveActive"></v-btn>
                            </v-badge> -->
                            <Margin />
                            <!---<v-btn icon="mdi-auto-fix" :active="labelStore.magicStick.active" @click="toggleMagicStick" :disabled="labelStore.selectedLayer !== 'GMM'"></v-btn>-->
                            <!-- <v-badge :color="labelStore.showHotKeyBadges ? 'rgba(33,33,33,1)' : 'rgba(0,0,0,0)'"
                                :content="formatHkBadge('hk_toggle_magic_stick', settingsStore)">

                                <v-menu v-model="labelStore.magicStick.menuOpen" :close-on-content-click="false">
                                   
                                    <template v-slot:activator="{ props }">
                                        <v-btn @click="labelStore.activateTool('wand')" size="small" variant="text" :active="labelStore.magicStick.active"
                                            :style="{ color: labelStore.magicStick.active ? labelStore.magicStick.overwriteClass : 'primary' }"
                                            :disabled="labelStore.mapActive" icon="mdi-auto-fix" v-bind="props">
                                        </v-btn>
                                    </template>

                                    <v-card max-width="300" min-width="300" class="pa-5">
                                        <div class="text-h4">Wand Tool</div>
                                        <div class="text-body-1">The wand tool lets you replace a certain color when
                                            overpainting it without interfering
                                            with other colors.</div>
                                        <Margin />
                                        <Margin />
                                        <div class="text-h5">Layer to draw on</div>
                                        <Margin />
                                        <v-select variant="plain" v-model="labelStore.magicStick.drawLayer"
                                            label="Layers" :items="Array.from(labelStore.layerNameToCanvas.keys()).map(x => {
                                                if (x.startsWith('Drawing Layer')) {
                                                    return x;
                                                }
                                            })">
                                        </v-select>
                                        <div class="text-h5">Please pick a color that should be replaced</div>
                                        <Margin />

                                        <div style="width: 100px; height: 50px;"
                                            :style="{ backgroundColor: labelStore.pixelClassInfo }">

                                        </div>
                                    </v-card>
                                </v-menu>
                            </v-badge> -->
                            <Margin />
                            <!-- <v-badge :color="labelStore.showHotKeyBadges ? 'rgba(33,33,33,1)' : 'rgba(0,0,0,0)'"
                                :content="formatHkBadge('hk_toggle_ab_stick', settingsStore)">
                                <v-btn size="small" variant="text" :disabled="labelStore.mapActive"
                                    icon="mdi-ab-testing" @click="labelStore.activateTool('ab')"
                                    :active="labelStore.abStick.active"></v-btn> -->
                                <!-- 
                                <v-menu v-model="labelStore.abStick.menuOpen" :close-on-content-click="false">
                                    <template v-slot:activator="{ props }">
                                        <v-btn size="small" variant="text" :active="labelStore.abStick.active"
                                            :disabled="labelStore.mapActive" icon="mdi-ab-testing" v-bind="props">
                                        </v-btn>
                                    </template>

                                    <v-card min-width="300" class="pa-5">
                                        <div class="text-h5">Layer to draw on</div>
                                        <Margin />
                                        <v-select variant="plain" v-model="labelStore.abStick.drawLayer" label="Classes"
                                            :items="Array.from(labelStore.layerNameToCanvas.keys()).map(x => {
                                                if (x.startsWith('Drawing Layer')) {
                                                    return x;
                                                }
                                            })">
                                        </v-select>
                                        <Margin />


                                        <v-divider></v-divider>

                                        <v-card-actions>
                                            <v-spacer></v-spacer>

                                            <v-btn variant="text" @click="labelStore.closeAllMenus()">
                                                Cancel
                                            </v-btn>
                                            <v-btn color="primary" variant="text" @click="labelStore.activateTool('ab')">
                                                Ok
                                            </v-btn>
                                        </v-card-actions>
                                    </v-card>
                                </v-menu> -->
                            <!-- </v-badge> -->
                            <!-- <Margin /> -->
                            <!-- <v-badge :color="labelStore.showHotKeyBadges ? 'rgba(33,33,33,1)' : 'rgba(0,0,0,0)'"
                                :content="formatHkBadge('hk_toggle_bucket_fill', settingsStore)">

                                <v-btn size="small" variant="text" :disabled="labelStore.mapActive"
                                    icon="mdi-format-color-fill" @click="labelStore.activateTool('bucket')"
                                    :active="labelStore.bucketFill.active"></v-btn> -->

                                <!-- <v-menu v-model="labelStore.bucketFill.menuOpen" :close-on-content-click="false">

                                    <template v-slot:activator="{ props }">
                                        <v-btn size="small" variant="text" :active="labelStore.bucketFill.active"
                                            :disabled="labelStore.mapActive" icon="mdi-format-color-fill"
                                            v-bind="props">
                                        </v-btn>
                                    </template>

                                    <v-card min-width="300" class="pa-5">
                                        <div class="text-h5">Layer to draw on</div>
                                        <Margin />
                                        <v-select variant="plain" v-model="labelStore.bucketFill.drawLayer"
                                            label="Classes" :items="Array.from(labelStore.layerNameToCanvas.keys()).map(x => {
                                                if (x.startsWith('Drawing Layer')) {
                                                    return x;
                                                }
                                            })">
                                        </v-select>

                                        <v-card-actions>
                                            <v-spacer></v-spacer>

                                            <v-btn variant="text" @click="labelStore.closeAllMenus()">
                                                Cancel
                                            </v-btn>
                                            <v-btn color="primary" variant="text"
                                                @click="labelStore.activateBucketFill()">
                                                Ok
                                            </v-btn>
                                        </v-card-actions>
                                    </v-card>
                                </v-menu> -->
                            <!-- </v-badge> -->
                            <!-- <Margin /> -->
                            <!-- <v-btn icon="mdi-content-save" @click="saveState"></v-btn> -->
                            <!-- <v-dialog max-width="500">
                                <template v-slot:activator="{ props: activatorProps }">
                                    <v-btn size="small" variant="text" icon="mdi-content-save"
                                        @click="labelStore.saveMenuOpen = true" v-bind="activatorProps"></v-btn>
                                </template>

                                <template v-slot:default="{ isActive }">
                                    <v-card title="Save">
                                        <v-card-text>
                                            <v-switch color="primary" v-model="labelStore.saveWithGMM"
                                                :label="`${labelStore.saveWithGMM ? 'Use' : 'Don\'t'} GMM as base`" />
                                            <div class="text-h5">This text will appear in the side menu as additional
                                                info (optional)</div>
                                            <Margin />
                                            <v-text-field v-model="labelStore.shortNote"
                                                label="Short note"></v-text-field>
                                            <div class="text-h5">Give more feedback on the data set here (optional)
                                            </div>
                                            <Margin />
                                            <v-textarea v-model="labelStore.longNote" label="Long note"></v-textarea>
                                            <v-btn color="primary" @click="labelStore.saveState(labelStore.shortNote, labelStore.longNote).then(() => {
                                                labelStore.saveMenuOpen = false; isActive.value = false;
                                            })">Save</v-btn>
                                        </v-card-text>

                                        <v-card-actions>
                                            <v-spacer></v-spacer>

                                            <v-btn text="Cancel"
                                                @click="labelStore.saveMenuOpen = false, isActive.value = false"></v-btn>
                                        </v-card-actions>
                                    </v-card>
                                </template>
                            </v-dialog>
                            <Margin /> -->
                            <!-- <v-badge :color="labelStore.showHotKeyBadges ? 'rgba(33,33,33,1)' : 'rgba(0,0,0,0)'"
                                :content="formatHkBadge('hk_undo', settingsStore)">
                                <v-btn size="small" variant="text" :disabled="labelStore.mapActive" icon="mdi-undo"
                                    @click="HistoryHandler.getInstance().undo"></v-btn>
                            </v-badge>
                            <Margin />
                            <v-badge :color="labelStore.showHotKeyBadges ? 'rgba(33,33,33,1)' : 'rgba(0,0,0,0)'"
                                :content="formatHkBadge('hk_redo', settingsStore)">
                                <v-btn size="small" variant="text" :disabled="labelStore.mapActive" icon="mdi-redo"
                                    @click="HistoryHandler.getInstance().redo"></v-btn>
                            </v-badge>
                            <Margin />

                            <v-badge :color="labelStore.showHotKeyBadges ? 'rgba(33,33,33,1)' : 'rgba(0,0,0,0)'"
                                :content="formatHkBadge('hk_map', settingsStore)">
                                <v-btn size="small" variant="text" icon="mdi-map"
                                    @click="labelStore.mapActive = !labelStore.mapActive"></v-btn>
                            </v-badge>
                            <Margin /> -->

                            <!-- <v-menu v-model="labelStore.brightnessContrastMenuActive" :close-on-content-click="false"
                                location="end">
                                <template v-slot:activator="{ props }">
                                    <v-btn size="small" variant="text" :disabled="labelStore.mapActive" icon
                                        v-bind="props">
                                        <v-icon>mdi-tune-variant</v-icon>
                                    </v-btn>
                                </template>

                                <v-card min-width="300" id="fine-tuner">
                                    <v-list>
                                        <v-list-item>
                                            <p class="text-body-4">Contrast/Brightness</p>
                                        </v-list-item>
                                        <v-list-item>
                                            <v-slider :max="100" :min="-100" :step="1"
                                                v-model="labelStore.rawMapContrast"
                                                prepend-icon="mdi-contrast-circle"></v-slider>
                                        </v-list-item>
                                        <v-list-item>
                                            <v-slider :max="255" :min="-255" :step="1"
                                                v-model="labelStore.rawMapBrightness"
                                                prepend-icon="mdi-brightness-5"></v-slider>
                                        </v-list-item>
                                        <v-list-item>
                                            <v-btn icon="mdi-restart" color="purple"
                                                @click="labelStore.rawMapBrightness = 0, labelStore.rawMapContrast = 0"></v-btn>
                                        </v-list-item>
                                        <v-list-item>
                                            <v-btn color="purple" @click="clearImage(labelStore)">Clear Image</v-btn>
                                        </v-list-item>
                                    </v-list>

                                    <v-card-actions>
                                        <v-spacer></v-spacer>
                                        <v-btn color="primary" variant="text"
                                            @click="labelStore.brightnessContrastMenuActive = false">
                                            Done
                                        </v-btn>
                                    </v-card-actions>
                                </v-card>
                            </v-menu> -->
                            <!-- <Margin /> -->
                            <!-- <v-btn size="small" variant="text" icon="mdi-keyboard-variant"
                                @click="labelStore.showHotKeyBadges = !labelStore.showHotKeyBadges"></v-btn> -->
                            <!-- <Margin /> -->
                            <!-- <div v-for="tag in labelStore.availableTags" :key="tag" class="d-flex align-center">
                                <v-chip density="compact" :disabled="labelStore.updatingTag"
                                    @click="labelStore.selectTag(tag)"
                                    :class="{ 'text-primary': labelStore.currentTags.includes(tag) || labelStore.currentTags.length === 0 && tag === 'unstarted' }">
                                    {{ tag }}
                                </v-chip>
                                <Margin />
                            </div> -->
                            <!-- <v-badge :color="labelStore.showHotKeyBadges ? 'rgba(33,33,33,1)' : 'rgba(0,0,0,0)'"
                                :content="formatHkBadge('hk_decr_pen_size', settingsStore) + '&' + formatHkBadge('hk_incr_pen_size', settingsStore)">
                                <CursorPicker />
                            </v-badge>
                            <Margin /> -->
                            <!-- <v-badge :color="labelStore.showHotKeyBadges ? 'rgba(33,33,33,1)' : 'rgba(0,0,0,0)'"
                                :content="formatHkBadge('hk_toggle_norm', settingsStore)">
                                <NormalizationPicker />
                            </v-badge> -->
                            <!-- <v-menu :disabled="true" v-model="labelStore.intensityFillerMenuOpen"
                                :close-on-content-click="false" location="end">
                                <template v-slot:activator="{ props }">
                                    <v-btn style="display: none;" size="small" variant="text"
                                        :disabled="labelStore.mapActive" icon v-bind="props">
                                        <v-icon>mdi-tune-variant</v-icon>
                                    </v-btn>
                                </template>

                                <v-card min-width="300" id="fine-tuner">
                                    <v-list>
                                        <v-list-item>
                                            <p class="text-body-4">Tolerance</p>
                                        </v-list-item>
                                        <v-list-item>
                                            <v-slider :max="fillerMaxTolerance" :min="0" :step="fillerStep"
                                                @end="labelStore.intensityFillerTolerance = autofillTolerance"
                                                v-model="autofillTolerance" prepend-icon="mdi-set-left"></v-slider>
                                        </v-list-item>
                                    </v-list>

                                    <v-card-actions>
                                        <v-spacer></v-spacer>
                                    </v-card-actions>
                                </v-card>
                            </v-menu> -->
                        <!-- </v-row>
                    </v-col>
                </v-row> -->
                <v-row>
                    <v-col class="d-flex align-center">
                        <div>
                            <v-chip class="text-h5" density="compact"
                                :color="labelStore.displayNameToColors[labelStore.selectedClass]">Selected drawing
                                class: {{
                                    labelStore.selectedClass }}</v-chip>
                        </div>
                        <Margin />
                        <v-chip class="text-h5" density="compact" :color="labelStore.pixelClassInfo || 'black'">Hovering
                            pixel: {{
                                labelStore.hexColorToClassName[labelStore.pixelClassInfo] ?
                                    labelStore.hexColorToClassName[labelStore.pixelClassInfo] + ' ' +
                                    labelStore.pixelCertaintyInfo :
                                    'None' }}</v-chip>

                    </v-col>
                </v-row>
            </v-card>
        </v-col>
    </v-row>
</template>