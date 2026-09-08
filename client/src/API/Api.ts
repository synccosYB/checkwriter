import axios, {
        AxiosInstance,
        AxiosRequestConfig,
        AxiosResponse,
        CreateAxiosDefaults,
        AxiosError
} from 'axios'
import { handleAPIError } from '../utils/errorHandler'
import { MyCookies } from '../utils/cookies/Cookies'
import jwtDecode, { JwtPayload } from 'jwt-decode'

type Method = 'get' | 'post' | 'put' | 'patch' | 'delete'

type QueryParams =
        | string
        | Record<string, any>
        | string[][]
        | URLSearchParams
        | undefined

interface RefreshSubscriber {
        (newToken: string | null): void
}

const TOKEN_EXPIRY_THRESHOLD_SECONDS = 60
const BASE_URL = process.env.REACT_APP_BASE_URL

export default class Api {
        private axiosInstance: AxiosInstance
        private static isRefreshing = false
        private static refreshSubscribers: RefreshSubscriber[] = []
        private isPublicInstance = false

        constructor(
                config: CreateAxiosDefaults<any> | undefined,
                { isPublic = false }: { isPublic?: boolean } = {}
        ) {
                this.axiosInstance = axios.create({ withCredentials: true, ...config })
                this.isPublicInstance = isPublic
                this.axiosInstance.interceptors.request.use(
                        async (config) => {
                                // Skip token check for public route prefixes
                                if (this.isPublicInstance) {
                                        return config
                                }

                                let tokenKey = ''

                                if (config.url?.includes('refresh-token')) {
                                        tokenKey = MyCookies.KEYS.REFRESH_TOKEN
                                } else {
                                        tokenKey = MyCookies.KEYS.ACCESS_TOKEN
                                }

                                let token = MyCookies.get(tokenKey)

                                if (tokenKey === MyCookies.KEYS.ACCESS_TOKEN) {
                                        const expiryTime = this.getTokenExpiry(tokenKey)
                                        const currentTimeInSeconds = Math.floor(Date.now() / 1000)

                                        if (
                                                expiryTime &&
                                                expiryTime - currentTimeInSeconds <
                                                        TOKEN_EXPIRY_THRESHOLD_SECONDS &&
                                                expiryTime > currentTimeInSeconds
                                        ) {
                                                // Token is about to expire, attempt to refresh
                                                const refreshedToken = await this.handleAccessTokenRefresh()
                                                if (refreshedToken) {
                                                        token = refreshedToken
                                                } else {
                                                        return Promise.reject({
                                                                message: 'Failed to refresh token before request'
                                                        } as AxiosError)
                                                }
                                        } else if (!token) {
                                                MyCookies.removeAll()
                                                console.warn('Access token not found.')
                                                return Promise.reject({
                                                        message: 'Authentication required'
                                                } as AxiosError)
                                        }
                                } else if (tokenKey === MyCookies.KEYS.REFRESH_TOKEN && !token) {
                                        console.warn('Refresh token not found.')
                                }

                                if (token) {
                                        config.headers.Authorization = token
                                }

                                const organizationId = MyCookies.get(MyCookies.KEYS.ORGANIZATION)
                                if (organizationId) {
                                        config.headers.organizationId = organizationId
                                }

                                return config
                        },
                        (error: AxiosError) => Promise.reject(error)
                )

                this.axiosInstance.interceptors.response.use(
                        (response: AxiosResponse) => response,
                        async (error: AxiosError) => {
                                const originalRequest = error.config as AxiosRequestConfig & {
                                        _retry?: boolean
                                }

                                if (
                                        error.response?.status === 401 &&
                                        !originalRequest?._retry &&
                                        !originalRequest?.url?.includes('refresh-token')
                                ) {
                                        originalRequest._retry = true
                                        const newToken = await this.handleAccessTokenRefresh(true) // Indicate it's a retry after 401
                                        if (newToken) {
                                                if (originalRequest.headers) {
                                                        originalRequest.headers.Authorization = newToken
                                                }
                                                return this.axiosInstance(originalRequest)
                                        }
                                }

                                if (error.response?.status === 403) {
                                        const responseData = error.response?.data as any
                                        if (responseData?.isDemo === true) {
                                                window.dispatchEvent(new CustomEvent('demoRestriction'))
                                                return Promise.reject(error)
                                        }
                                }

                                handleAPIError(error)
                                return Promise.reject(error)
                        }
                )
        }

        private getTokenExpiry(tokenKey: string): number | null {
                const token = MyCookies.get(tokenKey)
                if (!token || typeof token !== 'string' || token.split('.').length !== 3) {
                        return null
                }
                try {
                        const decodedToken = jwtDecode<JwtPayload & { exp?: number }>(token)
                        return decodedToken.exp || null
                } catch (error) {
                        return null
                }
        }

        private async handleAccessTokenRefresh(
                isRetry = false
        ): Promise<string | null> {
                const refreshToken = MyCookies.get(MyCookies.KEYS.REFRESH_TOKEN)
                if (!refreshToken) {
                        console.warn('No refresh token available.')
                        this.handleRefreshFailure()
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
                        const response = await axios.post<{ accessToken: string }>(
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
                        this.onRefreshTokenSuccess(newAccessToken)
                        return newAccessToken
                } catch (error: any) {
                        Api.isRefreshing = false
                        this.onRefreshTokenFailure(error, isRetry)
                        return null
                }
        }

        private onRefreshTokenSuccess(newToken: string) {
                Api.refreshSubscribers.forEach((callback) => callback(newToken))
                Api.refreshSubscribers = []
        }

        private onRefreshTokenFailure(error: any, isRetry: boolean) {
                Api.refreshSubscribers.forEach((callback) => callback(null))
                Api.refreshSubscribers = []
                console.error('Token refresh failed:', error)
                MyCookies.remove(MyCookies.KEYS.ACCESS_TOKEN)
                MyCookies.remove(MyCookies.KEYS.REFRESH_TOKEN)
                if (!isRetry) {
                        window.location.href = '/auth/login'
                }
        }

        private handleRefreshFailure() {
                console.error('Token refresh failed.')
                MyCookies.remove(MyCookies.KEYS.ACCESS_TOKEN)
                MyCookies.remove(MyCookies.KEYS.REFRESH_TOKEN)
                // window.location.href = '/auth/login';
        }

        private async request<TResponse, TData = unknown>(
                method: Method,
                url: string,
                data?: TData,
                queryParams?: QueryParams,
                config?: AxiosRequestConfig
        ): Promise<TResponse> {
                let requestUrl = url
                if (queryParams) {
                        const queryString = new URLSearchParams(queryParams).toString()
                        requestUrl += `?${queryString}`
                }

                const response: AxiosResponse<TResponse> = await this.axiosInstance.request(
                        {
                                method,
                                url: requestUrl,
                                data,
                                ...config
                        }
                )
                return response.data
        }

        updateHeaders(config?: Record<string, string>): void {
                if (config) {
                        this.axiosInstance.defaults.headers = {
                                ...this.axiosInstance.defaults.headers,
                                ...config
                        }
                }
        }

        get<TResponse, TData = unknown>(
                url: string,
                queryParams?: QueryParams,
                config?: AxiosRequestConfig
        ): Promise<TResponse> {
                return this.request<TResponse, TData>(
                        'get',
                        url,
                        undefined,
                        queryParams,
                        config
                )
        }

        post<TResponse, TData = unknown>(
                url: string,
                data?: TData,
                queryParams?: QueryParams,
                config?: AxiosRequestConfig
        ): Promise<TResponse> {
                return this.request<TResponse, TData>(
                        'post',
                        url,
                        data,
                        queryParams,
                        config
                )
        }

        put<TResponse, TData = unknown>(
                url: string,
                data?: TData,
                queryParams?: QueryParams,
                config?: AxiosRequestConfig
        ): Promise<TResponse> {
                return this.request<TResponse, TData>('put', url, data, queryParams, config)
        }

        patch<TResponse, TData = unknown>(
                url: string,
                data?: TData,
                queryParams?: QueryParams,
                config?: AxiosRequestConfig
        ): Promise<TResponse> {
                return this.request<TResponse, TData>(
                        'patch',
                        url,
                        data,
                        queryParams,
                        config
                )
        }

        delete<TResponse, TData = unknown>(
                url: string,
                data?: TData,
                queryParams?: QueryParams,
                config?: AxiosRequestConfig
        ): Promise<TResponse> {
                return this.request<TResponse, TData>(
                        'delete',
                        url,
                        data,
                        queryParams,
                        config
                )
        }
}
