import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../../types/redux.types';
import { OwnerType } from '../../types/user.types';
import { paymentLinkClient } from './paymentLInkClient';
import { updateSnackbar } from '../../redux/snackbarState';
import { useMutation } from '@tanstack/react-query';

interface Response {
    url: string;
}

export const useDownloadReceipt = () => {
    const dispatch = useDispatch();
    const org = useSelector((state: RootState) => state.appData?.selectedOrganization);
    const ownerType: OwnerType = org ? 'organization' : 'user';

    return useMutation({
        mutationFn: async (id: string) => {
            return paymentLinkClient.post<Response>(`/download-receipt/${id}/${ownerType}`);
        },
        onSuccess: () => {
            dispatch(
                updateSnackbar({
                open: true,
                message: 'Receipt generated successfully.',
                severity: 'success'
            })
            )
        }
    });
};
