<script setup>
import { useLabelCanvasStore } from '@/stores/canvasHandlerStore';
import { useRoute } from 'vue-router';
import Icon from '../IconSet.vue';
import Margin from '@/views/editor/components/Margin.vue';

const route = useRoute();

const props = defineProps({ item: Object, level: Number });
const labelStore = useLabelCanvasStore();
</script>

<template>
  <!---Single Item-->
  <v-list-item :to="item.type === 'external' ? '' : item.to" :href="item.type === 'external' ? item.to : ''" rounded
    class="mb-1" color="secondary" :disabled="item.disabled" :target="item.type === 'external' ? '_blank' : ''"
    :active="labelStore.currentImage.fullTitle == item.fullTitle">
    <!---If icon-->
    <template v-slot:prepend>
      <Icon :item="props.item.icon" :level="props.level" />
    </template>
    <v-list-item-title>{{ item.title }}</v-list-item-title>
    <!---If Caption-->

    <!-- Short Note Tag -->
    <v-list-item-subtitle v-if="item.shortNote" class="text-caption mt-n1 hide-menu text-primary">
      {{ item.shortNote }}
    </v-list-item-subtitle>

    <!-- Unstarted Tag -->
    <v-list-item-subtitle
      v-if="item.tags && item.tags.length === 0 || item.tags && item.tags.find(x => x === 'unstarted')"
      class="text-caption mt-n1 hide-menu text-error">
      unstarted
    </v-list-item-subtitle>

    <!-- Other Tags -->
    <v-list-item-subtitle v-if="item.tags?.length" class="text-caption mt-n1 hide-menu text-info">
      {{ item.tags.filter(t => t !== 'done' && t !== 'unstarted').join(', ') }}
    </v-list-item-subtitle>
    <Margin />

    <!-- Done Tag -->
    <v-list-item-subtitle v-if="item.tags?.length && item.tags.filter(x => x === 'done').length"
      class="text-caption mt-n1 hide-menu text-success">
      <v-chip size='x-small'>{{ item.tags.filter(t => t === 'done').join(', ') }}</v-chip>
    </v-list-item-subtitle>

  </v-list-item>
</template>
