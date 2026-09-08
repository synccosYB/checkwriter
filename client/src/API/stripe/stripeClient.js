import Api from '../Api'

export const striptClient = new Api({
	baseURL: `${process.env.REACT_APP_BASE_URL}/stripe`,
	timeout: 100000
})
