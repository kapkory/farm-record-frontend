<template>
  <div class="rounded-lg border bg-white text-gray-900 shadow-sm" v-bind="$attrs">
    <slot />
  </div>
</template>

<script setup lang="ts">
interface Props {
  class?: string
}

defineProps<Props>()
</script>