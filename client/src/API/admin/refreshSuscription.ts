import { useMutation } from '@tanstack/react-query'
import { adminClient } from './adminClient'
import { queryClient } from '../..'
import { useDispatch } from 'react-redux'
import { updateSnackbar } from '../../redux/snackbarState'

type RefreshResult = {
    success?: Array<{ message?: string; hasFullAccessOverride?: boolean }>
    failed?: Array<{ error?: string }>
}

function useRefreshSubscription() {
    const dispatch = useDispatch()
    return useMutation({
        mutationFn: (body: { userId?: string; updateAll?: boolean }) => adminClient.put<RefreshResult>(`/refreshSuscription`, body),
        onSuccess: (response) => {
            const { success = [], failed = [] } = response || {}
            const hasOverride = success.some((entry) => entry.hasFullAccessOverride)
            const message = failed.length
                ? (success.length
                    ? `${success.length} subscriptions updated; ${failed.length} could not be synced.`
                    : failed[0].error || 'No subscriptions were updated.')
                : hasOverride ? 'Subscription synced. Manual Access is still enabled; disable it to follow billing.'
                : (success.length ? 'Subscription status updated successfully.' : 'No subscriptions were updated.')
            dispatch(
                            updateSnackbar({
                                open: true,
                                message,
                                severity: failed.length || !success.length || hasOverride ? 'warning' : 'success'
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
