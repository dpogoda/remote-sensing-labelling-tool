<script lang="ts" setup>
import { useLabelCanvasStore } from '@/stores/canvasHandlerStore';

const labelStore = useLabelCanvasStore();

</script>

<template>
    <!-- pa-4 -->
    <div class=" text-center">
        <!-- <v-btn :disabled="labelStore.isLoading" color="primary" icon="mdi-refresh" text="Start loading"
            @click="labelStore.isLoading = true"></v-btn> -->

        <v-dialog v-model="labelStore.isLoading" max-width="320" persistent>
            <v-list class="py-2" color="primary" elevation="12" rounded="lg">
                <v-list-item title="Refreshing Application...">
                    <template v-slot:prepend>
                        <div class="pe-4">
                            <v-icon color="primary" size="x-large"></v-icon>
                        </div>
                    </template>

                    <template v-slot:append>
                        <v-progress-circular color="primary" indeterminate="disable-shrink" size="16"
                            width="2"></v-progress-circular>
                    </template>
                </v-list-item>
            </v-list>
        </v-dialog>
    </div>
</template>
