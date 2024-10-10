<script setup lang="ts">
import { useLabelCanvasStore } from '@/stores/canvasHandlerStore';
import { ref } from 'vue';

const labelStore = useLabelCanvasStore();
const selectRef = ref(null);

function certaintyToText(certainty: number) {
    if (certainty === 0) {
        return 'Don\'t know';
    } else if (certainty === 50) {
        return 'Could be';
    } else if (certainty === 80) {
        return 'Sure';
    } else if (certainty === 95) {
        return 'Very sure';
    }
}

function closeSelect() {
    if (selectRef.value) {
        //@ts-ignore
        selectRef.value.blur();
    }
}

</script>

<template>
    <!-- <p>{{ labelStore.displayNameToClassNumber[labelStore.selectedClass] }}</p> -->
    <v-select :disabled="labelStore.mapActive" ref="selectRef" style="max-width: 150px;" class="w-" v-model="labelStore.certainty"
        label="Certainty" :items="[0, 50, 80, 95]">
        <template v-slot:selection="{ item, index }">
            <div style="display: flex; align-items: center">
                <div>{{ certaintyToText(item.value) }}</div>
            </div>
        </template>
        <template v-slot:item="{ item, index }">
            <v-list-item @click="labelStore.certainty = item.value, closeSelect()">
                <div style="display: flex; align-items: center">
                    <div>{{ certaintyToText(item.value) }}</div>
                </div>
            </v-list-item>
        </template>
    </v-select>
</template>