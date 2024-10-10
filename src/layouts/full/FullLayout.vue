<script setup lang="ts">
import { RouterView, onBeforeRouteUpdate } from 'vue-router';
import VerticalSidebarVue from './vertical-sidebar/VerticalSidebar.vue';
import VerticalHeaderVue from './vertical-header/VerticalHeader.vue';
import Customizer from './customizer/CustomizerPanel.vue';
import FooterPanel from './footer/FooterPanel.vue';
import { useCustomizerStore } from '../../stores/customizer';
import { useLabelCanvasStore } from '@/stores/canvasHandlerStore';
import LayerNavBar from '@/views/editor/components/LayerNavBar.vue';
import { onMounted, ref, watch, type Ref } from 'vue';
import { useRoute } from 'vue-router';
import { formatTitle } from '@/views/editor/components/common';
import { ChalkboardIcon, ListIcon, SettingsIcon, GitForkIcon } from 'vue-tabler-icons';
import type { menu } from './vertical-sidebar/sidebarItem';
import NavGroup from '@/layouts/full/vertical-sidebar/NavGroup/NavGroup.vue';
import NavCollapse from '@/layouts/full/vertical-sidebar/NavCollapse/NavCollapse.vue';
import NavItem from '@/layouts/full/vertical-sidebar/NavItem/NavItem.vue';
import { useUiStore } from '@/stores/uiStore';

const customizer = useCustomizerStore();
const labelStore = useLabelCanvasStore();
const uiStore = useUiStore();

const route = useRoute();

const sidebarItems: Ref<menu[]> = ref([]);

onMounted(() => {
  labelStore.loadListOfImages();
  labelStore.loadTags();
});

watch(() => labelStore.listOfImages, (newListOfImages) => {

  sidebarItems.value = [
    {
      title: 'Editor',
      icon: ChalkboardIcon,
      to: '/todos'
    },
    {
      title: 'Settings',
      icon: SettingsIcon,
      to: '/settings'
    },
    {
      title: 'Changelogs',
      icon: GitForkIcon,
      to: '/changelogs'
    },
  ]
}, { deep: true });

onBeforeRouteUpdate((to, from, next) => {
  if (to.name !== 'Editor') {
    uiStore.showNavMenu = true;
  }
  next();
});

onMounted(() => {
  if (route.name !== 'Editor') {
    uiStore.showNavMenu = true;
  }
});

</script>

<template>
  <v-locale-provider>
    <v-app :theme="labelStore.theme"
      :class="[customizer.fontTheme, customizer.mini_sidebar ? 'mini-sidebar' : '', customizer.inputBg ? 'inputWithbg' : '']">

      <VerticalHeaderVue />
      <VerticalSidebarVue v-if="route.name === 'Editor'" />
      <LayerNavBar />

      <v-navigation-drawer v-model="uiStore.showNavMenu" :temporary="route.name === 'Editor'" persistent>
        <perfect-scrollbar class="scrollnavbar">
          <v-list class="pa-4" :v-model:opened="true">
            <template v-for="(item, i) in sidebarItems" :key="i">
              <NavGroup :item="item" v-if="item.header" :key="item.title" />
              <v-divider class="my-3" v-else-if="item.divider" />
              <NavCollapse class="leftPadding" :item="item" :level="0" v-else-if="item.children" />
              <NavItem :item="item" v-else class="leftPadding" />
            </template>
          </v-list>
        </perfect-scrollbar>
      </v-navigation-drawer>

      <v-main>
        <v-container fluid class="page-wrapper" :class="{
          'pa-0': route.path.includes('/todos') ? true : false,
        }">
          <div>
            <RouterView />
          </div>
        </v-container>
        <v-container fluid class="pt-0">
          <div>
            <!-- <FooterPanel /> -->
          </div>
        </v-container>
      </v-main>
    </v-app>
  </v-locale-provider>
</template>
