<script setup lang="ts">
import { useLabelCanvasStore } from '@/stores/canvasHandlerStore';
import { onUnmounted, watch } from 'vue';
import { ref } from 'vue';
import { VListItem, VListItemTitle, VIcon, VBtn, VSlider } from 'vuetify/components';
import Margin from '@/views/editor/components/Margin.vue'
import { discretize } from '@/canvashandlers/drawingtools/discretize';
import { loadAgriculture } from '@/canvashandlers/indices/Agriculture';
import { loadSourceImage } from '@/canvashandlers/SourceImage';
import { loadNDVI } from '@/canvashandlers/indices/NDVI';
import { loadNDWI } from '@/canvashandlers/indices/NDWI';
import { loadNDBI } from '@/canvashandlers/indices/NDBI';
import { loadNDSI } from '@/canvashandlers/indices/NDSI';
import { loadMoisture } from '@/canvashandlers/indices/Moisture';
import { loadSAVI } from '@/canvashandlers/indices/SAVI';
import { loadShortWaveInfrared } from '@/canvashandlers/indices/ShortWaveInfrared';


const labelStore = useLabelCanvasStore();

const clusterRef = ref(null);

function closeClusterBinSelect() {
    if (clusterRef.value) {
        //@ts-ignore
        clusterRef.value.blur();
    }
}

const discreteActive = ref(false);
// const kmeansMenuActive = ref(false);
const kmeansBins = ref(5);

const props = defineProps<{
    layerName: string;
    closable: boolean;
    active: boolean;
}>();

function selectLayer() {
    labelStore.selectLayer(props.layerName);
}

function removeLayer() {
    labelStore.removeLayer(props.layerName);
}


// const isVisible = ref(true);
function toggleVisibility() {
    labelStore.layerNameDrawerSettings.set(props.layerName, {
        visible: !labelStore.layerNameDrawerSettings.get(props.layerName)!.visible,
        opacity: !labelStore.layerNameDrawerSettings.get(props.layerName)!.visible ? 100 : 0,
        discretizable: labelStore.layerNameDrawerSettings.get(props.layerName)!.discretizable,
        discreteActive: labelStore.layerNameDrawerSettings.get(props.layerName)!.discreteActive,
        discreteMenuOpen: false
    });

    if (labelStore.layerNameDrawerSettings.get(props.layerName)!.visible) {
        labelStore.layerNameToCanvas.get(props.layerName)!.style.opacity = '100';
    } else {
        labelStore.layerNameToCanvas.get(props.layerName)!.style.opacity = '0';
    }
}

// const opacity = ref(100);

watch(() => labelStore.layerNameDrawerSettings.get(props.layerName)!.opacity, adjustOpacity);

function adjustOpacity(value: number) {
    labelStore.layerNameToCanvas.get(props.layerName)!.style.opacity = (value / 100).toString();
    if (value === 0) {
        labelStore.layerNameDrawerSettings.set(props.layerName, {
            visible: false,
            opacity: 0,
            discretizable: labelStore.layerNameDrawerSettings.get(props.layerName)!.discretizable,
            discreteActive: labelStore.layerNameDrawerSettings.get(props.layerName)!.discreteActive, discreteMenuOpen: false
        });
    } else {
        labelStore.layerNameDrawerSettings.set(props.layerName, {
            visible: true,
            opacity: value,
            discretizable: labelStore.layerNameDrawerSettings.get(props.layerName)!.discretizable,
            discreteActive: labelStore.layerNameDrawerSettings.get(props.layerName)!.discreteActive, discreteMenuOpen: false
        });
    }
}

function discreteToContinuos(layerName: string) {
    switch (layerName) {
        case 'Agriculture':
            loadAgriculture(labelStore);
            break;
        case 'Source Image':
            loadSourceImage(labelStore);
            break;
        case 'GMM':
            // labelStore.drawGmm();
            // break;
            break;
        case 'NDVI':
            loadNDVI(labelStore);
            break;
        case 'NDWI':
            loadNDWI(labelStore);
            break;
        case 'NDBI':
            loadNDBI(labelStore);
            break;
        case 'NDSI':
            loadNDSI(labelStore);
            break;
        case 'Moisture':
            loadMoisture(labelStore);
            break;
        case 'SAVI':
            loadSAVI(labelStore);
            break;
        case 'Short Wave Infrared':
            loadShortWaveInfrared(labelStore);
            break;
        default:
            labelStore.layerNameToCanvas.get(layerName)!.style.opacity = '0';
            break;
    }
    labelStore.layerNameDrawerSettings.get(props.layerName)!.discreteActive = false;
}


function discretizeImage(layerName: string) {
    let canvas = labelStore.layerNameToCanvas.get(layerName)!;
    discretize(canvas, kmeansBins.value);
    labelStore.layerNameDrawerSettings.get(props.layerName)!.discreteActive = true;
}


</script>

<!-- <template>
    <v-list-item :active="props.active" @click="selectLayer" :title="props.layerName" :value="props.layerName.replace('\s+', '')">
        <template v-slot:append v-if="props.closable">
            <v-btn variant="plain" size="small" icon @click="removeLayer">
                <v-icon>mdi-close</v-icon>
            </v-btn>
        </template>
    </v-list-item>
</template> -->

<template>
    <v-list-item :active="props.active" class="pa-2" v-if="props.layerName !== 'GMM'">
        <!-- <template v-slot:prepend>
            <v-icon @click.stop="toggleVisibility">{{
        labelStore.layerNameDrawerSettings.get(props.layerName)!.visible ?
            'mdi-eye' : 'mdi-eye-off' }}</v-icon>
        </template> -->
        <template v-slot:append>
            <v-btn v-if="props.closable" variant="plain" size="small" icon @click.stop="removeLayer">
                <v-icon>mdi-close</v-icon>
            </v-btn>
        </template>

        <v-list-item-title style="display: flex; justify-content: space-between; align-items: center; cursor: pointer;"
            @click="selectLayer">
            <div style="display: flex; align-items: center;">
                <v-tooltip :max-width="300" :text="labelStore.tooltips[props.layerName] || props.layerName">
                    <template v-slot:activator="{ props }">
                        <v-btn size="x-small" icon="information" v-bind="props">
                            <v-icon>mdi-information</v-icon>
                        </v-btn>
                    </template>
                </v-tooltip>
                <margin />
                {{ props.layerName }}
            </div>
            <div style="display: flex; flex-direction: row">
                <v-menu v-model="labelStore.layerNameDrawerSettings.get(props.layerName)!.discreteMenuOpen"
                    :close-on-content-click="false"
                    v-if="labelStore.layerNameDrawerSettings.get(props.layerName)!.discretizable">
                    <template v-slot:activator="{ props: btnProps }">
                        <!-- || labelStore.selectedLayer !== 'GMM'-->
                        <v-btn size="x-small" variant="text"
                            :disabled="labelStore.layerNameDrawerSettings.get(props.layerName)!.discreteActive"
                            :active="labelStore.layerNameDrawerSettings.get(props.layerName)!.discreteActive"
                            icon="mdi-stairs" v-bind="btnProps">
                        </v-btn>
                        <!-- <v-icon @click.stop="discretizeImage(props.layerName, 10)" v-if="!discreteActive">{{ 'mdi-stairs'
                        }}</v-icon> -->
                    </template>
                    <v-card>
                        <v-card-text># K-Means clusters</v-card-text>
                        <v-select hide-details density="compact" variant="plain" ref="selectRef" class=""
                            v-model="kmeansBins" :items="[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17]">
                            <template v-slot:selection="{ item, index }">
                                <div
                                    style="display: flex; justify-content: flex-end ;align-items: center; padding-left: 10px;">
                                    <div>{{ item.value }}</div>
                                </div>
                            </template>
                        </v-select>
                        <v-card-actions>
                            <v-btn
                                @click="labelStore.layerNameDrawerSettings.get(props.layerName)!.discreteActive = false, labelStore.layerNameDrawerSettings.get(props.layerName)!.discreteMenuOpen = false"
                                color="primary">Cancel</v-btn>
                            <v-btn
                                @click="discretizeImage(props.layerName), labelStore.layerNameDrawerSettings.get(props.layerName)!.discreteMenuOpen = false"
                                color="primary">Apply</v-btn>
                        </v-card-actions>
                    </v-card>
                </v-menu>
                <!-- <v-icon @click.stop="discretizeImage(props.layerName, 10)" v-if="!discreteActive">{{ 'mdi-stairs' }}</v-icon> -->
                <v-btn icon="mdi-chart-bell-curve-cumulative" size="x-small"
                    @click.stop="discreteToContinuos(props.layerName)"
                    v-if="labelStore.layerNameDrawerSettings.get(props.layerName)!.discretizable"
                    :disabled="!labelStore.layerNameDrawerSettings.get(props.layerName)!.discreteActive"></v-btn>
            </div>
        </v-list-item-title>


        <div style="display: flex; align-items: center;">
            <div style="display: flex; flex-direction: column; align-items: center;">
                <v-icon @click.stop="toggleVisibility">{{
        labelStore.layerNameDrawerSettings.get(props.layerName)!.visible ?
            'mdi-eye' : 'mdi-eye-off' }}</v-icon>
            </div>
            <div style="width: 100%">
                <v-slider :thumb-size="10" step="1" min="0" max="100"
                    v-model="labelStore.layerNameDrawerSettings.get(props.layerName)!.opacity" class="ma-2 pl-3"
                    hide-details></v-slider>
            </div>
        </div>



    </v-list-item>
    <v-list-item :active="props.active" class="pa-2" v-else>

        <!-- <template v-slot:prepend>
            
        </template> -->

        <v-list-item-title style="cursor: pointer;" @click="selectLayer">{{ props.layerName }}</v-list-item-title>
        <div style="display: flex; align-items: center;">
            <div style="width: 100%; display: flex;" :style="{
        flexDirection: labelStore.propMaskActive ? 'column-reverse' : 'column',
    }">
                <div style="display: flex; align-items: center;">
                    <v-icon @click.stop="toggleVisibility">{{
        labelStore.layerNameDrawerSettings.get(props.layerName)!.visible ?
            'mdi-eye' : 'mdi-eye-off' }}</v-icon>
                    <v-slider :thumb-size="10" step="1" min="0" max="100"
                        v-model="labelStore.layerNameDrawerSettings.get(props.layerName)!.opacity" class="ma-2 pl-3"
                        hide-details></v-slider>
                </div>
                <div style="display: flex; align-items: center">
                    <v-icon v-if="props.layerName === 'GMM'"
                        @click.stop="labelStore.propMaskActive = !labelStore.propMaskActive">{{
        labelStore.layerNameDrawerSettings.get(props.layerName)!.visible ?
            'mdi-chart-bell-curve' : 'mdi-chart-bell-curve' }}</v-icon>
                    <v-slider @end="labelStore.drawGmm()" thumb-label :thumb-size="10" step="1" min="0" max="100"
                        v-model="labelStore.probabilityMask" class="ma-2 pl-3" hide-details>
                        <template v-slot:thumb-label="{ modelValue }">
                            {{ modelValue }}%
                        </template>
                    </v-slider>
                    <v-icon size="small" @click.stop="labelStore.propMaskActive = !labelStore.propMaskActive">{{
                        labelStore.propMaskActive ?
                        'mdi-eye' : 'mdi-eye-off' }}</v-icon>
                </div>

            </div>
        </div>
    </v-list-item>
</template>