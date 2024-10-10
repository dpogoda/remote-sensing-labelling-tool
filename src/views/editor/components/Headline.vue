<script setup lang="ts">
import { useCustomizerStore } from "@/stores/customizer";
import { useLabelCanvasStore } from "@/stores/canvasHandlerStore";
import { getDateFromFullTitle, formatTitle } from "@/views/editor/components/common";
import { ref } from "vue";
import Margin from "@/views/editor/components/Margin.vue"
import moment, { type Moment } from 'moment';
import { useRoute } from 'vue-router';

const labelCanvasStore = useLabelCanvasStore();
const customizer = useCustomizerStore();
const showSidebar = ref(true);
const route = useRoute();

function getSeasonFromMomentDate(date: Moment) {
    // spring is 20th March to 21st June
    // summer is 22nd June to 21st September
    // autumn is 22nd September to 20th December
    // winter is 21st December to 19th March
    if (date.isAfter(moment([date.year(), 2, 20])) && date.isBefore(moment([date.year(), 5, 21]))) {
        return "Spring";
    } else if (date.isAfter(moment([date.year(), 5, 21])) && date.isBefore(moment([date.year(), 8, 22]))) {
        return "Summer";
    } else if (date.isAfter(moment([date.year(), 8, 22])) && date.isBefore(moment([date.year(), 11, 21]))) {
        return "Autumn";
    } else {
        return "Winter";
    }
}

</script>
<template>
    <v-row no-gutters class="align-center">
        <v-card variant="flat" class="px-4 py-3">
            <v-row class="d-flex justify-space-between">
            </v-row>
        </v-card>
    </v-row>
</template>