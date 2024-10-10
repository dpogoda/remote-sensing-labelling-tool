<script lang="ts" setup>
import { prefillAutofill } from '@/canvashandlers/drawingtools/autofillTool';
import { patchNumberToCoords, useLabelCanvasStore } from '@/stores/canvasHandlerStore';
import { ref, watch } from 'vue';

const labelStore = useLabelCanvasStore();

// const autofillTolerance = ref(10);
// const fillerMaxTolerance = ref(100);
// const fillerStep = ref(1);

function runAutofill() {
    prefillAutofill(labelStore.autofillTolerance, labelStore)
}

function applyAutoFill() {
    let autofillCanvas = document.getElementById('autofill')! as HTMLCanvasElement
    let autofillContext = autofillCanvas.getContext('2d')!;
    let autofillImage = autofillContext.getImageData(0, 0, autofillCanvas.width, autofillCanvas.height);
    let selectedLayer = labelStore.selectedLayer;
    let selectedCanvas = labelStore.layerNameToCanvas.get(selectedLayer)!;
    let selectedContext = selectedCanvas.getContext('2d')!;
    for (let i = 0; i < autofillImage.width; i++) {
        for (let j = 0; j < autofillImage.height; j++) {
            let pixel = autofillContext.getImageData(i, j, 1, 1).data;
            if (pixel[0] !== 0 || pixel[1] !== 0 || pixel[2] !== 0 || pixel[3] !== 0) {
                let selectedPixel = selectedContext.getImageData(i, j, 1, 1).data;
                if (selectedPixel[0] === 0 && selectedPixel[1] === 0 && selectedPixel[2] === 0 && selectedPixel[3] === 0) {
                    selectedContext.fillStyle = `rgba(${pixel[0]}, ${pixel[1]}, ${pixel[2]}, ${pixel[3]})`;
                    selectedContext.fillRect(i, j, 1, 1);
                }
            }
        }
    }
    labelStore.pushToHistory();
}

</script>

<template>
    <v-menu :disabled="true" v-model="labelStore.intensityFillerMenuOpen" :close-on-content-click="false"
        location="end">
        <template v-slot:activator="{ props }">
            <v-btn style="display: none;" size="small" variant="text" :disabled="labelStore.mapActive" icon
                v-bind="props">
                <v-icon>mdi-tune-variant</v-icon>
            </v-btn>
        </template>

        <v-card max-width="300" min-width="300" id="fine-tuner">
            <div class="text-h4">Autofill Tool</div>
            <div class="text-body-2">The Autofill Tool fills the image based on the current color where your cursor is
                placed.
                Each similar pixel will be filled with the same class/color.
            <br>
                This currently works only if "Source Image" is the top layer.
        </div>
            <v-list>
                <v-list-item>
                    <p class="text-body-4">Tolerance</p>
                </v-list-item>
                <v-list-item>
                    <v-slider :max="labelStore.autofillMaxTolerance" :min="0" :step="labelStore.autofillStep"
                        @end="runAutofill" v-model="labelStore.autofillTolerance"
                        prepend-icon="mdi-set-left"></v-slider>
                </v-list-item>
            </v-list>

            <v-card-actions>
                <v-spacer></v-spacer>
                <v-btn @click="applyAutoFill" color="primary">Apply</v-btn>
            </v-card-actions>
        </v-card>
    </v-menu>
</template>