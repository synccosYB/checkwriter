import axios from 'axios'
import { handleAPIError } from '../utils/errorHandler'
import { MyCookies } from '../utils/cookies/Cookies'
import jwtDecode from 'jwt-decode'

const TOKEN_EXPIRY_THRESHOLD_SECONDS = 60
const BASE_URL = process.env.REACT_APP_BASE_URL

class Api {
        static isRefreshing = false
        static refreshSubscribers = []
        #isPublicInstance = false

        constructor(config = {}, { isPublic = false } = {}) {
                this.axiosInstance = axios.create(config)
                this.#isPublicInstance = isPublic
                this.axiosInstance.interceptors.request.use(
                        async (config) => {
                                // Skip token check for public route prefixes
                                if (this.#isPublicInstance) {
                                        return config
                                }

                                let tokenKey = ''

                                if (config.url.includes('refresh-token')) {
                                        tokenKey = MyCookies.KEYS.REFRESH_TOKEN
                                } else {
                                        tokenKey = MyCookies.KEYS.ACCESS_TOKEN
                                }

                                let token = MyCookies.get(tokenKey)

                                if (tokenKey === MyCookies.KEYS.ACCESS_TOKEN) {
                                        const expiryTime = this.#getTokenExpiry(tokenKey)
                                        const currentTimeInSeconds = Math.floor(Date.now() / 1000)

                                        if (
                                                expiryTime &&
                                                expiryTime - currentTimeInSeconds <
                                                        TOKEN_EXPIRY_THRESHOLD_SECONDS &&
                                                expiryTime > currentTimeInSeconds
                                        ) {
                                                // Token is about to expire, attempt to refresh
                                                const refreshedToken = await this.#handleAccessTokenRefresh()
                                                if (refreshedToken) {
                                                        token = refreshedToken
                                                } else {
                                                        return Promise.reject({
                                                                message: 'Failed to refresh token before request'
                                                        })
                                                }
                                        } else if (!token) {
                                                MyCookies.removeAll()
                                                console.warn('Access token not found.')
                                                return Promise.reject({ message: 'Authentication required' })
                                        }
                                } else if (tokenKey === MyCookies.KEYS.REFRESH_TOKEN && !token) {
                                        console.warn('Refresh token not found.')
                                }

                                config.headers.Authorization = token

                                if (MyCookies.get(MyCookies.KEYS.ORGANIZATION)) {
                                        config.headers.organizationId = MyCookies.get(
                                                MyCookies.KEYS.ORGANIZATION
                                        )
                                }

                                return config
                        },
                        (error) => Promise.reject(error)
                )

                this.axiosInstance.interceptors.response.use(
                        (response) => response,
                        async (error) => {
                                const originalRequest = error.config

                                if (
                                        error.response &&
                                        error.response.status === 401 &&
                                        !originalRequest._retry &&
                                        !originalRequest.url.includes('refresh-token')
                                ) {
                                        originalRequest._retry = true
                                        const newToken = await this.#handleAccessTokenRefresh(true) // Indicate it's a retry after 401
                                        if (newToken) {
                                                originalRequest.headers.Authorization = newToken
                                                return this.axiosInstance(originalRequest)
                                        }
                                }

                                handleAPIError(error)
                                return Promise.reject(error)
                        }
                )
        }

        get(url, queryParams = undefined, config = {}) {
                return this.#request('get', url, undefined, queryParams, config)
        }

        post(url, data = undefined, queryParams = undefined, config = {}) {
                return this.#request('post', url, data, queryParams, config)
        }

        put(url, data = undefined, queryParams = undefined, config = {}) {
                return this.#request('put', url, data, queryParams, config)
        }

        patch(url, data = undefined, queryParams = undefined, config = {}) {
                return this.#request('patch', url, data, queryParams, config)
        }

        delete(url, data = undefined, queryParams = undefined, config = {}) {
                return this.#request('delete', url, data, queryParams, config)
        }

        #getTokenExpiry(tokenKey) {
                const token = MyCookies.get(tokenKey)
                if (!token || typeof token !== 'string' || token.split('.').length !== 3) {
                        return null
                }
                try {
                        const decodedToken = jwtDecode(token)
                        return decodedToken.exp
                } catch (error) {
                        return null
                }
        }

        async #handleAccessTokenRefresh(isRetry = false) {
                const refreshToken = MyCookies.get(MyCookies.KEYS.REFRESH_TOKEN)
                if (!refreshToken) {
                        console.warn('No refresh token available.')
                        this.#handleRefreshFailure()
                        return null
                }

                if (Api.isRefreshing) {
                        return new Promise((resolve) => {
                                Api.refreshSubscribers.push((newToken) => {
                                        resolve(newToken)
                                })
                        })
                }

                Api.isRefreshing = true

                try {
                        const response = await axios.post(
                                `${BASE_URL}/auth/refresh-token`,
                                null,
                                {
                                        headers: { Authorization: refreshToken },
                                        withCredentials: true
                                }
                        )

                        const newAccessToken = response.data.accessToken
                        MyCookies.set(MyCookies.KEYS.ACCESS_TOKEN, newAccessToken)

                        Api.isRefreshing = false
                        this.#onRefreshTokenSuccess(newAccessToken)
                        return newAccessToken
                } catch (error) {
                        Api.isRefreshing = false
                        this.#onRefreshTokenFailure(error, isRetry)
                        return null
                }
        }

        #onRefreshTokenSuccess(newToken) {
                Api.refreshSubscribers.forEach((callback) => callback(newToken))
                Api.refreshSubscribers = []
        }

        #onRefreshTokenFailure(error, isRetry) {
                Api.refreshSubscribers.forEach((callback) => callback(null))
                Api.refreshSubscribers = []
                console.error('Token refresh failed:', error)
                MyCookies.remove(MyCookies.KEYS.ACCESS_TOKEN)
                MyCookies.remove(MyCookies.KEYS.REFRESH_TOKEN)
                if (!isRetry) {
                        window.location.href = '/auth/login'
                }
        }

        #handleRefreshFailure() {
                console.error('Token refresh failed.')
                MyCookies.remove(MyCookies.KEYS.ACCESS_TOKEN)
                MyCookies.remove(MyCookies.KEYS.REFRESH_TOKEN)

                // window.location.href = '/auth/login';
        }

        async #request(method, url, data = undefined, queryParams, config = {}) {
                if (queryParams) {
                        const queryString = new URLSearchParams(queryParams).toString()
                        url += `?${queryString}`
                }

                const response = await this.axiosInstance.request({
                        method,
                        url,
                        data,
                        ...config
                })
                return response.data
        }

        updateHeaders(config = {}) {
                if (Object.keys(config).length) {
                        this.axiosInstance.defaults.headers = {
                                ...this.axiosInstance.defaults.headers,
                                ...config
                        }
                }
        }
}

export default Api
