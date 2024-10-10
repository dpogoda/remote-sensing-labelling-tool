import { defineStore } from "pinia";

export const useNavStore = defineStore({
    id: 'navStore',
    state: () => ({
        uploadActive: true
    })
})