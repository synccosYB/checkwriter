import { useMutation } from '@tanstack/react-query'
import { adminClient } from './adminClient'
import { queryClient } from '../..'
import { useDispatch } from 'react-redux'
import { updateSnackbar } from '../../redux/snackbarState'

function useRefreshSubscription() {
    const dispatch = useDispatch()
    return useMutation({
        mutationFn: (body) => adminClient.put(`/refreshSuscription`, body),
        onSuccess: () => {
            dispatch(
                            updateSnackbar({
                                open: true,
                                message: 'Subscription status updated successfully.',
                                severity: 'success'
                            })
                        )
            queryClient.invalidateQueries({ queryKey: ['subscriptions'] })
            queryClient.invalidateQueries({ queryKey: ['register users info'] })
        },
        onError: () => {
            dispatch(
                updateSnackbar({
                    open: true,
                    message: 'Failed to update subscription status.',
                    severity: 'error'
                })
            )
        }
    })
}

export default useRefreshSubscription
