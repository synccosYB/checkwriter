import { useCallback } from 'react'
import { queryClient } from '../..'
import { useDispatch } from 'react-redux'
import { hideAlert } from '../../redux/alertSlice'
import { MyCookies } from '../../utils/cookies/Cookies'
import { logOut } from '../../redux/loginLogout'

function useStopActingAsUser() {
	const dispatch = useDispatch()

	const stopActingAsUser = useCallback(() => {
		MyCookies.removeAll()
		dispatch(logOut())
		dispatch(hideAlert())
		queryClient.clear()
		window.location.href = '/auth/login'
	}, [dispatch])

	return { mutate: stopActingAsUser, isPending: false }
}

export default useStopActingAsUser
