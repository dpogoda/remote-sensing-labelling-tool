<script setup lang="ts">
import { useLabelCanvasStore } from '@/stores/canvasHandlerStore';
import DrawingLayerModal from './DrawingLayerModal.vue';
import { ref, watch } from 'vue';
import { update } from 'lodash';
import { normalize } from '@/canvashandlers/drawingtools/normalize';
import { NormType } from '@/types';

const labelStore = useLabelCanvasStore();
const selectRef = ref(null);


function closeSelect() {
    if (selectRef.value) {
        //@ts-ignore
        selectRef.value.blur();
    }
}

function updateNormalization() {
    try {
        let newNormalizedImage: ImageData;
        switch (labelStore.currentNormalization) {
            case '1/99 Percentiles':
                // newNormalizedImage = normalizeBy1And99Percentile(labelStore.rgbRaw, labelStore.width, labelStore.height);
                normalize(labelStore, NormType['1and99percentile'])
                break;
            case '5/95 Percentiles':
                normalize(labelStore, NormType['5and95percentile'])
                break;
            case 'MinMax':
                normalize(labelStore, NormType['minmax'])
                break;
            case 'Histogram':
                normalize(labelStore, NormType['histogram'])
                break;
            default:
            normalize(labelStore, NormType['1and99percentile'])
                break;
        }

        // labelStore.setRGBnormalised(newNormalizedImage);
        labelStore.rawMapBrightness = 0;
        labelStore.rawMapContrast = 0;

        let sourceCanvas: HTMLCanvasElement = labelStore.layerNameToCanvas.get('Source Image')!;
        let ctx = sourceCanvas.getContext('2d');
        if (ctx) {
            ctx.putImageData(labelStore.rgbNormalised, 0, 0);
            ctx.imageSmoothingEnabled = false;
        }
    } catch (e) {
        console.error(e);
    }
}

watch(() => labelStore.currentNormalization, newNorm => {
    updateNormalization();
});
//, 'Dynamic World', 'Div 10000', 'Histogram'
</script>

<template>
    <v-select hide-details density="compact" variant="plain" :disabled="labelStore.mapActive" ref="selectRef" style="max-width: 200px;"
        class="w-" v-model="labelStore.currentNormalization"
        :items="['1/99 Percentiles', '5/95 Percentiles', 'MinMax', 'Histogram']">
        <template v-slot:selection="{ item, index }">
            <div style="display: flex; align-items: center">
                <div class="text-body-2">{{ item.value }}</div>
            </div>
        </template>
        <template v-slot:item="{ item, index }">
            <v-list-item @click="labelStore.currentNormalization = item.value, closeSelect()">
                <div style="display: flex; align-items: center">
                    <div>{{ item.value }}</div>
                </div>
            </v-list-item>
        </template>
    </v-select>
</template>