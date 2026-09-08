import Api from '../Api'

export const usersClient = new Api({
	baseURL: `${process.env.REACT_APP_BASE_URL}/users`,
	timeout: 100000
})
