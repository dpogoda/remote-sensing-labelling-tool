<script lang="ts" setup>
import Margin from '@/views/editor/components/Margin.vue';
import _ from 'lodash';
import { onMounted, ref, watch, type Ref } from 'vue';
import { getSettings } from '@/utils/helpers/api';
import { useLabelCanvasStore, type HotKeySetting } from '@/stores/canvasHandlerStore';
import { useSettingsStore } from '@/stores/settingStore';

const settingsStore = useSettingsStore();

// interface HotKeyItem {
//     displayName: string;
//     keys: string[];
// }

// watch(() => settingsStore.hotKeys, (newHotKeys) => {
//     console.log('new hot keys', newHotKeys);
// }, { deep: true });

const assignmentActive = ref(false);
const activeItem: Ref<HotKeySetting | null> = ref(null);
const keyCombination: Ref<string[]> = ref([]);
const currentCombination: Ref<string[]> = ref([]);

function onOpenHotKeyDialog(item: HotKeySetting) {

    activeItem.value = item;
    assignmentActive.value = true;
    currentCombination.value = _.cloneDeep(item.keys);
    keyCombination.value = [];

}

function onCloseHotKeyDialog() {
    assignmentActive.value = false;
    activeItem.value = null;
    keyCombination.value = [];
    currentCombination.value = [];

}

async function saveHotKey(item: HotKeySetting, keyCombination: string[]) {
    settingsStore.isLoading = true;
    await settingsStore.saveSetting({
        ...item,
        value: JSON.stringify(keyCombination)
    });
    settingsStore.isLoading = false;
}

document.addEventListener('keydown', (e) => {
    e.preventDefault();
    if (assignmentActive.value && activeItem.value) {

        if (!keyCombination.value.includes(e.key) && keyCombination.value.length < 3) {
            if (keyCombination.value.length > 0 && !['Meta', 'Control'].includes(keyCombination.value[0])) {
                return;
            }
            keyCombination.value.push(e.key);
        }
        // console.log('key pressed', e.key, 'current combination', keyCombination.value.join(' + '));
    }
});

document.addEventListener('keyup', (e) => {
    e.preventDefault();
    if (assignmentActive.value && activeItem.value) {
        if (keyCombination.value.length > 0) {
            // activeItem.value.keys = [...keyCombination.value];
            currentCombination.value = [...keyCombination.value];
        }
        keyCombination.value = [];
        // console.log('key combination assigned', activeItem.value.keys.join(' + '), 'to', activeItem.value.functionName);
        // onCloseHotKeyDialog();
    }
});

function prettifyComboString(str: string[]) {
    return str.map(x => x.toLocaleUpperCase().replace('META', '⌘').replace('CONTROL', 'Ctrl')).join(' + ');
}

</script>

<template>
    <perfect-scrollbar class="scrollnavbar">
        <v-card class="mb-4">
            <v-card-title class="d-flex align-center">
                <v-icon size="small" icon="mdi-cog"></v-icon>
                <Margin />
                <span class="title">Settings</span>
            </v-card-title>
            <v-divider></v-divider>
            <v-card-text>
                <h3 class="text-h3">Hot keys</h3>
                <v-row>
                    <v-col cols="12">
                        <v-table>
                            <thead>
                                <tr>
                                    <th class="text-left">
                                        Function
                                    </th>
                                    <th class="text-left">
                                        Hot Key
                                    </th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr v-for="hotKey in settingsStore.hotKeys" :key="hotKey.id">
                                    <td>{{ hotKey.displayName }}</td>
                                    <td>
                                        <v-chip class="me-2" color="primary">
                                            {{ prettifyComboString(hotKey.keys) }}
                                        </v-chip>
                                        <v-dialog max-width="500">
                                            <template v-slot:activator="{ props: activatorProps }">
                                                <v-btn v-if="hotKey.name !== 'hk_undo' && hotKey.name !== 'hk_redo'" size="x-small" icon="mdi-pen" @click="onOpenHotKeyDialog(hotKey)"
                                                    v-bind="activatorProps" text="Open Dialog" variant="flat"></v-btn>
                                            </template>

                                            <template v-slot:default="{ isActive }">
                                                <v-card :title="hotKey.displayName">
                                                    <v-card-text class="text-center text-h1">
                                                        Press key combination
                                                    </v-card-text>
                                                    <v-card-text class="text-center text-h1">
                                                        {{ keyCombination.length ? prettifyComboString(keyCombination) :
                                                            prettifyComboString(currentCombination) }}
                                                    </v-card-text>

                                                    <v-card-actions>
                                                        <v-spacer></v-spacer>

                                                        <v-btn text="Cancel"
                                                            @click="onCloseHotKeyDialog(), isActive.value = false"></v-btn>
                                                        <v-btn text="Save"
                                                            @click="saveHotKey(hotKey, _.cloneDeep(currentCombination)), isActive.value = false"></v-btn>
                                                    </v-card-actions>
                                                </v-card>
                                            </template>
                                        </v-dialog>
                                    </td>
                                </tr>
                            </tbody>
                        </v-table>
                    </v-col>
                </v-row>
            </v-card-text>
        </v-card>
        <div style="height:100px"></div>
    </perfect-scrollbar>
</template>
