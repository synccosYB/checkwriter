import { useMutation } from '@tanstack/react-query'
import { sendMassSupportEmail, getMassEmailRecipientCount, getMassEmailPreview } from './adminClient'
import { useDispatch } from 'react-redux'
import { updateSnackbar } from '../../redux/snackbarState'

interface MassEmailFilter {
        role?: string
        subscriptionStatus?: string
}

interface MassEmailPayload {
        subject: string
        body: string
        filter?: MassEmailFilter
}

interface MassEmailCountPayload {
        filter?: MassEmailFilter
}

interface MassEmailPreviewPayload {
        subject: string
        body: string
}

interface MassEmailResponse {
        message: string
        recipientCount: number
}

interface MassEmailCountResponse {
        recipientCount: number
}

interface MassEmailPreviewResponse {
        html: string
}

export function useSendMassEmail() {
        const dispatch = useDispatch()

        return useMutation<MassEmailResponse, Error, MassEmailPayload>({
                mutationKey: ['send-mass-email'],
                mutationFn: (payload) => sendMassSupportEmail(payload),
                onSuccess: (data) => {
                        dispatch(
                                updateSnackbar({
                                        open: true,
                                        message: data?.message || 'Mass email initiated successfully',
                                        severity: 'success'
                                })
                        )
                },
                onError: () => {
                        dispatch(
                                updateSnackbar({
                                        open: true,
                                        message: 'Failed to send mass email',
                                        severity: 'error'
                                })
                        )
                }
        })
}

export function useMassEmailCount() {
        return useMutation<MassEmailCountResponse, Error, MassEmailCountPayload>({
                mutationKey: ['mass-email-count'],
                mutationFn: (payload) => getMassEmailRecipientCount(payload)
        })
}

export function useMassEmailPreview() {
        return useMutation<MassEmailPreviewResponse, Error, MassEmailPreviewPayload>({
                mutationKey: ['mass-email-preview'],
                mutationFn: (payload) => getMassEmailPreview(payload)
        })
}
