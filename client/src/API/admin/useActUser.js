import { useMutation } from '@tanstack/react-query'
import { adminClient } from './adminClient'
import { queryClient } from '../..'
import { useDispatch } from 'react-redux'
import { setShowAlert } from '../../redux/alertSlice'
import { MyCookies } from '../../utils/cookies/Cookies'
import { useHistory } from 'react-router-dom/cjs/react-router-dom.min'

const useActUser = () => {
	const history = useHistory()
	const dispatch = useDispatch()

	return useMutation({
		mutationFn: (userId) => adminClient.post(`/act-as-user`, { userId }),
		onSuccess: (data) => {
			MyCookies.set(MyCookies.KEYS.ACCESS_TOKEN, data.accessToken, {
				expires: 1 / 24
			})
			MyCookies.set(MyCookies.KEYS.REFRESH_TOKEN, data.refreshToken, {
				expires: 12 / 24
			})
			MyCookies.set(MyCookies.KEYS.ACT_AS_USER, true)

			dispatch(setShowAlert(``))

			queryClient.clear()
			queryClient.invalidateQueries()

			history.push('/dashboard/main')
		},
		onError: (error) => {}
	})
}

export default useActUser
