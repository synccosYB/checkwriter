import Api from '../Api'

export const banksClient = new Api({
	baseURL: `${process.env.REACT_APP_BASE_URL}/banks`,
	timeout: 100000
})
