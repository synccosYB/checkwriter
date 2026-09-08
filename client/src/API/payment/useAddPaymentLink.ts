import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../../types/redux.types';
import { OwnerType } from '../../types/user.types';
import { paymentLinkClient } from './paymentLInkClient';
import { queryClient } from '../..';
import { updateSnackbar } from '../../redux/snackbarState';

interface Result {
  _id: string;
}

interface Response {
  payment_link: string;
  sessionId: string;
  result: Result
}

export const useAddPaymentLink = () => {
  const dispatch = useDispatch();
  const org = useSelector((state: RootState) => state.appData?.selectedOrganization);
  const ownerType: OwnerType = org ? 'organization' : 'user';

  return useMutation({
    mutationFn: async (data: any) => {
      return paymentLinkClient.post<Response>(`generate-payment-link/${ownerType}`, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['payment-link'] })
      dispatch(
        updateSnackbar({
                open: true,
                message: 'Payment added successfully.',
                severity: 'success'
              })
      )
    }
  });
};
