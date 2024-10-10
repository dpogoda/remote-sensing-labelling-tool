<script setup lang="ts">
import { shallowRef, type Ref } from 'vue';
import { useCustomizerStore } from '../../../stores/customizer';
import { type menu } from './sidebarItem';

import Logo from '../logo/LogoMain.vue';
import { useLabelCanvasStore } from '@/stores/canvasHandlerStore';
import { watch } from 'vue';
import { ChalkboardIcon, GitForkIcon, ListIcon, SettingsIcon } from 'vue-tabler-icons';
import * as packageJson from '../../../../package.json';
import { formatHkBadge } from '@/utils/helpers/common';
import { useSettingsStore } from '@/stores/settingStore';
import { HistoryHandler } from '@/eventhandlers/HistoryHandler';
import { clearImage } from '@/canvashandlers/drawingtools/Simple';
import CursorPicker from '@/views/editor/components/CursorPicker.vue';
import NormalizationPicker from '@/views/editor/components/NormalizationPicker.vue';
import Margin from '@/views/editor/components/Margin.vue';
import { performNearestNeighbor } from '@/canvashandlers/drawingtools/NearestNeighbor';
import { useNavStore } from '@/stores/navStore';

const customizer = useCustomizerStore();
const labelStore = useLabelCanvasStore();

const settingsStore = useSettingsStore();

// const dynamicTodos = shallowRef(labelStore.todos);
const sidebarItems: Ref<menu[]> = shallowRef([])

function formatTitle(title: string) {
  if (!title.length) return '';
  let a = title.split('_')[0]
  a = a.charAt(0).toUpperCase() + a.slice(1)
  let b = title.split('_')[1]
  b = b.charAt(0).toUpperCase() + b.slice(1)
  return a + ' ' + b
}

// watch(() => labelStore.listOfImages, (newListOfImages) => {

//   sidebarItems.value = [
//     {
//       title: 'Tutorial',
//       icon: ChalkboardIcon,
//       to: '/tutorial'
//     },
//     {
//       title: 'Todos',
//       icon: ListIcon,
//       to: '/todos',
//       children: newListOfImages.map((image) => {
//         return {
//           title: formatTitle(image.title),
//           to: `/todos?title=${image.title}&full-title=${image.fullTitle}`,
//           tags: image.tags || [],
//           shortNote: image.shortNote,
//           fullTitle: image.fullTitle
//         }
//       })
//     },
//     {
//       title: 'Settings',
//       icon: SettingsIcon,
//       to: '/settings'
//     },
//     {
//       title: 'Changelogs',
//       icon: GitForkIcon,
//       to: '/changelogs'
//     },
//   ]
// }, { deep: true });

function nearestNeighbor() {
  let sourceCanvas = document.getElementById('Source Image')! as HTMLCanvasElement
  let drawingLayer = document.getElementById('Drawing Layer 1')! as HTMLCanvasElement
  performNearestNeighbor(sourceCanvas, drawingLayer, {
    b1: labelStore.b1Raw,
    b2: labelStore.rgbRaw[2],
    b3: labelStore.rgbRaw[1],
    b4: labelStore.rgbRaw[0],
    b5: labelStore.b5Raw,
    b6: labelStore.b6Raw,
    b7: labelStore.b7Raw,
    b8: labelStore.b8Raw,
    b9: labelStore.b9Raw,
    b11: labelStore.b11Raw,
    b12: labelStore.b12Raw,
    b8a: labelStore.b8aRaw
  });
}


const navStore = useNavStore();

</script>

<template>
  <v-navigation-drawer left elevation="0" rail-width="80" app permanent :rail="true" v-if="!navStore.uploadActive">
    <!---Logo part -->

    <!-- <div class="pa-5 d-flex align-center justify-space-between">
      <Logo />
    </div> -->

    <perfect-scrollbar class="scrollnavbar" style="margin: 5px">
      <!-- <v-toolbar> -->
      <!-- <v-badge :color="labelStore.showHotKeyBadges ? 'rgba(33,33,33,1)' : 'rgba(0,0,0,0)'"
        :content="formatHkBadge('hk_toggle_pen', settingsStore)"> -->
      <v-tooltip text="[Q] Plain Drawing Tool">
        <template v-slot:activator="{ props }">
          <v-btn v-bind="props" size="small" variant="text" icon="mdi-pen" :disabled="labelStore.mapActive"
            :active="labelStore.drawingActive" @click="labelStore.activateTool('simpledraw')"></v-btn>
        </template>
      </v-tooltip>
      <!-- </v-badge> -->

      <!-- <v-badge :color="labelStore.showHotKeyBadges ? 'rgba(33,33,33,1)' : 'rgba(0,0,0,0)'"
        :content="formatHkBadge('hk_toggle_eraser', settingsStore)"> -->
      <v-tooltip text="[W] Eraser">
        <template v-slot:activator="{ props }">
          <v-btn v-bind="props" size="small" variant="text" icon="mdi-eraser" :disabled="labelStore.mapActive"
            :active="labelStore.eraserActive" @click="labelStore.activateTool('eraser')"></v-btn>
        </template>
      </v-tooltip>
      <!-- </v-badge> -->

      <!-- <v-badge :color="labelStore.showHotKeyBadges ? 'rgba(33,33,33,1)' : 'rgba(0,0,0,0)'"
        :content="formatHkBadge('hk_toggle_pan', settingsStore)"> -->
      <v-btn size="small" variant="text" :disabled="labelStore.mapActive" icon="mdi-cursor-move"
        @click="labelStore.activateTool('pan')" :active="labelStore.panMoveActive"></v-btn>
      <!-- </v-badge> -->

      <!-- <v-badge :color="labelStore.showHotKeyBadges ? 'rgba(33,33,33,1)' : 'rgba(0,0,0,0)'"
        :content="formatHkBadge('hk_toggle_magic_stick', settingsStore)"> -->


      <v-menu v-model="labelStore.magicStick.menuOpen" :close-on-content-click="false">
        <template v-slot:activator="{ props }">
          <v-btn @click="labelStore.activateTool('wand')" size="small" variant="text"
            :active="labelStore.magicStick.active"
            :style="{ borderWidth: labelStore.magicStick.active ? '2px' : 0, borderColor: labelStore.magicStick.active ? labelStore.magicStick.overwriteClass : 'primary' }"
            :disabled="labelStore.mapActive" icon="mdi-auto-fix" v-bind="props">
          </v-btn>
        </template>

        <v-card max-width="300" min-width="300" class="pa-5">
          <div class="text-h4">Wand Tool</div>
          <div class="text-body-2">The wand tool lets you replace a certain color when
            overpainting it without interfering
            with other colors.</div>
          <!-- <Margin />
          <Margin />
          <div class="text-h5">Layer to draw on</div>
          <Margin />
          <v-select variant="plain" v-model="labelStore.magicStick.drawLayer" label="Layers" :items="Array.from(labelStore.layerNameToCanvas.keys()).map(x => {
            if (x.startsWith('Drawing Layer')) {
              return x;
            }
          })">
          </v-select> -->
          <div class="text-h5">Please pick a color that should be replaced</div>
          <Margin />

          <div style="width: 100px; height: 50px;" :style="{ backgroundColor: labelStore.pixelClassInfo }">

          </div>
        </v-card>
      </v-menu>
      <!-- </v-badge> -->


      <!-- <v-badge :color="labelStore.showHotKeyBadges ? 'rgba(33,33,33,1)' : 'rgba(0,0,0,0)'" -->
      <!-- :content="formatHkBadge('hk_toggle_ab_stick', settingsStore)"> -->
      <v-btn size="small" variant="text" :disabled="labelStore.mapActive" icon="mdi-ab-testing"
        @click="labelStore.activateTool('ab')" :active="labelStore.abStick.active"></v-btn>
      <!-- </v-badge> -->

      <!-- <v-badge :color="labelStore.showHotKeyBadges ? 'rgba(33,33,33,1)' : 'rgba(0,0,0,0)'"
        :content="formatHkBadge('hk_toggle_bucket_fill', settingsStore)"> -->

      <v-btn size="small" variant="text" :disabled="labelStore.mapActive" icon="mdi-format-color-fill"
        @click="labelStore.activateTool('bucket')" :active="labelStore.bucketFill.active"></v-btn>
      <!-- </v-badge> -->

      <v-dialog max-width="500">
        <template v-slot:activator="{ props: activatorProps }">
          <v-btn size="small" variant="text" icon="mdi-content-save" @click="labelStore.saveMenuOpen = true"
            v-bind="activatorProps"></v-btn>
        </template>

        <template v-slot:default="{ isActive }">
          <v-card title="Save">
            <v-card-text>
              <!-- <v-switch color="primary" v-model="labelStore.saveWithGMM"
                :label="`${labelStore.saveWithGMM ? 'Use' : 'Don\'t'} GMM as base`" /> -->
              <div class="text-h5">This text will appear in the side menu as additional
                info (optional)</div>
              <Margin />
              <v-text-field variant="outlined" v-model="labelStore.shortNote" label="Short note"></v-text-field>
              <div class="text-h5">Give more feedback on the data set here (optional)
              </div>
              <Margin />
              <v-textarea variant="outlined" v-model="labelStore.longNote" label="Long note"></v-textarea>
              <v-btn color="primary" @click="labelStore.saveState(labelStore.shortNote, labelStore.longNote).then(() => {
                labelStore.saveMenuOpen = false; isActive.value = false;
              })">Save</v-btn>
            </v-card-text>

            <v-card-actions>
              <v-spacer></v-spacer>

              <v-btn text="Cancel" @click="labelStore.saveMenuOpen = false, isActive.value = false"></v-btn>
            </v-card-actions>
          </v-card>
        </template>
      </v-dialog>
      <v-btn size="small" variant="text" icon="mdi-map" @click="labelStore.mapActive = !labelStore.mapActive"></v-btn>

      <!-- <v-badge :color="labelStore.showHotKeyBadges ? 'rgba(33,33,33,1)' : 'rgba(0,0,0,0)'"
        :content="formatHkBadge('hk_undo', settingsStore)"> -->
      <v-btn size="small" variant="text" :disabled="labelStore.mapActive" icon="mdi-undo"
        @click="HistoryHandler.getInstance().undo"></v-btn>
      <!-- </v-badge> -->
      <!-- <Margin /> -->
      <!-- <v-badge :color="labelStore.showHotKeyBadges ? 'rgba(33,33,33,1)' : 'rgba(0,0,0,0)'"
        :content="formatHkBadge('hk_redo', settingsStore)"> -->
      <v-btn size="small" variant="text" :disabled="labelStore.mapActive" icon="mdi-redo"
        @click="HistoryHandler.getInstance().redo"></v-btn>
      <!-- </v-badge> -->
      <!-- <Margin /> -->

      <!-- <v-badge :color="labelStore.showHotKeyBadges ? 'rgba(33,33,33,1)' : 'rgba(0,0,0,0)'"
        :content="formatHkBadge('hk_map', settingsStore)"> -->
      <!-- </v-badge> -->

      <v-menu v-model="labelStore.brightnessContrastMenuActive" :close-on-content-click="false" location="end">
        <template v-slot:activator="{ props }">
          <v-btn size="small" variant="text" :disabled="labelStore.mapActive" icon v-bind="props">
            <v-icon>mdi-tune-variant</v-icon>
          </v-btn>
        </template>

        <v-card min-width="300" id="fine-tuner">
          <v-list>
            <v-list-item>
              <p class="text-body-4">Contrast/Brightness</p>
            </v-list-item>
            <v-list-item>
              <v-slider :max="100" :min="-100" :step="1" v-model="labelStore.rawMapContrast"
                prepend-icon="mdi-contrast-circle"></v-slider>
            </v-list-item>
            <v-list-item>
              <v-slider :max="255" :min="-255" :step="1" v-model="labelStore.rawMapBrightness"
                prepend-icon="mdi-brightness-5"></v-slider>
            </v-list-item>
            <v-list-item>
              <v-btn icon="mdi-restart" color="purple"
                @click="labelStore.rawMapBrightness = 0, labelStore.rawMapContrast = 0"></v-btn>
            </v-list-item>
            <v-list-item>
              <v-btn color="purple" @click="clearImage(labelStore)">Clear Image</v-btn>
            </v-list-item>
          </v-list>

          <v-card-actions>
            <v-spacer></v-spacer>
            <v-btn color="primary" variant="text" @click="labelStore.brightnessContrastMenuActive = false">
              Done
            </v-btn>
          </v-card-actions>
        </v-card>
      </v-menu>

      <v-btn size="small" variant="plain" icon="mdi-theme-light-dark"
        @click="labelStore.theme = labelStore.theme === 'DarkPurpleTheme' ? 'PurpleTheme' : 'DarkPurpleTheme'" />

      <v-tooltip max-width="300"
        text="Performs a nearest neighbor classification on the source image based on the so-far-labelled pixels">
        <template v-slot:activator="{ props }">
          <v-btn v-bind="props" size="small" variant="plain" icon="mdi-home-group" @click="nearestNeighbor" />
        </template>
      </v-tooltip>

      <NormalizationPicker />

      <!-- <v-badge :color="labelStore.showHotKeyBadges ? 'rgba(33,33,33,1)' : 'rgba(0,0,0,0)'"
        :content="formatHkBadge('hk_decr_pen_size', settingsStore) + '&' + formatHkBadge('hk_incr_pen_size', settingsStore)"> -->
      <CursorPicker />
      <!-- </v-badge> -->
      <!-- 
      <div v-for="tag in labelStore.availableTags" :key="tag" class="d-flex align-center">
        <v-chip density="compact" :disabled="labelStore.updatingTag" @click="labelStore.selectTag(tag)"
          :class="{ 'text-primary': labelStore.currentTags.includes(tag) || labelStore.currentTags.length === 0 && tag === 'unstarted' }">
          {{ tag }}
        </v-chip>
        <Margin />
      </div> -->


      <!-- <v-btn size="small" variant="text" icon="mdi-keyboard-variant"
        @click="labelStore.showHotKeyBadges = !labelStore.showHotKeyBadges"></v-btn> -->

      <!-- <Margin /> -->

      <!-- </v-toolbar> -->
      <!-- <v-list class="pa-4" :v-model:opened="true"> -->
      <!-- <template v-for="(item, i) in sidebarItems" :key="i"> -->
      <!-- <NavGroup :item="item" v-if="item.header" :key="item.title" />
          <v-divider class="my-3" v-else-if="item.divider" />
          <NavCollapse class="leftPadding" :item="item" :level="0" v-else-if="item.children" />
          <NavItem :item="item" v-else class="leftPadding" /> -->

      <!-- </template> -->
      <!-- </v-list> -->

      <div class="mt-5 pa-1 text-center">
        <v-chip color="inputBorder" size="small">v{{ packageJson.version }}</v-chip>
      </div>
    </perfect-scrollbar>
  </v-navigation-drawer>
</template>
