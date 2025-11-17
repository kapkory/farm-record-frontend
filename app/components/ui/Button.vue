<template>
  <button
    class="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-green-500 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-green-500 text-white hover:bg-green-600 h-10 px-4 py-2"
    :disabled="disabled"
    v-bind="$attrs"
    @click="$emit('click', $event)"
  >
    <slot />
  </button>
</template>

<script setup lang="ts">
interface Props {
  class?: string
  disabled?: boolean
  variant?: string
  size?: string
}

defineProps<Props>()
defineEmits<{
  click: [event: MouseEvent]
}>()
</script>