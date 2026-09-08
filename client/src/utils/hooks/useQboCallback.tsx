import { useEffect, useRef } from 'react'
import { useLocation, useHistory } from 'react-router-dom'
import useQuickbookCallback from '../../API/quickbook/useQuickbookCallback'
import { useDispatch } from 'react-redux'
import { updateSnackbar } from '../../redux/snackbarState'

const useQboCallback = () => {
	const dispatch = useDispatch()
	const location = useLocation()
	const history = useHistory()
	const { mutate } = useQuickbookCallback()
	useEffect(() => {
		if (location.search.includes('code=')) {
			mutate(location.search, {
				onSuccess: () => {
					dispatch(
						updateSnackbar({
							open: true,
							severity: 'success',
							message: 'Quickbooks added successfully'
						})
					)
				}
			})
		}
	}, [location, history, dispatch, mutate])
}

export default useQboCallback
