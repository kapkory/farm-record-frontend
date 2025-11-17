<template>
  <p class="text-sm text-gray-500">
    <slot />
  </p>
</template>

<script setup lang="ts">
interface Props {
  class?: string
}

defineProps<Props>()
</script>