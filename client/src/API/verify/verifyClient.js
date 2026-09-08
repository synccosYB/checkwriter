import Api from '../Api'

export const verifyClient = new Api(
	{
		baseURL: `${process.env.REACT_APP_BASE_URL}/verify`,
		timeout: 100000
	},
	{ isPublic: true }
)
