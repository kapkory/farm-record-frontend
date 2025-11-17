<template>
  <div class="flex flex-col space-y-1.5 p-6">
    <slot />
  </div>
</template>

<script setup lang="ts">
interface Props {
  class?: string
}

defineProps<Props>()
</script>