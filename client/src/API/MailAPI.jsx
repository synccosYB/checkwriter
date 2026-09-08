import { postRequest } from '.'

const postMailRate = async (body) => {
	const res = await postRequest('/shippo/bulkCreateNewShipment', body)
	return res
}

const postPayments = async (body) => {
	const res = await postRequest('/shippo/acceptStripePayment', body)
	return res
}

export { postMailRate, postPayments }