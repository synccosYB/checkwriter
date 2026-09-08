import { useMutation } from '@tanstack/react-query'
import { striptClient } from './stripeClient'

export function useCreateSetupSession() {
    return useMutation({
        mutationKey: ['createSetupSession'],
        mutationFn: (body) => striptClient.post('/checkout/setup-session', body),
    })
}
export function useFinalizeSetupSession() {
    return useMutation({
        mutationKey: ['finalizeSetupSession'],
        mutationFn: (body) => striptClient.post('/checkout/finalize-setup', body),
    })
}
export function useSetDefaultPaymentMethod() {
    return useMutation({
        mutationKey: ['setDefaultPaymentMethod'],
        mutationFn: (body) => striptClient.post('/payment-methods/default', body),
    })
}
export function useDeletePaymentMethod() {
    return useMutation({
        mutationKey: ['deletePaymentMethod'],
        mutationFn: ({ paymentMethodId }) => striptClient.delete(`/payment-methods/${paymentMethodId}`),
    })
}
export function useVerifyTrialDollar() {
    return useMutation({
        mutationKey: ['verifyTrialDollar'],
        mutationFn: (body) => striptClient.post('/trial/verify', body),
    })
}
export function useCreateSubscriptionViaApi() {
    return useMutation({
        mutationKey: ['createSubscriptionViaApi'],
        mutationFn: (body) => striptClient.post('/subscriptions/create', body),
    })
}
