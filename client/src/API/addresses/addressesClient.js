import Api from '../Api'

export const addressesClient = new Api({
	baseURL: `${process.env.REACT_APP_BASE_URL}/addresses`,
	timeout: 100000
})
