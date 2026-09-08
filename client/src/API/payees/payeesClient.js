import Api from '../Api'

export const payeesClient = new Api({
	baseURL: `${process.env.REACT_APP_BASE_URL}/payees`,
	timeout: 100000
})
