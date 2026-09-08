import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../../types/redux.types';
import { OwnerType } from '../../types/user.types';
import { paymentLinkClient } from './paymentLInkClient';
import { queryClient } from '../..';
import { updateSnackbar } from '../../redux/snackbarState';


export const useResendPaymentLink = () => {
  const dispatch = useDispatch()
  const org = useSelector((state: RootState) => state.appData?.selectedOrganization);
  const ownerType: OwnerType = org ? 'organization' : 'user';

  return useMutation({
    mutationFn: async (id: string) => {
      return paymentLinkClient.post(`/resend-email/${id}/${ownerType}`);
    },
    onSuccess: () => {

      dispatch(updateSnackbar({
        open: true,
        message: 'Payment link email has been resent successfully',
        severity: 'success'
      }))
    }
  });
};
