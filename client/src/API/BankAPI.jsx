import { getRequest } from '.'

const validateBankNickName = async (nickName) => {
	const res = await getRequest(
		`/users/user/bank-details/validate-bank-account-nickname/${nickName}`
	)
	return res
}

const getBankDetails = async (routingNumber) => {
	const res = getRequest(`/autofill/getBankAddress/${routingNumber}`)
	return res
}

export { validateBankNickName, getBankDetails }
