<script setup lang="ts">
import * as packageJson from '../../../package.json';
import Margin from '@/views/editor/components/Margin.vue';
</script>
<template>
    <perfect-scrollbar class="scrollnavbar">
        <v-row>
            <v-col cols="12">
                <v-card>
                    <v-card-item>
                        <v-card-title>Current version {{ packageJson.version }}</v-card-title>
                    </v-card-item>
                </v-card>
                <Margin :margin="5" />
                <v-card>
                    <v-card-item>
                        <v-card-title>v1.3.0</v-card-title>
                        <v-card-subtitle>Indices + Web Workers + Clustering</v-card-subtitle>
                    </v-card-item>

                    <v-card-text>
                        <v-list-item-title>Features</v-list-item-title>
                        <v-list-item subtitle="Added popular remote sensing indices"></v-list-item>
                        <v-list-item subtitle="Allow clustering of specific layers"></v-list-item>
                        <v-list-item subtitle="Outsource heavy computations to web workers"></v-list-item>
                    </v-card-text>
                </v-card>
                <Margin :margin="5" />
                <v-card>
                    <v-card-item>
                        <v-card-title>v1.2.0</v-card-title>
                        <v-card-subtitle>128px patches + Seasonality + Colorbar</v-card-subtitle>
                    </v-card-item>

                    <v-card-text>
                        <v-list-item-title>Features</v-list-item-title>
                        <v-list-item subtitle="Images are now 128x128"></v-list-item>
                        <v-list-item subtitle="Added seasonality images for comparison"></v-list-item>
                        <v-list-item subtitle="Added colorbar for height map"></v-list-item>
                        <v-list-item subtitle="Added hotkey for A/B"></v-list-item>
                    </v-card-text>
                </v-card>
                <Margin :margin="5" />
                <v-card>
                    <v-card-item>
                        <v-card-title>v1.1.2</v-card-title>
                        <v-card-subtitle>A/B stick</v-card-subtitle>
                    </v-card-item>

                    <v-card-text>
                        <v-list-item-title>Features</v-list-item-title>
                        <v-list-item subtitle="A/B stick to draw between already drawn classes"></v-list-item>
                        <v-list-item subtitle="Compact header"></v-list-item>
                        <v-list-item subtitle="Quick class access"></v-list-item>
                    </v-card-text>
                </v-card>
                <Margin />
                <v-card>
                    <v-card-item>
                        <v-card-title>v1.1.1</v-card-title>
                        <v-card-subtitle>UI changes + bug fixes + new page</v-card-subtitle>
                    </v-card-item>

                    <v-card-text>
                        <v-list-item-title>Features</v-list-item-title>
                        <v-list-item subtitle="Sidebar toggling enabled for the right side"></v-list-item>
                        <v-list-item subtitle="Header not shown when not in Todos"></v-list-item>
                        <v-list-item subtitle="Tutorial page started"></v-list-item>
                        <Margin :margin="5" />
                        <v-list-item-title>Bug Fixes</v-list-item-title>
                        <v-list-item subtitle="First load does not load image"></v-list-item>
                        <v-list-item subtitle="Wrong layer selection when multiple layers available"></v-list-item>
                    </v-card-text>
                </v-card>
                <Margin />
                <v-card>
                    <v-card-item>
                        <v-card-title>v1.1.0</v-card-title>
                        <v-card-subtitle>UI changes + Hotkeys</v-card-subtitle>
                    </v-card-item>

                    <v-card-text>
                        <v-list-item-title>Features</v-list-item-title>
                        <v-list-item subtitle="New classes"></v-list-item>
                        <v-list-item subtitle="Labelled images adjustment to new classes"></v-list-item>
                        <v-list-item subtitle="Redo"></v-list-item>
                        <v-list-item subtitle="Improved undo"></v-list-item>
                        <v-list-item subtitle="Prob slider above GMM when active"></v-list-item>
                        <v-list-item subtitle="Self-assign hotkeys"></v-list-item>
                        <Margin :margin="5" />
                        <v-list-item-title>Bug Fixes</v-list-item-title>
                        <v-list-item subtitle="Layouting (scrolling)"></v-list-item>
                        <v-list-item subtitle="Tags get stuck"></v-list-item>
                        <v-list-item subtitle="First image click leads to blank screen"></v-list-item>
                        <v-list-item subtitle="Undo after bucket fill"></v-list-item>
                        <v-list-item subtitle="Eraser-to-pan-switch leads to pan at first try"></v-list-item>
                    </v-card-text>
                </v-card>

            </v-col>
        </v-row>
        <div style="height: 100px"></div>
    </perfect-scrollbar>
</template>