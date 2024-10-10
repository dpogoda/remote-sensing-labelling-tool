<script setup lang="ts">
import { useLabelCanvasStore } from '@/stores/canvasHandlerStore';
import { ref } from 'vue';

const labelStore = useLabelCanvasStore();
const selectRef = ref(null);

function closeSelect() {
    if (selectRef.value) {
        //@ts-ignore
        selectRef.value.blur();
    }
}

</script>

<template>
    <v-select hide-details density="compact" variant="plain" :disabled="labelStore.mapActive" ref="selectRef" style="max-width: 200px;" class="my-0" v-model="labelStore.penSize"
        :items="[1, 5, 10, 15, 2, 3, 4, 6, 7, 8, 9, 11, 12, 13, 14]">
        <template v-slot:selection="{ item, index }">
            <div style="display: flex; align-items: center;">
                <div :style="{ width: item.value + 'px', height: item.value + 'px', backgroundColor: labelStore.selectedClass ? labelStore.classNameToColors[labelStore.selectedClass] : 'black' }" />
                <div style="margin: 5px" />
                <div>{{ item.value }}</div>
            </div>
        </template>
        <template v-slot:item="{ item, index }">
            <v-list-item @click="labelStore.penSize = item.value, closeSelect()">
                <div style="display: flex; align-items: center;">
                    <div :style="{ width: item.value + 'px', height: item.value + 'px', backgroundColor: labelStore.selectedClass ? labelStore.classNameToColors[labelStore.selectedClass] : 'black' }" />
                    <div style="margin: 5px" />
                    <div>{{ item.value }}</div>
                </div>
            </v-list-item>
        </template>
    </v-select>
</template>