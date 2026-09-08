const stripToDigits = (phone) => {
	if (!phone) return ''
	return phone.toString().replace(/\D/g, '')
}

export const formatPhoneNumber = (phone) => {
	const digits = stripToDigits(phone)
	if (!digits) return '-'

	const last10 = digits.length >= 10 ? digits.slice(-10) : digits

	if (last10.length === 10) {
		return `+1 (${last10.slice(0, 3)}) ${last10.slice(3, 6)}-${last10.slice(6)}`
	}

	return `+${digits}`
}

export const normalizePhoneNumberForApi = (phone) => {
	const digits = stripToDigits(phone)
	if (!digits) return ''

	if (digits.length === 11 && digits.startsWith('1')) {
		return `+${digits}`
	}

	if (digits.length > 11 && digits.startsWith('1')) {
		return `+${digits.slice(0, 11)}`
	}

	if (digits.length >= 10) {
		return `+1${digits.slice(-10)}`
	}

	return `+${digits}`
}

export const getPhoneInputValue = (phone) => {
	return stripToDigits(phone)
}
