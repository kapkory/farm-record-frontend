<template>
    <!-- Plantings Tab -->
    <div>
        <div class="flex justify-between items-center mb-4">
        <h3 class="text-lg font-medium text-gray-900">Plantings Summary</h3>
        <Button>
            <Plus class="w-4 h-4 mr-2" />
            Add Planting
        </Button>
        </div>
        <div class="overflow-x-auto">
        <table class="min-w-full divide-y divide-gray-200">
            <thead class="bg-gray-50">
            <tr>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Crop</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Variety</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Area</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Planted Date</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Expected Harvest</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                <th class="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Actions</th>
            </tr>
            </thead>
            <tbody class="bg-white divide-y divide-gray-200">
            <tr v-for="planting in plantings" :key="planting.id" class="hover:bg-gray-50">
                <td class="px-6 py-4 whitespace-nowrap">
                <div class="flex items-center gap-2">
                    <Sprout class="w-4 h-4 text-green-500" />
                    <span class="text-sm font-medium text-gray-900">{{ planting.crop }}</span>
                </div>
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{{ planting.variety }}</td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{{ planting.area }}</td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{{ planting.plantedDate }}</td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{{ planting.expectedHarvest }}</td>
                <td class="px-6 py-4 whitespace-nowrap">
                <span :class="[
                    'px-2 py-1 text-xs font-semibold rounded-full',
                    planting.status === 'growing' ? 'bg-green-100 text-green-800' :
                    planting.status === 'harvesting' ? 'bg-amber-100 text-amber-800' :
                    planting.status === 'completed' ? 'bg-blue-100 text-blue-800' : 'bg-gray-100 text-gray-800'
                ]">
                    {{ planting.status }}
                </span>
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                <button class="text-green-600 hover:text-green-900 mr-3">
                    <Eye class="w-4 h-4" />
                </button>
                <button class="text-gray-600 hover:text-gray-900">
                    <Pencil class="w-4 h-4" />
                </button>
                </td>
            </tr>
            </tbody>
        </table>
        </div>
    </div>
</template>

<script setup>  
import { Plus, Sprout, Eye, Pencil } from 'lucide-vue-next';
const plantings = [
  {
    id: 1,
    crop: 'Corn',
    variety: 'Sweet Corn',
    area: '5 acres',
    plantedDate: '2024-04-01',
    expectedHarvest: '2024-09-15',
    status: 'growing'
  },
  {
    id: 2,
    crop: 'Wheat',
    variety: 'Hard Red Winter',
    area: '10 acres',
    plantedDate: '2024-03-15',
    expectedHarvest: '2024-08-30',
    status: 'harvesting'
  },
  {
    id: 3,
    crop: 'Soybeans',
    variety: 'Glycine Max',
    area: '8 acres',
    plantedDate: '2024-05-10',
    expectedHarvest: '2024-10-20',
    status: 'growing'
  }
];
</script>