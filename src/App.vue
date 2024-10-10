<template>
  <RouterView></RouterView>
</template>

<script setup lang="ts">
import { useSettingsStore } from '@/stores/settingStore';
import { useLabelCanvasStore } from '@/stores/canvasHandlerStore';
import { onBeforeRouteUpdate, RouterView } from 'vue-router';
import { onMounted } from 'vue';
import { HotkeyHandler } from '@/eventhandlers/Hotkeys';
import { CursorShadowHandler } from '@/eventhandlers/CursorShadowHandler';
import { LayersHandler } from '@/eventhandlers/LayersHandler';
import { ActionEventHandler } from '@/eventhandlers/ActionEventHandler';
import { PanzoomHandler } from '@/eventhandlers/PanzoomHandler';


const settingsStore = useSettingsStore();
useLabelCanvasStore();

async function updateHandlers() {
  await settingsStore.loadSettings();
  HotkeyHandler.getInstance();
  CursorShadowHandler.getInstance();
  LayersHandler.getInstance();
  ActionEventHandler.getInstance();
  PanzoomHandler.getInstance();

  ActionEventHandler.getInstance().updateMouseListeners();

}

onMounted(async () => {
  // updateHandlers();
});

</script>

<style>
html {
  overflow: hidden !important;
}
</style>