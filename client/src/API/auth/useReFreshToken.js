import { useMutation } from '@tanstack/react-query'
import { useEffect, useRef } from 'react'
import { authClientPrivate } from './authClient'
import { MyCookies } from '../../utils/cookies/Cookies'
import { useDispatch, useSelector } from 'react-redux'
import { login, logOut } from '../../redux/loginLogout'
import { emptyAppData } from '../../redux/appData'
import { useHistory } from 'react-router-dom/cjs/react-router-dom.min'

function useReFreshToken() {
	const isLoggedIn = useSelector((state) => state.loginLogout.isLoggedIn)
	const dispatch = useDispatch()
	const history = useHistory()
	const isRunning = useRef(false)

	const mutation = useMutation({
		mutationKey: ['refresh token'],
		mutationFn: () => authClientPrivate.post('/refresh-token'),
		onSuccess: (data) => {
			MyCookies.set(MyCookies.KEYS.ACCESS_TOKEN, data.accessToken, {
				expires: 1 / 24
			})

			dispatch(login({ token: data.accessToken }))
		},
		onError: () => {
			dispatch(logOut())
			dispatch(emptyAppData())
			MyCookies.removeAll()
			window.sessionStorage.removeItem('user-memory')
			history.push('/')
		},
		onSettled: () => {
			isRunning.current = false
		}
	})

	useEffect(() => {
		const interval = setInterval(() => {
			if (!isRunning.current && mutation.status !== 'loading' && isLoggedIn) {
				isRunning.current = true
				mutation.mutate()
			}
		}, 1000 * 10 * 60)

		return () => clearInterval(interval)
	}, [isLoggedIn, mutation])

	return mutation
}

export default useReFreshToken
