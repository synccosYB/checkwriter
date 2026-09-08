import { useDispatch, useSelector } from "react-redux";
import { RootState } from "../../types/redux.types";
import { useMutation } from "@tanstack/react-query";
import { checksClient } from "./checkClient";
import { queryClient } from "../..";
import { updateSnackbar } from "../../redux/snackbarState";

interface CreateBlankChecksParams {
    bankAccountId: string;
    startingCheckNumber: number;
    count: number;
    signed: boolean
}

export function useCreateBlankChecks() {
    const dispatch = useDispatch();
    const org = useSelector((state: RootState) => state?.appData?.selectedOrganization)

    const ownerType = org ? 'organization' : 'user';

    return useMutation({
        mutationKey: ['add-check-blank'],
        mutationFn: (body: CreateBlankChecksParams) => checksClient.post(`/bulk/create-blank/${ownerType}`, body),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['checks'] })

            dispatch(
                updateSnackbar({
                    open: true,
                    message: 'Check added successfully.',
                    severity: 'success'
                })
            )
        }
    })

}