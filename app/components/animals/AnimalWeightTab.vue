<template>
  <div class="space-y-6">
    <!-- ── Header ─────────────────────────────────────────────────────────── -->
    <div class="rounded-lg border border-gray-200 bg-white shadow-sm">
      <div class="flex flex-wrap items-start justify-between gap-3 border-b border-gray-200 px-6 py-4">
        <div>
          <Button v-if="canRecordWeight" type="button" @click="openModal" class="inline-flex items-center gap-2">
            <Plus class="h-4 w-4" />
            Record Weight
          </Button>
          
          <p class="mt-1 text-sm text-gray-500">
            {{ isGroup
              ? 'Weigh a sample of the group every few weeks and record the total — the average per head is worked out for you.'
              : 'Record the live weight every few weeks to watch growth and time sales.' }}
          </p>
        </div>
        <div v-if="nextDue" class="rounded-md bg-gray-50 px-3 py-2 text-right">
          <p class="text-xs font-medium uppercase tracking-wider text-gray-500">Next weighing</p>
          <p class="text-sm font-semibold" :class="nextDueClass">{{ nextDueLabel }}</p>
        </div>
      </div>

      <!-- Loading -->
      <div v-if="loading" class="flex items-center justify-center py-12">
        <div class="h-8 w-8 animate-spin rounded-full border-b-2 border-green-500"></div>
        <span class="ml-3 text-gray-600">Loading weights...</span>
      </div>

      <!-- Error -->
      <div v-else-if="loadError" class="rounded-b-lg bg-red-50 px-6 py-5 text-red-700">
        <p class="font-medium">Failed to load weights</p>
        <p class="mt-1 text-sm">{{ loadError }}</p>
        <button @click="fetchWeights" class="mt-2 text-sm underline hover:no-underline">Try again</button>
      </div>

      <!-- Empty -->
      <div v-else-if="!rows.length" class="px-6 py-12 text-center">
        <Scale class="mx-auto mb-2 h-10 w-10 text-gray-300" />
        <p class="text-sm text-gray-500">No weights recorded yet.</p>
        <p class="mt-1 text-xs text-gray-400">
          Record the first one and the next weighing is scheduled for you automatically.
        </p>
      </div>

      <template v-else>
        <!-- ── Stat tiles ─────────────────────────────────────────────────── -->
        <dl class="grid grid-cols-2 gap-px border-b border-gray-200 bg-gray-200 lg:grid-cols-4">
          <div class="bg-white px-6 py-4">
            <dt class="text-xs font-medium uppercase tracking-wider text-gray-500">
              {{ isGroup ? 'Current avg / head' : 'Current weight' }}
            </dt>
            <dd class="mt-1 text-2xl font-semibold text-gray-900">{{ formatKg(stats.current) }}</dd>
            <dd class="mt-0.5 text-xs text-gray-500">on {{ stats.measuredOn || '—' }}</dd>
          </div>
          <div class="bg-white px-6 py-4">
            <dt class="text-xs font-medium uppercase tracking-wider text-gray-500">Since last weighing</dt>
            <dd class="mt-1 text-2xl font-semibold" :class="deltaClass(stats.delta)">
              {{ stats.delta === null ? '—' : `${stats.delta > 0 ? '+' : ''}${stats.delta.toFixed(2)} kg` }}
            </dd>
            <dd class="mt-0.5 text-xs text-gray-500">
              {{ stats.daysSincePrevious ? `over ${stats.daysSincePrevious} days` : 'first reading' }}
            </dd>
          </div>
          <div class="bg-white px-6 py-4">
            <dt class="text-xs font-medium uppercase tracking-wider text-gray-500">Gain per day</dt>
            <dd class="mt-1 text-2xl font-semibold" :class="deltaClass(stats.gainPerDay)">
              {{ stats.gainPerDay === null ? '—' : `${stats.gainPerDay > 0 ? '+' : ''}${stats.gainPerDay.toFixed(3)}` }}
            </dd>
            <dd class="mt-0.5 text-xs text-gray-500">kg/day since last</dd>
          </div>
          <div class="bg-white px-6 py-4">
            <dt class="text-xs font-medium uppercase tracking-wider text-gray-500">Average since birth</dt>
            <dd class="mt-1 text-2xl font-semibold text-gray-900">
              {{ stats.gainPerDaySinceBirth === null ? '—' : stats.gainPerDaySinceBirth.toFixed(3) }}
            </dd>
            <dd class="mt-0.5 text-xs text-gray-500">
              {{ stats.gainPerDaySinceBirth === null ? 'date of birth unknown' : 'kg/day lifetime' }}
            </dd>
          </div>
        </dl>

        <!-- ── Trend ──────────────────────────────────────────────────────── -->
        <figure v-if="chart" class="relative px-4 pt-5 pb-2">
          <figcaption class="px-2 text-sm font-medium text-gray-700">
            {{ isGroup ? 'Average weight per head' : 'Live weight' }}
            <span class="font-normal text-gray-500">· kilograms · {{ stats.readings }} readings</span>
          </figcaption>

          <svg
            :viewBox="`0 0 ${VIEW_W} ${VIEW_H}`"
            class="mt-2 w-full touch-none"
            role="img"
            tabindex="0"
            :aria-label="chartSummary"
            @pointermove="onPointerMove"
            @pointerleave="activeIndex = null"
            @focus="activeIndex = chart.points.length - 1"
            @blur="activeIndex = null"
            @keydown="onKeydown"
          >
            <!-- Gridlines: hairline, solid, one step off the surface -->
            <g stroke="#E5E7EB" stroke-width="1">
              <line
                v-for="tick in chart.ticks"
                :key="`grid-${tick.value}`"
                :x1="PLOT.left" :x2="VIEW_W - PLOT.right"
                :y1="tick.y" :y2="tick.y"
              />
            </g>
            <g fill="#6B7280" font-size="11" text-anchor="end">
              <text
                v-for="tick in chart.ticks"
                :key="`tick-${tick.value}`"
                :x="PLOT.left - 8" :y="tick.y + 4"
              >{{ tick.label }}</text>
            </g>

            <!-- Line only: the y-axis is zoomed to the data, so an area fill
                 anchored to the plot floor would imply a magnitude from zero
                 that isn't there. -->
            <path
              :d="chart.linePath"
              fill="none"
              :stroke="LINE_COLOR"
              stroke-width="2"
              stroke-linejoin="round"
              stroke-linecap="round"
            />

            <!-- Crosshair finds the X; the reader aims at a date, not a 2px line -->
            <g v-if="activePoint">
              <line
                :x1="activePoint.x" :x2="activePoint.x"
                :y1="PLOT.top" :y2="VIEW_H - PLOT.bottom"
                stroke="#9CA3AF" stroke-width="1"
              />
              <circle :cx="activePoint.x" :cy="activePoint.y" r="5" :fill="LINE_COLOR" stroke="#FFFFFF" stroke-width="2" />
            </g>

            <!-- End marker + the one direct label: the latest value -->
            <circle :cx="chart.last.x" :cy="chart.last.y" r="4" :fill="LINE_COLOR" stroke="#FFFFFF" stroke-width="2" />
            <text
              :x="chart.last.x" :y="chart.last.y - 12"
              text-anchor="end" font-size="12" font-weight="600" fill="#374151"
            >{{ chart.last.label }}</text>

            <!-- X labels: first and last only, so dates never collide -->
            <g fill="#6B7280" font-size="11">
              <text :x="PLOT.left" :y="VIEW_H - 8" text-anchor="start">{{ chart.firstDate }}</text>
              <text :x="VIEW_W - PLOT.right" :y="VIEW_H - 8" text-anchor="end">{{ chart.lastDate }}</text>
            </g>
          </svg>

          <!-- Tooltip: value leads, label follows -->
          <div
            v-if="activePoint"
            class="pointer-events-none absolute z-10 -translate-x-1/2 rounded-md border border-gray-200 bg-white px-3 py-2 shadow-lg"
            :style="tooltipStyle"
          >
            <p class="text-sm font-semibold text-gray-900">{{ activePoint.label }}</p>
            <p class="mt-0.5 flex items-center gap-1.5 text-xs text-gray-500">
              <span class="inline-block h-0.5 w-3 rounded-full" :style="{ backgroundColor: LINE_COLOR }"></span>
              {{ activePoint.dateLabel }}
            </p>
            <p v-if="activePoint.deltaLabel" class="mt-0.5 text-xs" :class="activePoint.deltaClass">
              {{ activePoint.deltaLabel }}
            </p>
          </div>
        </figure>

        <!-- ── History (also the table view for the chart) ─────────────────── -->
        <div class="overflow-x-auto border-t border-gray-200">
          <table class="min-w-full divide-y divide-gray-200">
            <thead class="bg-gray-50">
              <tr>
                <th class="px-6 py-3 text-left text-xs font-medium uppercase text-gray-500">Date</th>
                <th class="px-6 py-3 text-left text-xs font-medium uppercase text-gray-500">
                  {{ isGroup ? 'Avg / head' : 'Weight' }}
                </th>
                <th class="px-6 py-3 text-left text-xs font-medium uppercase text-gray-500">Recorded as</th>
                <th class="px-6 py-3 text-left text-xs font-medium uppercase text-gray-500">Change</th>
                <th class="px-6 py-3 text-left text-xs font-medium uppercase text-gray-500">Gain / day</th>
                <th class="px-6 py-3 text-left text-xs font-medium uppercase text-gray-500">Notes</th>
                <th class="px-6 py-3 text-right text-xs font-medium uppercase text-gray-500">Actions</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-gray-200 bg-white">
              <tr v-for="row in rows" :key="row.uuid" class="hover:bg-gray-50">
                <td class="whitespace-nowrap px-6 py-4 text-sm text-gray-900">
                  {{ row.measured_on_human || row.measured_on || '—' }}
                  <span
                    v-if="row.synced === false"
                    class="ml-1.5 inline-flex items-center rounded-full bg-amber-100 px-1.5 py-0.5 text-[10px] font-medium text-amber-700"
                    title="Pending sync — will sync when online"
                  >
                    <CloudOff class="mr-0.5 h-2.5 w-2.5" />
                    pending
                  </span>
                </td>
                <td class="whitespace-nowrap px-6 py-4 text-sm font-medium text-gray-900">
                  {{ formatKg(row.weight_kg) }}
                </td>
                <td class="whitespace-nowrap px-6 py-4 text-sm text-gray-500">
                  {{ formatEntered(row) }}
                  <span v-if="row.sample_size && row.sample_size > 1" class="block text-xs text-gray-400">
                    from {{ row.sample_size }} head
                  </span>
                </td>
                <td class="whitespace-nowrap px-6 py-4 text-sm" :class="deltaClass(row.delta_kg)">
                  {{ row.delta_kg === null ? '—' : `${row.delta_kg > 0 ? '+' : ''}${row.delta_kg.toFixed(2)} kg` }}
                </td>
                <td class="whitespace-nowrap px-6 py-4 text-sm" :class="deltaClass(row.gain_per_day)">
                  {{ row.gain_per_day === null ? '—' : `${row.gain_per_day > 0 ? '+' : ''}${row.gain_per_day.toFixed(3)}` }}
                </td>
                <td class="max-w-xs truncate px-6 py-4 text-sm text-gray-500" :title="row.notes ?? undefined">
                  {{ row.notes || '—' }}
                </td>
                <td class="whitespace-nowrap px-6 py-4 text-right">
                  <button
                    type="button"
                    class="text-gray-400 transition-colors hover:text-red-600"
                    :aria-label="`Delete the weighing from ${row.measured_on}`"
                    @click="removeWeight(row.uuid!)"
                  >
                    <Trash2 class="h-4 w-4" />
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </template>
    </div>

    <!-- ── Record weight modal ────────────────────────────────────────────── -->
    <Teleport to="body">
      <div v-if="showModal" class="fixed inset-0 z-50 overflow-y-auto">
        <div class="fixed inset-0 bg-black bg-opacity-50" @click="closeModal"></div>

        <div class="flex min-h-full items-center justify-center p-4">
          <div class="relative w-full max-w-lg rounded-lg bg-white shadow-xl">
            <div class="flex items-start justify-between border-b border-gray-200 p-4">
              <div>
                <h3 class="text-lg font-semibold text-gray-900">Record Weight</h3>
                <p class="mt-1 text-sm text-gray-500">
                  {{ isGroup
                    ? 'Weigh a handful of head together and enter the total.'
                    : 'Enter the live weight as measured.' }}
                </p>
              </div>
              <button type="button" @click="closeModal" class="text-gray-400 transition-colors hover:text-gray-600">
                <X class="h-5 w-5" />
              </button>
            </div>

            <div v-if="errorList.length" class="mx-4 mt-4 rounded-md bg-red-50 p-3">
              <p class="text-sm font-medium text-red-800">Please fix the following:</p>
              <ul class="mt-1 list-inside list-disc text-sm text-red-700">
                <li v-for="(err, i) in errorList" :key="i">{{ err }}</li>
              </ul>
            </div>
            <div v-else-if="submitError" class="mx-4 mt-4 rounded-md bg-red-50 p-3 text-sm text-red-700">
              {{ submitError }}
            </div>

            <form @submit.prevent="saveWeight" class="space-y-4 p-4">
              <div>
                <Label class="mb-1 block text-sm font-medium text-gray-700">Date Weighed *</Label>
                <Input v-model="form.measured_on" type="date" class="w-full" :max="today" required />
                <p v-if="formErrors.measured_on" class="mt-1 text-xs text-red-600">{{ formErrors.measured_on }}</p>
              </div>

              <div v-if="isGroup">
                <Label class="mb-1 block text-sm font-medium text-gray-700">Head Weighed *</Label>
                <Input v-model.number="form.sample_size" type="number" min="1" max="1000" class="w-full" required />
                <p class="mt-1 text-xs text-gray-500">How many animals went on the scale together.</p>
                <p v-if="formErrors.sample_size" class="mt-1 text-xs text-red-600">{{ formErrors.sample_size }}</p>
              </div>

              <div>
                <Label class="mb-1 block text-sm font-medium text-gray-700">
                  {{ isGroup ? 'Total Weight of Sample *' : 'Weight *' }}
                </Label>
                <div class="flex gap-2">
                  <Input
                    v-model="form.entered_value"
                    type="number"
                    step="0.001"
                    min="0"
                    class="w-full"
                    placeholder="e.g. 18.4"
                    required
                  />
                  <select
                    v-model="form.entered_unit"
                    class="rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-transparent focus:outline-none focus:ring-2 focus:ring-green-500"
                  >
                    <option v-for="unit in WEIGHT_UNITS" :key="unit.value" :value="unit.value">{{ unit.label }}</option>
                  </select>
                </div>
                <p v-if="isGroup && samplePreviewKg" class="mt-1 text-xs text-gray-600">
                  That works out to <span class="font-semibold">{{ samplePreviewKg.toFixed(3) }} kg</span> per head.
                </p>
                <p v-if="formErrors.entered_value" class="mt-1 text-xs text-red-600">{{ formErrors.entered_value }}</p>
              </div>

              <div>
                <Label class="mb-1 block text-sm font-medium text-gray-700">Notes</Label>
                <textarea
                  v-model="form.notes"
                  rows="2"
                  placeholder="Condition, scale used, anything unusual..."
                  class="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-transparent focus:outline-none focus:ring-2 focus:ring-green-500"
                ></textarea>
              </div>

              <div class="flex items-center justify-end gap-3 border-t border-gray-200 pt-4">
                <button
                  type="button"
                  @click="closeModal"
                  class="rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-green-500"
                >
                  Cancel
                </button>
                <Button type="submit" :disabled="submitting">
                  <span v-if="submitting" class="flex items-center">
                    <div class="mr-2 h-4 w-4 animate-spin rounded-full border-b-2 border-white"></div>
                    Saving...
                  </span>
                  <span v-else>Save Weight</span>
                </Button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </Teleport>
  </div>
</template>

<script lang="ts" setup>
import { CloudOff, Plus, Scale, Trash2, X } from 'lucide-vue-next'

const props = defineProps<{
  weighableUuid: string
  trackingType: 'individual' | 'group'
  animalStatus?: string | null
  intervalDays?: number | null
  dateOfBirth?: string | null
}>()

const {
  series,
  rows,
  stats,
  nextDue,
  isGroup,
  loading,
  loadError,
  submitting,
  submitError,
  formErrors,
  errorList,
  showModal,
  form,
  samplePreviewKg,
  openModal,
  closeModal,
  fetchWeights,
  saveWeight,
  removeWeight,
  formatEntered,
  formatKg
} = useAnimalWeights(props.weighableUuid, props.trackingType, {
  intervalDays: props.intervalDays,
  dateOfBirth: props.dateOfBirth
})

const today = new Date().toISOString().split('T')[0]

const canRecordWeight = computed(() => props.animalStatus !== 'sold')

// Emerald-700. The brand green (#10B981) only reaches 2.5:1 against white,
// under the 3:1 a data mark needs; this step clears it and stays on-brand.
const LINE_COLOR = '#047857'

const VIEW_W = 720
const VIEW_H = 220
const PLOT = { left: 48, right: 20, top: 20, bottom: 28 }

const deltaClass = (value: number | null | undefined) => {
  if (value === null || value === undefined) return 'text-gray-400'
  if (value > 0) return 'text-green-700'
  if (value < 0) return 'text-red-600'
  return 'text-gray-500'
}

const shortDate = (iso: string | null | undefined) => {
  if (!iso) return ''
  const d = new Date(`${iso}T00:00:00`)
  if (Number.isNaN(d.getTime())) return String(iso)
  return d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })
}

/** Clean axis steps — 0.5 / 1 / 2 / 5 … rather than 1.734. */
const niceStep = (target: number) => {
  const steps = [0.05, 0.1, 0.2, 0.25, 0.5, 1, 2, 2.5, 5, 10, 20, 25, 50, 100, 200, 250, 500, 1000]
  return steps.find(s => s >= target) ?? 2000
}

/**
 * A weight axis is zoomed to the readings, not anchored at zero: what the
 * farmer is reading is the *change*, and forcing a 0 baseline squashes a
 * 40→120 kg run into the top third of the plot. The domain is padded a tenth
 * of the span either side, then rounded out to clean tick values.
 */
const buildScale = (values: number[]) => {
  const rawMin = Math.min(...values)
  const rawMax = Math.max(...values)
  const pad = rawMax === rawMin ? Math.max(rawMax * 0.1, 0.5) : (rawMax - rawMin) * 0.1
  const step = niceStep((rawMax - rawMin + pad * 2) / 4)
  const min = Math.max(0, Math.floor((rawMin - pad) / step) * step)
  const max = Math.ceil((rawMax + pad) / step) * step

  return { min, max, step, span: max - min || 1 }
}

// A trend needs at least two readings; one reading is a stat tile, not a line.
const chart = computed(() => {
  const points = series.value.filter(w => typeof w.weight_kg === 'number')
  if (points.length < 2) return null

  const { min, max, step, span } = buildScale(points.map(p => Number(p.weight_kg)))

  const innerW = VIEW_W - PLOT.left - PLOT.right
  const innerH = VIEW_H - PLOT.top - PLOT.bottom

  const decimals = step < 1 ? 2 : step < 10 ? 1 : 0
  const mapped = points.map((p, i) => {
    const value = Number(p.weight_kg)
    return {
      x: PLOT.left + (i / (points.length - 1)) * innerW,
      y: PLOT.top + (1 - (value - min) / span) * innerH,
      value,
      label: `${value.toFixed(2)} kg`,
      dateLabel: p.measured_on_human || p.measured_on || '',
      record: p
    }
  })

  const ticks: Array<{ value: number; y: number; label: string }> = []
  for (let v = min; v <= max + 1e-9; v += step) {
    ticks.push({
      value: v,
      y: PLOT.top + (1 - (v - min) / span) * innerH,
      label: v.toFixed(decimals)
    })
    if (ticks.length > 8) break
  }

  const linePath = mapped.map((p, i) => `${i === 0 ? 'M' : 'L'}${p.x.toFixed(2)} ${p.y.toFixed(2)}`).join(' ')
  const last = mapped[mapped.length - 1]!

  return {
    points: mapped,
    ticks,
    linePath,
    last,
    firstDate: shortDate(points[0]?.measured_on),
    lastDate: shortDate(points[points.length - 1]?.measured_on)
  }
})

const chartSummary = computed(() => {
  if (!chart.value) return 'Weight trend'
  const first = chart.value.points[0]!
  const last = chart.value.last
  return `Weight trend over ${chart.value.points.length} readings, from ${first.label} on ${first.dateLabel} to ${last.label} on ${last.dateLabel}. The table below lists every reading.`
})

const activeIndex = ref<number | null>(null)

const activePoint = computed(() => {
  if (!chart.value || activeIndex.value === null) return null
  const point = chart.value.points[activeIndex.value]
  if (!point) return null

  const previous = activeIndex.value > 0 ? chart.value.points[activeIndex.value - 1] : null
  const delta = previous ? Math.round((point.value - previous.value) * 1000) / 1000 : null

  return {
    ...point,
    deltaLabel: delta === null ? null : `${delta > 0 ? '+' : ''}${delta.toFixed(2)} kg since last`,
    deltaClass: deltaClass(delta)
  }
})

const tooltipStyle = computed(() => {
  if (!activePoint.value) return {}
  // The svg fills the figure's inner width, so viewBox units map straight to a
  // percentage — no measuring needed, and it survives a resize.
  // Clamped so a reading at either end doesn't push the tooltip off the card.
  const percent = (activePoint.value.x / VIEW_W) * 100
  return {
    left: `${Math.min(88, Math.max(12, percent))}%`,
    top: '0.5rem'
  }
})

// The crosshair snaps to the nearest reading: the reader aims at a date.
const onPointerMove = (event: PointerEvent) => {
  if (!chart.value) return
  const target = event.currentTarget as SVGSVGElement | null
  if (!target) return

  const rect = target.getBoundingClientRect()
  if (!rect.width) return

  const xInView = ((event.clientX - rect.left) / rect.width) * VIEW_W
  let nearest = 0
  let best = Infinity
  chart.value.points.forEach((point, index) => {
    const distance = Math.abs(point.x - xInView)
    if (distance < best) { best = distance; nearest = index }
  })
  activeIndex.value = nearest
}

// Keyboard readers get the same values as hover.
const onKeydown = (event: KeyboardEvent) => {
  if (!chart.value) return
  const lastIndex = chart.value.points.length - 1
  const current = activeIndex.value ?? lastIndex

  if (event.key === 'ArrowRight') {
    activeIndex.value = Math.min(lastIndex, current + 1)
    event.preventDefault()
  } else if (event.key === 'ArrowLeft') {
    activeIndex.value = Math.max(0, current - 1)
    event.preventDefault()
  } else if (event.key === 'Home') {
    activeIndex.value = 0
    event.preventDefault()
  } else if (event.key === 'End') {
    activeIndex.value = lastIndex
    event.preventDefault()
  } else if (event.key === 'Escape') {
    activeIndex.value = null
  }
}

const nextDueLabel = computed(() => {
  const due = nextDue.value
  if (!due) return '—'
  if (due.inDays === null) return due.date
  if (due.inDays > 1) return `in ${due.inDays} days`
  if (due.inDays === 1) return 'tomorrow'
  if (due.inDays === 0) return 'due today'
  return `overdue by ${Math.abs(due.inDays)} day${Math.abs(due.inDays) === 1 ? '' : 's'}`
})

const nextDueClass = computed(() => {
  const days = nextDue.value?.inDays
  if (days === null || days === undefined) return 'text-gray-600'
  if (days < 0) return 'text-red-600'
  if (days <= 3) return 'text-amber-600'
  return 'text-gray-900'
})
</script>
