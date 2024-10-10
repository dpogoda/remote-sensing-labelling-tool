import { defineStore } from "pinia";
import { useRoute } from "vue-router";

const route = useRoute();

export const useUiStore = defineStore({
    id: 'uiStore',
    state: () => ({
        showNavMenu: false,
    })
});