<script setup lang="ts">
import { useLabelCanvasStore } from '@/stores/canvasHandlerStore';
import { ref, watch } from 'vue';
import LayerButton from './LayerButton.vue';
import MapLayerButton from './MapLayerButton.vue';
import Margin from './Margin.vue';
import { useRoute } from 'vue-router';
import { useNavStore } from '@/stores/navStore';

const labelCanvasStore = useLabelCanvasStore();

const route = useRoute();
const navStore = useNavStore();

</script>
<template>
    <!-- <v-card style="margin-top: 80px;">
        <v-layout> -->
    <v-navigation-drawer v-if="route.path.includes('/editor') && !navStore.uploadActive" permanent class="leftSidebar" location="right"
        :rail="labelCanvasStore.showMini" v-model="labelCanvasStore.showSidebar">
        <perfect-scrollbar class="scrollnavbar">
        <div v-if="!labelCanvasStore.mapActive">
            <v-list dense nav>
                <v-list-item>
                    <div class="d-flex align-center">
                        <v-list-item-icon>
                            <v-icon>mdi-layers-edit</v-icon>
                        </v-list-item-icon>
                        <Margin />
                        <v-list-item-title>Drawing Layers</v-list-item-title>
                    </div>
                </v-list-item>
                <v-btn class="mt-1 mb-2 ml-2" size="small" icon="mdi-plus" @click="labelCanvasStore.addDrawingLayer" />
                <template v-for="(item, i) in labelCanvasStore.drawingLayerNameDisplayOrder" :key="'drawlabelbtn'+i">
                    <LayerButton :active="labelCanvasStore.selectedLayer === item"
                        :closable="item !== 'Drawing Layer 1'" :layer-name="item" />
                </template>
                <v-divider></v-divider>
                <v-list-item>
                    <div class="d-flex align-center">
                        <v-list-item-icon>
                            <v-icon>mdi-layers-triple-outline</v-icon>
                        </v-list-item-icon>
                        <Margin />
                        <v-list-item-title>Other Layers</v-list-item-title>
                    </div>
                </v-list-item>
                <template v-for="(item, i) in labelCanvasStore.layerNameDisplayOrder" :key="'labelbtn'+i">
                    <LayerButton :active="labelCanvasStore.selectedLayer === item" :closable="false"
                        :layer-name="item" />
                </template>
            </v-list>
        </div>
        <div v-else>
            <v-list dense nav>
                <v-list-item>
                    <v-list-item-icon>
                        <v-icon>mdi-map</v-icon>
                    </v-list-item-icon>
                    <v-list-item-title>Map Layers</v-list-item-title>
                </v-list-item>
                <v-list-item>
                    <template v-for="(item, i) in labelCanvasStore.availableMapLayers" :key="i">
                        <MapLayerButton :active="labelCanvasStore.currentMapLayer === item" :closable="false"
                            :layer-name="item" />
                    </template>
                </v-list-item>
                <v-list-item>
                    <div class="d-flex align-center">
                        <v-btn class="mt-1 mb-2 ml-2" size="small" icon="mdi-chevron-left"
                            @click="labelCanvasStore.mapActive = false" />
                        <Margin />
                        <span>Back</span>
                    </div>
                </v-list-item>
            </v-list>
        </div>

        <v-divider></v-divider>
        <div style="height:50px"></div>
    </perfect-scrollbar>
    </v-navigation-drawer>

    <!-- </v-layout>
    </v-card> -->
</template>