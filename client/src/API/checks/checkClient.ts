import Api from '../Api'

export const checksClient = new Api({
	baseURL: `${process.env.REACT_APP_BASE_URL}/checks`,
	timeout: 100000
})
