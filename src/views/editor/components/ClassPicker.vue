<script setup lang="ts">
import { useLabelCanvasStore } from '@/stores/canvasHandlerStore';
import DrawingLayerModal from './DrawingLayerModal.vue';
import { ref, watch } from 'vue';
import Margin from './Margin.vue';

const labelStore = useLabelCanvasStore();
const selectRef = ref(null);
const colorPickerActive = ref(false);


function closeSelect() {
    if (selectRef.value) {
        //@ts-ignore
        selectRef.value.blur();
    }
}

async function deleteClass(id: number) {
    // show confirm
    if (confirm('Are you sure you want to delete this class?')) {
        await labelStore.deleteClass(id);

        // refresh
        location.reload();
    }
}

</script>

<template>


    <v-select density="compact" variant="plain" :disabled="labelStore.mapActive" ref="selectRef"
        style="max-width: 200px;" class="w-" v-model="labelStore.selectedClass" :items="labelStore.classDetails">
        <template v-slot:selection="{ item, index }">

            <!-- <div style="display: flex; align-items: center">
                <div
                    :style="{ flexWrap: 'nowrap', borderRadius: '30px', width: '10px', height: '10px', backgroundColor: labelStore.displayNameToColors[item.value] }" />
                <Margin /> -->
            <div class="text-no-wrap text-truncate">
                {{ item.value }}
            </div>
            <Margin />
            <div
                :style="{ borderRadius: '30px', width: '10px', height: '10px', backgroundColor: labelStore.displayNameToColors[item.value] }" />
            <!-- </div> -->
        </template>
        <template v-slot:prepend-item>
            <!-- <v-list-item>

                <div style="display: flex; align-items: center;">
                    <v-text-field v-bind:on-update:focused="() => {
        console.log('test')
    }" single-line hide-details v-model="labelStore.newClassName" label="New class"></v-text-field>
                    <Margin />
                    <div style="display: flex; flex-direction: column; justify-content: center; align-items: center;">
                        <v-menu v-model="colorPickerActive" :close-on-content-click="false">
                            <template v-slot:activator="{ props }">
                                <div v-bind="props"
                                    :style="{ cursor: 'pointer', borderRadius: '30px', width: '20px', height: '20px', backgroundColor: labelStore.newClassColor }" />
                            </template>
<v-color-picker mode="hex" v-model="labelStore.newClassColor" hide-inputs></v-color-picker>
</v-menu>
<Margin />
<v-btn size="x-small" :disabled="labelStore.newClassName.length === 0" icon @click="labelStore.addClass()">
    <v-icon>mdi-plus</v-icon>
</v-btn>
</div>
</div>
</v-list-item> -->
            <v-divider></v-divider>
        </template>
        <template v-slot:item="{ item, index }">
            <v-list-item lines="one" @click="labelStore.selectClass(item.raw.className), closeSelect()">
                <div style="display: flex; align-items: center">
                    <div
                        :style="{ borderRadius: '30px', width: '20px', height: '20px', backgroundColor: labelStore.displayNameToColors[item.raw.className] }" />
                    <Margin />
                    <div>{{ item.raw.className }}</div>
                </div>

                <template v-slot:append>
                    <v-btn v-if="item.raw.displayOrder > 15" variant="plain" size="small" icon
                        @click.stop="deleteClass(item.raw.id)">
                        <v-icon>mdi-close</v-icon>
                    </v-btn>
                </template>

            </v-list-item>
        </template>

    </v-select>
</template>