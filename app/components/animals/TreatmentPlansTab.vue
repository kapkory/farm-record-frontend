<template>
  <div>
    <!-- Error State -->
    <div v-if="error" class="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700 mb-4">
      <p class="font-medium">Failed to load vaccination plans</p>
      <p class="text-sm mt-1">{{ error }}</p>
      <button class="mt-2 text-sm underline hover:no-underline" @click="fetchPlans">Try again</button>
    </div>

    <!-- Data table (rendered immediately; rows fill in when data lands) -->
    <div class="bg-white shadow rounded-lg overflow-hidden">
      <div class="px-4 py-3 border-b border-gray-200 flex justify-between items-center">
        <div>
          <h3 class="text-lg font-medium text-gray-900">Vaccination Plans</h3>
          <p class="text-xs text-gray-500 mt-0.5">
            Reusable vaccination/treatment schedules. Pick one when adding a flock or animal and the reminders are created for you.
          </p>
        </div>
        <NuxtLink to="/admin/settings/livestock/treatment-plan/new">
          <Button>
            <Plus class="w-4 h-4 mr-2" />
            Add Plan
          </Button>
        </NuxtLink>
      </div>

      <div class="overflow-x-auto">
        <table class="min-w-full divide-y divide-gray-200">
          <thead class="bg-gray-50">
            <tr>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-8"></th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Animal Type</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Steps</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
              <th class="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody class="bg-white divide-y divide-gray-200">
            <tr v-if="!plans.length">
              <td colspan="6" class="px-6 py-10 text-center text-sm text-gray-400">
                No vaccination plans yet — click "Add Plan" to create your first one.
              </td>
            </tr>
            <template v-for="plan in plans" :key="plan.uuid">
              <tr class="hover:bg-gray-50 cursor-pointer" @click="toggleExpand(plan.uuid)">
                <td class="px-6 py-4 whitespace-nowrap">
                  <ChevronRight
                    class="w-4 h-4 text-gray-400 transition-transform duration-200"
                    :class="{ 'rotate-90': expandedUuid === plan.uuid }"
                  />
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                  <span class="text-sm font-medium text-gray-900">{{ plan.name }}</span>
                  <span
                    v-if="plan.is_system"
                    class="ml-2 px-1.5 py-0.5 text-xs font-medium rounded-full bg-blue-50 text-blue-700"
                  >
                    Default
                  </span>
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{{ plan.animal_type || 'Any' }}</td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{{ plan.activities?.length ?? 0 }}</td>
                <td class="px-6 py-4 whitespace-nowrap">
                  <span
                    class="px-2 py-0.5 text-xs font-medium rounded-full"
                    :class="plan.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'"
                  >
                    {{ plan.status }}
                  </span>
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-right text-sm" @click.stop>
                  <template v-if="!plan.is_system">
                    <NuxtLink
                      :to="`/admin/settings/livestock/treatment-plan/${plan.uuid}`"
                      class="text-green-600 hover:text-green-800 font-medium mr-3"
                    >
                      Edit
                    </NuxtLink>
                    <button
                      class="text-gray-400 hover:text-red-600 font-medium"
                      :disabled="deletingUuid === plan.uuid"
                      @click="deletePlan(plan)"
                    >
                      {{ deletingUuid === plan.uuid ? 'Deleting…' : 'Delete' }}
                    </button>
                  </template>
                  <span v-else class="text-xs text-gray-400">Read-only</span>
                </td>
              </tr>
              <!-- Expanded steps -->
              <tr v-if="expandedUuid === plan.uuid">
                <td colspan="6" class="px-6 py-4 bg-gray-50">
                  <ul class="space-y-1.5">
                    <li
                      v-for="activity in plan.activities"
                      :key="activity.uuid"
                      class="text-sm text-gray-700 flex gap-3"
                    >
                      <span class="font-medium text-gray-500 w-20 shrink-0">{{ activity.age_label }}</span>
                      <span>
                        {{ activity.vaccine }}
                        <template v-if="activity.disease"> — {{ activity.disease }}</template>
                        <span v-if="activity.route" class="text-gray-400"> ({{ activity.route }})</span>
                      </span>
                    </li>
                  </ul>
                </td>
              </tr>
            </template>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { ChevronRight, Plus } from 'lucide-vue-next'

interface PlanActivity {
  uuid: string
  vaccine: string
  disease?: string | null
  route?: string | null
  age_days: number
  age_label: string
}

interface TreatmentPlanRow {
  uuid: string
  name: string
  animal_type?: string | null
  status: 'active' | 'inactive'
  is_system: boolean
  activities: PlanActivity[]
}

const { $apiFetch } = useNuxtApp()
const { getReference } = useReferenceData()

const plans = ref<TreatmentPlanRow[]>([])
const error = ref<string | null>(null)
const expandedUuid = ref<string | null>(null)
const deletingUuid = ref<string | null>(null)

const toggleExpand = (uuid: string) => {
  expandedUuid.value = expandedUuid.value === uuid ? null : uuid
}

const fetchPlans = async () => {
  error.value = null
  try {
    const { data } = await getReference<TreatmentPlanRow>('treatment_plans')
    plans.value = data
  } catch (err: any) {
    error.value = err?.message || 'Unknown error'
  }
}

const deletePlan = async (plan: TreatmentPlanRow) => {
  if (!confirm(`Delete "${plan.name}"? Flocks already using it keep their existing reminders.`)) return
  deletingUuid.value = plan.uuid
  try {
    await $apiFetch('/sanctum/csrf-cookie')
    await $apiFetch(`/api/v1/settings/animals/treatment-plans/${plan.uuid}`, { method: 'DELETE' })
    plans.value = plans.value.filter(p => p.uuid !== plan.uuid)
  } catch (err: any) {
    error.value = err?.data?.message || 'Could not delete the plan (are you online?)'
  } finally {
    deletingUuid.value = null
  }
}

onMounted(fetchPlans)
</script>
