<template>
  <footer class="bg-white border-t border-gray-200 px-6 py-3 flex items-center justify-between text-sm text-gray-500">
    <span>© {{ currentYear }} Farmconsul</span>
    <div class="flex items-center gap-6">
      <a href="#" class="hover:text-green-600 transition-colors">Privacy</a>
      <a href="#" class="hover:text-green-600 transition-colors">Terms</a>
      <span class="px-2 py-0.5 bg-green-100 text-green-700 text-xs font-medium rounded">v1.0</span>
    </div>
  </footer>
</template>

<script setup>
const currentYear = new Date().getFullYear()
</script>
