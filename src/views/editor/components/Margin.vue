<script setup lang="ts">
import { defineProps } from 'vue';

const props = defineProps({
    margin: {
        type: Number,
        default: 1
    }
});
</script>
<template>
    <div :class="'ma-' + props.margin" />
</template>