import Api from '../Api'

export const integrationsClient = new Api({
	baseURL: `${process.env.REACT_APP_BASE_URL}/payment-link`,
	timeout: 100000
})
