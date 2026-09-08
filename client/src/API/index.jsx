import axios from 'axios'
import { handleAPIError } from '../utils/errorHandler'
import { MyCookies } from '../utils/cookies/Cookies'

let token

let instance = axios.create({
	baseURL: process.env.REACT_APP_BASE_URL,
	timeout: 100000,
	headers: {
		Authorization: token
	}
})

instance.interceptors.request.use(async (config) => {
	let token = ''

	if (config.url.includes('refresh-token')) {
		token = MyCookies.get(MyCookies.KEYS.REFRESH_TOKEN)
	} else {
		token = MyCookies.get(MyCookies.KEYS.ACCESS_TOKEN)
	}

	config.headers.Authorization = token

	if (MyCookies.get(MyCookies.KEYS.ORGANIZATION)) {
		config.headers.organizationId = MyCookies.get(MyCookies.KEYS.ORGANIZATION)
	}

	return config
})

// Add response interceptor for error handling
instance.interceptors.response.use(
	(response) => response,
	(error) => {
		handleAPIError(error)
		return Promise.reject(error)
	}
)

const getRequest = (API, body) => instance.get(API, body)

const postRequest = (API, body) => instance.post(API, body)

const putRequest = (API, body) => instance.put(API, body)

const deleteRequest = (API, body) => instance.delete(API, body)

export { getRequest, postRequest, instance, putRequest, deleteRequest }
