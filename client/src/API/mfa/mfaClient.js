import Api from '../Api'

export const mfaClient = new Api({
	baseURL: `${process.env.REACT_APP_BASE_URL}/mfa`,
	timeout: 100000
})
