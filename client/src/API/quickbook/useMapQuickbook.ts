import { useMutation } from "@tanstack/react-query"
import { quickbookClient } from "./quickbookClient"
import { queryClient } from "../.."
import { useDispatch, useSelector } from "react-redux"
import { updateSnackbar } from "../../redux/snackbarState"
import { RootState } from "../../types/redux.types"

const useMapQuickbook = () => {
    const org = useSelector((state: RootState) => state.appData?.selectedOrganization);
    const ownerType = org ? 'organization' : 'user'
    const dispatch = useDispatch()
    return useMutation({
            mutationKey: ['Map quickbook profile'],
            mutationFn: (body: any) =>
                quickbookClient.put(`/user/updateMapping/${ownerType}`, body),
            onSuccess: () => {
                queryClient.invalidateQueries({ queryKey: ['quickbooks-payee-mapping'] })
                queryClient.invalidateQueries({ queryKey: ['quickbooks-bank-mapping'] })
    
                dispatch(
                    updateSnackbar({
                        open: true,
                        message: 'Mapped successfully.',
                        severity: 'success'
                    })
                )
            },
        })
}

export default useMapQuickbook;