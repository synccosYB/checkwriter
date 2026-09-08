export const EXCEED_TRIAL_LIMIT_WARNING = `You have reached the maximum number of checks allowed in your trial. Please upgrade to continue creating checks.`

export const RECURRING_FREQUENCIES = [
	{ value: 'weekly', label: 'Weekly' },
	{ value: 'biweekly', label: 'Bi-weekly' },
	{ value: 'monthly', label: 'Monthly' },
	{ value: 'quarterly', label: 'Quarterly' },
	{ value: 'yearly', label: 'Yearly' }
]

export const RECURRING_MIN_OCCURRENCES = 2
export const RECURRING_MAX_OCCURRENCES = 52
export const RECURRING_DEFAULT_OCCURRENCES = 12
export const RECURRING_DEFAULT_FREQUENCY = 'monthly'
