import { useMutation } from '@tanstack/react-query'
import { shippingClient } from './shippingClient'
import { useDispatch } from 'react-redux'
import { queryClient } from '../..'
import { updateSnackbar } from '../../redux/snackbarState'

function useCreateCarrierLabel() {
        const dispatch = useDispatch()

        return useMutation({
                mutationKey: ['create carrier label'],
                mutationFn: (body) => shippingClient.post('/carrier-shipment/createLabel', body),
                onSuccess: () => {
                        queryClient.invalidateQueries({ queryKey: ['checks'] })
                        dispatch(
                                updateSnackbar({
                                        open: true,
                                        message: 'Carrier label created and shipment scheduled.',
                                        severity: 'success'
                                })
                        )
                }
        })
}

export default useCreateCarrierLabel
