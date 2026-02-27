<template>
        <!-- Livestock Tab -->
    <div>
        <div class="flex justify-between items-center mb-4">
        <h3 class="text-lg font-medium text-gray-900">Livestock Summary</h3>
        <Button>
            <Plus class="w-4 h-4 mr-2" />
            Add Livestock
        </Button>
        </div>
        <div class="overflow-x-auto">
        <table class="min-w-full divide-y divide-gray-200">
            <thead class="bg-gray-50">
            <tr>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Animal Type</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Breed</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Count</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Purpose</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Health Status</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Last Checkup</th>
                <th class="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Actions</th>
            </tr>
            </thead>
            <tbody class="bg-white divide-y divide-gray-200">
            <tr v-for="animal in livestock" :key="animal.id" class="hover:bg-gray-50">
                <td class="px-6 py-4 whitespace-nowrap">
                <div class="flex items-center gap-2">
                    <Beef class="w-4 h-4 text-amber-500" />
                    <span class="text-sm font-medium text-gray-900">{{ animal.type }}</span>
                </div>
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{{ animal.breed }}</td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900 font-medium">{{ animal.count }}</td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{{ animal.purpose }}</td>
                <td class="px-6 py-4 whitespace-nowrap">
                <span :class="[
                    'px-2 py-1 text-xs font-semibold rounded-full',
                    animal.healthStatus === 'healthy' ? 'bg-green-100 text-green-800' :
                    animal.healthStatus === 'attention' ? 'bg-amber-100 text-amber-800' :
                    'bg-red-100 text-red-800'
                ]">
                    {{ animal.healthStatus }}
                </span>
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{{ animal.lastCheckup }}</td>
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
import { Plus, Beef, Eye, Pencil } from 'lucide-vue-next';
const livestock = [
  {
    id: 1,
    type: 'Cattle',
    breed: 'Angus',
    count: 20,
    purpose: 'Beef',
    healthStatus: 'healthy',
    lastCheckup: '2024-04-01'
  },
  {
    id: 2,
    type: 'Sheep',
    breed: 'Merino',
    count: 15,
    purpose: 'Wool',
    healthStatus: 'attention',
    lastCheckup: '2024-03-15'
  },
  {
    id: 3,
    type: 'Goat',
    breed: 'Boer',
    count: 10,
    purpose: 'Meat',
    healthStatus: 'healthy',
    lastCheckup: '2024-05-10'
  }
];
</script>