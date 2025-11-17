<template>
  <div class="p-6 pt-0">
    <slot />
  </div>
</template>

<script setup lang="ts">
interface Props {
  class?: string
}

defineProps<Props>()
</script>