import Api from '../Api'

export const tagsClient = new Api({
	baseURL: `${process.env.REACT_APP_BASE_URL}/tags`,
	timeout: 100000
})
