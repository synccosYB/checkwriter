import { getRequest, postRequest } from '.'

const getAllTransactions = async () => {
	const res = await getRequest('/shippo/getAllTransactions')
	return res
}

const generatePaymentLink = async (body) => {
	const res = await postRequest('/payment-link/generate-payment-link', body)
	return res
}

const getAllPayments = async () => {
	const res = await getRequest('/payment-link/getUserPayments')
	return res
}

const getUserStripe = async (email) => {
	const res = await getRequest(`/payment-link/getUserStripeAccount?email=${email}`)
	return res
}

export { getAllTransactions, generatePaymentLink, getAllPayments,getUserStripe}
