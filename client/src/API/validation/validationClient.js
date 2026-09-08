import Api from '../Api'

export const authClient = new Api({
	baseURL: `${process.env.REACT_APP_BASE_URL}/validate`,
	timeout: 100000
})
