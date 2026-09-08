import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../../types/redux.types';
import { OwnerType } from '../../types/user.types';
import { paymentLinkClient } from './paymentLInkClient';
import { queryClient } from '../..';
import { updateSnackbar } from '../../redux/snackbarState';

interface Response {
  message: string;
  sessionStatus: string
}

export const useCancelPayment = () => {
  const dispatch = useDispatch();
  const org = useSelector((state: RootState) => state.appData?.selectedOrganization);
  const ownerType: OwnerType = org ? 'organization' : 'user';

  return useMutation({
    mutationFn: async (id: string) => {
      return paymentLinkClient.post<Response>(`${id}/${ownerType}/cancel`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['payment-link'] })
      dispatch(
        updateSnackbar({
                      open: true,
                      message: 'Status changed successfully.',
                      severity: 'success'
                    })
      )
    }
  });
};
