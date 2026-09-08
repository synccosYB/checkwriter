import Api from '../Api'

export const transactionsClient = new Api({
	baseURL: `${process.env.REACT_APP_BASE_URL}/checkregister_transactions`,
	timeout: 100000
})
