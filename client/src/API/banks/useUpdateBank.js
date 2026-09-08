import { useMutation } from '@tanstack/react-query'
import { useDispatch, useSelector } from 'react-redux'
import { banksClient } from './banksClient'
import { queryClient } from '../..'
import { updateSnackbar } from '../../redux/snackbarState'

function useUpdateBank(countryCode) {
        const dispatch = useDispatch()

        const org = useSelector((state) => state?.appData?.selectedOrganization)

        const ownerType = org ? 'organization' : 'user'

        return useMutation({
                mutationKey: ['update bank'],
                mutationFn: ({ id, body }) =>
                        banksClient.put(`/updateBank/${ownerType}/${id}/${countryCode}`, body),
                onSuccess: () => {
                        queryClient.invalidateQueries({ queryKey: ['banks'] })

                        dispatch(
                                updateSnackbar({
                                        open: true,
                                        severity: 'success',
                                        message: 'Bank updated successfully.'
                                })
                        )
                }
        })
}

export default useUpdateBank
