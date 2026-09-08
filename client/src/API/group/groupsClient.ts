import Api from '../Api'

export const groupsClient = new Api({
	baseURL: `${process.env.REACT_APP_BASE_URL}/groups`,
	timeout: 100000
})
