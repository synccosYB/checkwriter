import Api from '../Api'

export const checkImportClient = new Api({
	baseURL: `${process.env.REACT_APP_BASE_URL}/checks-import`,
	timeout: 300000
})
