export type LedgerType = 'revenue' | 'expense' | 'asset' | 'liability' | 'equity'

export interface AnimalLedgerAccount {
  id: number
  uuid?: string
  name: string
  type: LedgerType
  description: string | null
  is_system: boolean
  parent_id: number | null
}

export interface AnimalLedgerTransactionRow {
  id: number | string
  date: string
  type: LedgerType
  account_name: string
  amount: number
  quantity: number | null
  unit_cost: number | null
  payment_method: string | null
  notes: string | null
  reference_number: string | null
}

interface LedgerTransactionListEntry {
  amount?: number | string | null
  quantity?: number | string | null
  unit_cost?: number | string | null
  ledger_account_id?: number | string | null
  ledgerAccount?: { name?: string | null; type?: LedgerType | null } | null
  ledger_account?: { name?: string | null; type?: LedgerType | null } | null
}

interface LedgerTransactionListItem {
  id?: number | string
  uuid?: string
  date?: string | null
  payment_method?: string | null
  description?: string | null
  reference_number?: string | null
  transaction_for?: string | null
  transaction_uuid?: string | null
  ledger_entries?: LedgerTransactionListEntry[] | null
  entries?: LedgerTransactionListEntry[] | null
}

type LedgerFormErrorKey =
  | 'ledger_account_id'
  | 'date'
  | 'amount'
  | 'quantity'
  | 'payment_method'
  | 'reference_number'
  | 'description'

type LedgerValidationErrors = Partial<Record<LedgerFormErrorKey, string>>

export const ledgerTypeOptions = [
  {
    value: 'revenue' as const,
    label: 'Revenue',
    farmerText: 'Money came in',
    emoji: '💰',
    selectedClass: 'border-green-500 bg-green-50',
    pillClass: 'bg-green-100 text-green-800',
    textClass: 'text-green-700'
  },
  {
    value: 'expense' as const,
    label: 'Expense',
    farmerText: 'Money went out',
    emoji: '🛒',
    selectedClass: 'border-red-500 bg-red-50',
    pillClass: 'bg-red-100 text-red-800',
    textClass: 'text-red-700'
  },
  {
    value: 'asset' as const,
    label: 'Asset',
    farmerText: 'I own something',
    emoji: '🐄',
    selectedClass: 'border-blue-500 bg-blue-50',
    pillClass: 'bg-blue-100 text-blue-800',
    textClass: 'text-blue-700'
  },
  {
    value: 'liability' as const,
    label: 'Liability',
    farmerText: 'I owe someone',
    emoji: '🏦',
    selectedClass: 'border-amber-500 bg-amber-50',
    pillClass: 'bg-amber-100 text-amber-800',
    textClass: 'text-amber-700'
  },
  {
    value: 'equity' as const,
    label: 'Equity',
    farmerText: 'Farm capital / owner investment',
    emoji: '🌾',
    selectedClass: 'border-purple-500 bg-purple-50',
    pillClass: 'bg-purple-100 text-purple-800',
    textClass: 'text-purple-700'
  }
]

export const useAnimalTransactions = (animalUuid: string) => {
  const { $apiFetch } = useNuxtApp()
  const { isOnline } = useOffline()

  const ledgerAccounts = ref<AnimalLedgerAccount[]>([])
  const ledgerTransactions = ref<AnimalLedgerTransactionRow[]>([])
  const ledgerAccountSearch = ref('')
  const showLedgerAccountResults = ref(false)
  const showAddLedgerModal = ref(false)
  const ledgerSubmitting = ref(false)
  const ledgerSubmitError = ref<string | null>(null)
  const ledgerFormErrors = ref<LedgerValidationErrors>({})
  const ledgerErrorList = ref<string[]>([])

  const defaultLedgerForm = () => ({
    type: 'expense' as LedgerType,
    ledger_account_id: '',
    date: new Date().toISOString().split('T')[0] ?? '',
    amount: '',
    quantity: '',
    payment_method: '',
    notes: '',
    reference_number: '',
  })

  const ledgerForm = ref(defaultLedgerForm())

  const ledgerTypeConfig = (type: LedgerType) => {
    const config = ledgerTypeOptions.find((option) => option.value === type)
    return config ?? ledgerTypeOptions[1]!
  }

  const filteredLedgerAccounts = computed(() =>
    ledgerAccounts.value.filter((account) => account.type === ledgerForm.value.type)
  )

  const searchedLedgerAccounts = computed(() => {
    const query = ledgerAccountSearch.value.trim().toLowerCase()
    if (!query) return filteredLedgerAccounts.value
    return filteredLedgerAccounts.value.filter((account) => {
      const name = account.name.toLowerCase()
      const description = account.description?.toLowerCase() ?? ''
      return name.includes(query) || description.includes(query)
    })
  })

  const selectedLedgerAccount = computed(() =>
    ledgerAccounts.value.find((account) => String(account.id) === ledgerForm.value.ledger_account_id) ?? null
  )

  const computedUnitCost = computed(() => {
    const amount = Number(ledgerForm.value.amount)
    const quantity = Number(ledgerForm.value.quantity)
    if (!amount || !quantity) return null
    return amount / quantity
  })

  const computedUnitCostDisplay = computed(() =>
    computedUnitCost.value ? formatCurrency(computedUnitCost.value) : 'Calculated automatically'
  )

  const moneyInTotal = computed(() => ledgerTypeTotal('revenue'))
  const moneyOutTotal = computed(() => ledgerTypeTotal('expense'))
  const netProfit = computed(() => moneyInTotal.value - moneyOutTotal.value)

  const recoveryRate = computed(() => {
    if (moneyOutTotal.value <= 0) return moneyInTotal.value > 0 ? 100 : 0
    return (moneyInTotal.value / moneyOutTotal.value) * 100
  })

  const recoveryRateLabel = computed(() => `${Math.round(recoveryRate.value)}%`)
  const recoveryProgressWidth = computed(() => `${Math.min(Math.max(recoveryRate.value, 0), 100)}%`)

  const profitabilityState = computed<'no-data' | 'cost-only' | 'loss' | 'break-even' | 'profit'>(() => {
    if (moneyInTotal.value <= 0 && moneyOutTotal.value <= 0) return 'no-data'
    if (moneyInTotal.value <= 0 && moneyOutTotal.value > 0) return 'cost-only'
    if (netProfit.value < 0) return 'loss'
    if (netProfit.value === 0) return 'break-even'
    return 'profit'
  })

  const profitabilityHeadline = computed(() => {
    switch (profitabilityState.value) {
      case 'profit': return 'This animal is making money'
      case 'break-even': return 'This animal has covered its costs'
      case 'loss': return 'This animal is still below break-even'
      case 'cost-only': return 'Costs are recorded, but sales are not yet recorded'
      default: return 'Start recording sales and costs for this animal'
    }
  })

  const profitabilityMessage = computed(() => {
    switch (profitabilityState.value) {
      case 'profit': return `You have recovered all recorded costs and are ahead by ${formatCurrency(netProfit.value)}.`
      case 'break-even': return 'Money in and money out are equal, so this animal is currently neither making a profit nor a loss.'
      case 'loss': return `You need ${formatCurrency(Math.abs(netProfit.value))} more in sales to recover the recorded costs.`
      case 'cost-only': return `You have recorded ${formatCurrency(moneyOutTotal.value)} in costs, but no income yet for this animal.`
      default: return 'Once you record money in and money out, this page will show whether the animal is profitable.'
    }
  })

  const profitOrLossLabel = computed(() => {
    if (profitabilityState.value === 'profit') return `${formatCurrency(netProfit.value)} profit`
    if (profitabilityState.value === 'break-even') return 'Break-even'
    if (profitabilityState.value === 'no-data') return 'No records yet'
    return `${formatCurrency(Math.abs(netProfit.value || moneyOutTotal.value))} to recover`
  })

  const netResultDescription = computed(() => {
    if (profitabilityState.value === 'profit') return 'This is what remains after paying the recorded costs.'
    if (profitabilityState.value === 'break-even') return 'All recorded costs have been covered.'
    if (profitabilityState.value === 'no-data') return 'Add transactions to see the result here.'
    return 'This is the amount still needed to reach break-even.'
  })

  const recoveryMessage = computed(() => {
    if (profitabilityState.value === 'no-data') return 'No sales or costs recorded yet.'
    if (profitabilityState.value === 'cost-only') return 'You have started recording costs. Add income when the animal is sold or produces revenue.'
    if (profitabilityState.value === 'profit') return 'Your recorded income is above your recorded costs.'
    if (profitabilityState.value === 'break-even') return 'You have recovered 100% of the recorded costs.'
    return 'This shows how much of the recorded cost has already been recovered.'
  })

  const breakEvenMessage = computed(() => {
    if (profitabilityState.value === 'no-data') return 'Record spending and sales to track break-even for this animal.'
    if (profitabilityState.value === 'profit') return `Break-even reached. This animal is ahead by ${formatCurrency(netProfit.value)}.`
    if (profitabilityState.value === 'break-even') return 'Break-even reached. Every recorded cost has been covered.'
    return `Break-even gap: ${formatCurrency(Math.max(moneyOutTotal.value - moneyInTotal.value, 0))} still needed.`
  })

  const profitabilityBannerClass = computed(() => {
    if (profitabilityState.value === 'profit') return 'border-green-200 bg-green-50'
    if (profitabilityState.value === 'break-even') return 'border-blue-200 bg-blue-50'
    if (profitabilityState.value === 'no-data') return 'border-gray-200 bg-gray-50'
    return 'border-amber-200 bg-amber-50'
  })

  const profitabilityAccentClass = computed(() => {
    if (profitabilityState.value === 'profit') return 'text-green-700'
    if (profitabilityState.value === 'break-even') return 'text-blue-700'
    if (profitabilityState.value === 'no-data') return 'text-gray-600'
    return 'text-amber-700'
  })

  const netResultCardClass = computed(() => {
    if (profitabilityState.value === 'profit') return 'border-green-100 bg-green-50'
    if (profitabilityState.value === 'break-even') return 'border-blue-100 bg-blue-50'
    if (profitabilityState.value === 'no-data') return 'border-gray-200 bg-gray-50'
    return 'border-amber-100 bg-amber-50'
  })

  const ledgerTypeCount = (type: LedgerType) =>
    ledgerTransactions.value.filter((t) => t.type === type).length

  const ledgerTypeTotal = (type: LedgerType) =>
    ledgerTransactions.value
      .filter((t) => t.type === type)
      .reduce((sum, t) => sum + t.amount, 0)

  const formatCurrency = (value: number) =>
    new Intl.NumberFormat('en-KE', { style: 'currency', currency: 'KES', maximumFractionDigits: 0 }).format(value)

  const totalRecordedAmount = computed(() =>
    ledgerTransactions.value.reduce((sum, t) => sum + t.amount, 0)
  )

  const selectLedgerType = (type: LedgerType) => {
    ledgerForm.value.type = type
    ledgerForm.value.ledger_account_id = ''
    ledgerAccountSearch.value = ''
    showLedgerAccountResults.value = true
  }

  const handleLedgerAccountSearch = () => {
    ledgerForm.value.ledger_account_id = ''
    showLedgerAccountResults.value = true
  }

  const selectLedgerAccount = (account: AnimalLedgerAccount) => {
    ledgerForm.value.ledger_account_id = String(account.id)
    ledgerAccountSearch.value = account.name
    showLedgerAccountResults.value = false
  }

  const openLedgerModal = () => {
    ledgerSubmitError.value = null
    ledgerFormErrors.value = {}
    ledgerErrorList.value = []
    ledgerForm.value = defaultLedgerForm()
    ledgerAccountSearch.value = ''
    showLedgerAccountResults.value = false
    showAddLedgerModal.value = true
  }

  const closeLedgerModal = () => {
    showAddLedgerModal.value = false
    ledgerSubmitError.value = null
    ledgerFormErrors.value = {}
    ledgerErrorList.value = []
    showLedgerAccountResults.value = false
  }

  const setLedgerValidationErrors = (errors: Record<string, string[] | string> | undefined) => {
    const mapped: LedgerValidationErrors = {}
    const list: string[] = []
    if (!errors) { ledgerFormErrors.value = {}; ledgerErrorList.value = []; return }
    for (const [key, value] of Object.entries(errors)) {
      const message = Array.isArray(value) ? value[0] : value
      if (!message) continue
      list.push(message)
      if (key === 'entries.0.ledger_account_id' || key === 'ledger_account_id') mapped.ledger_account_id = message
      if (key === 'date') mapped.date = message
      if (key === 'entries.0.amount' || key === 'amount') mapped.amount = message
      if (key === 'entries.0.quantity' || key === 'quantity') mapped.quantity = message
      if (key === 'payment_method') mapped.payment_method = message
      if (key === 'reference_number') mapped.reference_number = message
      if (key === 'description' || key === 'notes') mapped.description = message
    }
    ledgerFormErrors.value = mapped
    ledgerErrorList.value = [...new Set(list)]
  }

  const toNumberOrNull = (value: number | string | null | undefined) => {
    if (value === null || value === undefined || value === '') return null
    const parsed = Number(value)
    return Number.isFinite(parsed) ? parsed : null
  }

  const mapTransactionToRow = (transaction: LedgerTransactionListItem): AnimalLedgerTransactionRow[] => {
    const entries = transaction.ledger_entries ?? transaction.entries ?? []
    return entries.map((entry, index) => {
      const account = entry.ledger_account ?? entry.ledgerAccount ?? null
      const amount = toNumberOrNull(entry.amount) ?? 0
      const quantity = toNumberOrNull(entry.quantity)
      const unitCost = toNumberOrNull(entry.unit_cost)
      return {
        id: `${transaction.id ?? transaction.uuid ?? 'txn'}-${index}`,
        date: transaction.date ?? '',
        type: account?.type ?? 'expense',
        account_name: account?.name ?? 'Unknown account',
        amount,
        quantity,
        unit_cost: unitCost,
        payment_method: transaction.payment_method ?? null,
        notes: transaction.description ?? null,
        reference_number: transaction.reference_number ?? null,
      }
    })
  }

  const fetchLedgerAccounts = async () => {
    try {
      if (!isOnline.value) { ledgerAccounts.value = []; return }
      await $apiFetch('/sanctum/csrf-cookie')
      const response = await $apiFetch<{ data: AnimalLedgerAccount[] }>('/api/v1/settings/system/ledgeraccounts/list')
      ledgerAccounts.value = response.data ?? []
    } catch (err) {
      console.error('Failed to fetch ledger accounts:', err)
      ledgerAccounts.value = []
    }
  }

  const fetchLedgerTransactions = async () => {
    try {
      if (!isOnline.value) { ledgerTransactions.value = []; return }
      await $apiFetch('/sanctum/csrf-cookie')
      const response = await $apiFetch<{ data?: LedgerTransactionListItem[] }>('/api/v1/farms/farm/transactions/list')
      const records = response.data ?? []
      ledgerTransactions.value = records
        .filter((t) => t.transaction_for === 'livestock' && t.transaction_uuid === animalUuid)
        .flatMap(mapTransactionToRow)
    } catch (err) {
      console.error('Failed to fetch ledger transactions:', err)
      ledgerTransactions.value = []
    }
  }

  const submitLedgerTransaction = async () => {
    if (!ledgerForm.value.ledger_account_id) {
      ledgerSubmitError.value = 'Please choose a ledger account before saving.'
      ledgerFormErrors.value = { ledger_account_id: 'Please choose a ledger account before saving.' }
      ledgerErrorList.value = ['Please choose a ledger account before saving.']
      return
    }

    ledgerSubmitting.value = true
    ledgerSubmitError.value = null
    ledgerFormErrors.value = {}
    ledgerErrorList.value = []

    const amount = Number(ledgerForm.value.amount)
    const quantity = ledgerForm.value.quantity ? Number(ledgerForm.value.quantity) : null
    const unitCost = quantity && amount ? amount / quantity : null

    const payload = {
      date: ledgerForm.value.date,
      payment_method: ledgerForm.value.payment_method || null,
      description: ledgerForm.value.notes || null,
      reference_number: ledgerForm.value.reference_number || null,
      transaction_for: 'livestock',
      type: ledgerForm.value.type,
      transaction_uuid: animalUuid,
      entries: [
        {
          ledger_account_id: Number(ledgerForm.value.ledger_account_id),
          amount,
          quantity,
          unit_cost: unitCost,
        }
      ]
    }

    try {
      await $apiFetch('/sanctum/csrf-cookie')
      await $apiFetch<{ data?: { id?: number | string } }>(
        '/api/v1/farms/farm/transactions',
        { method: 'POST', body: payload }
      )
      await fetchLedgerTransactions()
      closeLedgerModal()
    } catch (err: unknown) {
      const responseData = typeof err === 'object' && err !== null && 'data' in err
        ? (err as { data?: { message?: string; errors?: Record<string, string[] | string> } }).data
        : undefined
      setLedgerValidationErrors(responseData?.errors)
      ledgerSubmitError.value = responseData?.message ?? (err instanceof Error ? err.message : 'Failed to save transaction')
      console.error('Failed to save ledger transaction:', err)
    } finally {
      ledgerSubmitting.value = false
    }
  }

  onMounted(() => {
    fetchLedgerAccounts()
    fetchLedgerTransactions()
  })

  return {
    ledgerTypeOptions,
    ledgerTypeConfig,
    ledgerAccounts,
    ledgerTransactions,
    ledgerAccountSearch,
    showLedgerAccountResults,
    showAddLedgerModal,
    ledgerSubmitting,
    ledgerSubmitError,
    ledgerFormErrors,
    ledgerErrorList,
    ledgerForm,
    filteredLedgerAccounts,
    searchedLedgerAccounts,
    selectedLedgerAccount,
    computedUnitCostDisplay,
    totalRecordedAmount,
    moneyInTotal,
    moneyOutTotal,
    netProfit,
    recoveryRateLabel,
    recoveryProgressWidth,
    profitabilityState,
    profitabilityHeadline,
    profitabilityMessage,
    profitOrLossLabel,
    netResultDescription,
    recoveryMessage,
    breakEvenMessage,
    profitabilityBannerClass,
    profitabilityAccentClass,
    netResultCardClass,
    ledgerTypeCount,
    ledgerTypeTotal,
    formatCurrency,
    selectLedgerType,
    handleLedgerAccountSearch,
    selectLedgerAccount,
    openLedgerModal,
    closeLedgerModal,
    fetchLedgerTransactions,
    submitLedgerTransaction,
  }
}
