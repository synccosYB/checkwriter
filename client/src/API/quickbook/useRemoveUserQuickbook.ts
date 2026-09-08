import { useMutation } from "@tanstack/react-query"
import { quickbookClient } from "./quickbookClient"
import { queryClient } from "../.."
import { useDispatch, useSelector } from "react-redux"
import { updateSnackbar } from "../../redux/snackbarState"
import { RootState } from "../../types/redux.types"

const useRemoveUserQuickbook = () => {
    const org = useSelector((state: RootState) => state.appData?.selectedOrganization);
    const ownerType = org ? 'organization' : 'user'
    const dispatch = useDispatch()
    return useMutation({
            mutationKey: ['Remove user quickbooks'],
            mutationFn: () =>
                quickbookClient.delete(`/user/${ownerType}`),
            onSuccess: () => {
                queryClient.invalidateQueries({ queryKey: ['quickbooks'] })
    
                dispatch(
                    updateSnackbar({
                        open: true,
                        message: 'Removed successfully.',
                        severity: 'success'
                    })
                )
            },
        })
}

export default useRemoveUserQuickbook;