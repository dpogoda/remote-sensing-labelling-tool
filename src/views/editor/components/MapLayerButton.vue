<script setup lang="ts">
import { useLabelCanvasStore } from '@/stores/canvasHandlerStore';
import { watch } from 'vue';
import { ref } from 'vue';
import { VListItem, VListItemTitle, VListItemSubtitle, VIcon, VBtn, VSlider } from 'vuetify/components';


const labelStore = useLabelCanvasStore();

const props = defineProps<{
    layerName: string;
    closable: boolean;
    active: boolean;
}>();

function selectMapLayer() {
    labelStore.currentMapLayer = props.layerName;
}

function removeLayer() {
    labelStore.removeLayer(props.layerName);
}


const isVisible = ref(true);
function toggleVisibility() {
    isVisible.value = !isVisible.value;
    if (isVisible.value) {
        labelStore.layerNameToCanvas.get(props.layerName)!.style.opacity = '100';
    } else {
        labelStore.layerNameToCanvas.get(props.layerName)!.style.opacity = '0';
    }
}

const opacity = ref(100);

watch(() => opacity.value, adjustOpacity);

function adjustOpacity(value: number) {
    opacity.value = value;
    labelStore.layerNameToCanvas.get(props.layerName)!.style.opacity = (value / 100).toString();
}

</script>

<template>
    <v-list-item :active="props.active" @click="selectMapLayer" :title="props.layerName"
        :value="props.layerName.replace('\s+', '')">
    </v-list-item>
</template>

<!-- <template>
    <v-list-item :active="props.active" class="pa-2">
        <template v-slot:prepend>
            <v-icon @click.stop="toggleVisibility">{{ isVisible ? 'mdi-eye' : 'mdi-eye-off' }}</v-icon>
        </template>
        <template v-slot:append>
            <v-btn v-if="props.closable" variant="plain" size="small" icon @click.stop="removeLayer">
                <v-icon>mdi-close</v-icon>
            </v-btn>
        </template>

        <v-list-item-title style="cursor: pointer;" @click="selectLayer">{{ props.layerName }}</v-list-item-title>
        <v-slider step="1" min="0" max="100" v-model="opacity" class="ma-2" hide-details></v-slider>
    </v-list-item>
</template> -->