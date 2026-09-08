import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useDispatch } from 'react-redux'
import { updateSnackbar } from '../../redux/snackbarState'
import { adminClient } from './adminClient'

export default function useFullAccessOverride() {
        const queryClient = useQueryClient()
        const dispatch = useDispatch()

        return useMutation({
                mutationFn: ({ userId, enabled, reason }) =>
                        adminClient.patch(`/users/${userId}/full-access-override`, {
                                enabled,
                                reason
                        }),
                onSuccess: (data) => {
                        queryClient.invalidateQueries({ queryKey: ['register users info'] })
                        queryClient.invalidateQueries({ queryKey: ['subscriptions'] })
                        dispatch(
                                updateSnackbar({
                                        open: true,
                                        message: data?.message || 'Manual access updated successfully.',
                                        severity: 'success'
                                })
                        )
                },
                onError: (error) => {
                        dispatch(
                                updateSnackbar({
                                        open: true,
                                        message:
                                                error?.response?.data?.message ||
                                                error?.response?.data?.error ||
                                                'Failed to update manual access.',
                                        severity: 'error'
                                })
                        )
                }
        })
}