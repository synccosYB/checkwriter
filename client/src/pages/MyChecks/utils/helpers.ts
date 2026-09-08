import dayjs from 'dayjs'

const RECURRING_FREQUENCY_UNITS: Record<
        string,
        { unit: dayjs.ManipulateType; amount: number }
> = {
        weekly: { unit: 'week', amount: 1 },
        biweekly: { unit: 'week', amount: 2 },
        monthly: { unit: 'month', amount: 1 },
        quarterly: { unit: 'month', amount: 3 },
        yearly: { unit: 'year', amount: 1 }
}

export function computeRecurringDate(
        baseDate: string | Date,
        frequency: string,
        occurrenceIndex: number
): string {
        const config = RECURRING_FREQUENCY_UNITS[frequency]
        const base = dayjs(baseDate)
        if (!config || !base.isValid()) {
                return dayjs(baseDate).isValid()
                        ? dayjs(baseDate).format('MM/DD/YYYY')
                        : (baseDate as string)
        }
        return base.add(config.amount * occurrenceIndex, config.unit).format('MM/DD/YYYY')
}

export function generateRecurringChecks(
        baseCheck: any,
        frequency: string,
        count: number
): any[] {
        const total = Math.max(1, Math.floor(Number(count) || 1))
        const baseNumber = parseInt(baseCheck?.checkNumber, 10)
        const hasNumericCheckNumber = !Number.isNaN(baseNumber)
        const baseIsNumber = typeof baseCheck?.checkNumber === 'number'

        return Array.from({ length: total }, (_, i) => {
                let checkNumber = baseCheck?.checkNumber
                if (hasNumericCheckNumber) {
                        checkNumber = baseIsNumber ? baseNumber + i : String(baseNumber + i)
                }
                return {
                        ...baseCheck,
                        checkNumber,
                        issuedDate: computeRecurringDate(baseCheck?.issuedDate, frequency, i),
                        // Only carry attachments on the first occurrence to avoid duplicate uploads.
                        attachments: i === 0 ? baseCheck?.attachments || [] : []
                }
        })
}

export function isEmpty(value) {
        return (
                value === undefined ||
                value === null ||
                (typeof value === 'string' && value.trim() === '') ||
                (Array.isArray(value) && value.length === 0) ||
                (typeof value === 'object' &&
                        !Array.isArray(value) &&
                        Object.keys(value).length === 0)
        )
}

export function isMultiEmpty(values) {
        let flag = 0
        Object.keys(values).forEach((key) => {
                if (!isEmpty(values[key])) flag = 1
        })
        if (flag === 1) return false
        return true
}

export const addCustomOption = (options, label, isPayee) => {
        if (isPayee) {
                return [...options, { _id: 'custom_add', name: label, isCustom: true }]
        }
        return [
                ...options,
                { _id: 'custom_add', bankName: label, name: label, isCustom: true }
        ]
}

interface Segment {
        total: number
        skipped: number
        submitted: number
        valid: number
        invalid: number
}

export const getColorSegments = ({
        invalid,
        skipped,
        submitted,
        total,
        valid
}: Segment) => {
        const totalForProgress = total
        const validPercentage = (valid / totalForProgress) * 100
        const invalidPercentage = (invalid / totalForProgress) * 100
        const submittedPercentage = (submitted / totalForProgress) * 100

        const segments = {
                orangeSegment: Math.round(validPercentage),
                redSegment: Math.round(invalidPercentage),
                greenSegment: Math.round(submittedPercentage)
        }

        const totalProgressValue = Math.round(
                (valid + invalid + submitted) * (100 / totalForProgress)
        )

        return { segments, totalProgressValue }
}

export function calculateProgressPercentage(
        submittedRowCount: number,
        skippedRowCount: number,
        totalRowCount: number
): number {
        if (totalRowCount === 0) {
                return 0
        }

        const processedRowCount = submittedRowCount + skippedRowCount
        const percentage = (processedRowCount / totalRowCount) * 100

        return Math.min(100, Math.max(0, percentage))
}
