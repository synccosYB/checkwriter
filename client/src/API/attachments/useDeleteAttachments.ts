import { useMutation } from "@tanstack/react-query";
import { attachmentClient } from "./attachmentClient";
import { queryClient } from "../..";
import { RootState } from "../../types/redux.types";
import { useSelector } from "react-redux";
import { OwnerType } from "../../types/user.types";
import { DeleteAttachmentsPayload } from "../../types/attachment.types";

export const useDeleteAttachments = () => {
  const org = useSelector((state: RootState) => state.appData?.selectedOrganization);
  const ownerType: OwnerType = org ? 'organization' : 'user';

  return useMutation({
    mutationFn: async (data: DeleteAttachmentsPayload) => {
      return attachmentClient.delete(`/${ownerType}`, { attachmentIds: data.attachmentIds });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['attachments'] });
    },
  });
};