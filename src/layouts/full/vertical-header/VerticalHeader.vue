<script setup lang="ts">
import { ref } from 'vue';
// Icon Imports
import { SettingsIcon } from 'vue-tabler-icons';
import Headline from '@/views/editor/components/Headline.vue';
import Margin from '@/views/editor/components/Margin.vue';
import { useLabelCanvasStore } from '@/stores/canvasHandlerStore';
import { useUiStore } from '@/stores/uiStore';
import Logo from '../logo/LogoMain.vue';
import { useRoute } from 'vue-router';
import { useNavStore } from '@/stores/navStore';

// dropdown imports

const showSearch = ref(false);

function logout() {
  localStorage.removeItem('user');
  window.location.reload();
}

const username = JSON.parse(localStorage.getItem('user')!).username
const greetings = ref('Hi ' + username[0].toUpperCase() + username.substring(1, username.length) + '!');

const labelStore = useLabelCanvasStore();
const uiStore = useUiStore();

const route = useRoute();
const navStore = useNavStore();
</script>

<template>
  <v-app-bar height="50" v-if="!navStore.uploadActive">
    <!-- <v-btn icon @click="uiStore.showNavMenu = !uiStore.showNavMenu">
      <v-icon>{{ uiStore.showNavMenu ? 'mdi-close' : 'mdi-menu' }}</v-icon>
    </v-btn> -->
    <div style="padding-top: 10px; padding-right: 15px; padding-left: 5px;">
      <Logo />
    </div>
    <v-chip v-if="route.name === 'Editor'" style="background-color: #fff;" class="text-h5" density="compact"
      :color="labelStore.pixelClassInfo || 'black'">Hovering
      pixel: {{
        labelStore.hexColorToClassName[labelStore.pixelClassInfo] ?
          labelStore.hexColorToClassName[labelStore.pixelClassInfo] + ' ' +
          labelStore.pixelCertaintyInfo :
          'None' }}</v-chip>
    <Margin />
    <v-chip v-if="route.name === 'Editor'" style="background-color: #fff;" class="text-h5" density="compact"
      :color="labelStore.displayNameToColors[labelStore.selectedClass]">Selected

      class: {{
        labelStore.selectedClass }}</v-chip>
    <Margin />
    <!-- <v-menu :close-on-content-click="false">
      <template v-slot:activator="{ props }">
        <v-btn color="lightsecondary" variant="flat" rounded="sm" v-bind="props">
          <SettingsIcon stroke-width="1.5" />
        </v-btn>
      </template>
<v-sheet class="pa-5" rounded="md" width="200" elevation="12">
  {{ greetings }}
  <v-btn color="lightsecondary" variant="flat" @click="() => {
          logout();
        }">Logout</v-btn>
</v-sheet>
</v-menu> -->
    <v-progress-linear :color="labelStore.displayNameToColors[labelStore.selectedClass]" model-value="100" absolute
      bottom app />
  </v-app-bar>
</template>
