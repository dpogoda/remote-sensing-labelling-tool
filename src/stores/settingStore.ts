import { getSettings, updateSetting } from "@/utils/helpers/api";
import { defineStore } from "pinia";

export interface Setting {
    id: number;
    name: string;
    value: string[];
    type: string;
    displayName: string;
}

export interface HotKeySetting {
    id: number;
    name: string;
    value: string;
    type: string;
    keys: string[];
    displayName: string;
}

export const useSettingsStore = defineStore({
    id: 'settingStore',
    state: () => ({
        settings: [] as Setting[],
        hotKeys: [] as HotKeySetting[],
        isLoading: false
    }),
    actions: {
        loadSettings() {
            this.settings = [];
            this.hotKeys = [];
            this.settings = getSettings();
            console.log(this.settings);

            this.settings.forEach((setting: Setting) => {
                switch (setting.type) {
                    case 'string[]':
                        this.hotKeys.push({
                            id: setting.id,
                            name: setting.name,
                            value: JSON.stringify(setting.value),
                            type: setting.type,
                            keys: setting.value,
                            displayName: setting.displayName
                        });
                        break;
                }
            });
            return this.settings;
        },
        async saveSetting(setting: Setting) {
            // await updateSetting(setting);
            // await this.loadSettings();
        }
    }
});