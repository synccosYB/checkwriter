import Api from '../Api'

export const authClient = new Api(
	{
		baseURL: `${process.env.REACT_APP_BASE_URL}/auth`,
		timeout: 100000
	},
	{ isPublic: true }
)

export const authClientPrivate = new Api({
	baseURL: `${process.env.REACT_APP_BASE_URL}/auth`,
	timeout: 100000
})
