import {  useMutation, useQuery } from "@tanstack/react-query";
import { attachmentClient } from "./attachmentClient";
import { RootState } from "../../types/redux.types";
import { useSelector } from "react-redux";
import { OwnerType } from "../../types/user.types";
import { DownloadResult } from "../../types/attachment.types";

export const useDownloadAttachment = () => {
  const org = useSelector((state: RootState) => state.appData?.selectedOrganization);
  const ownerType: OwnerType = org ? 'organization' : 'user';

  return useMutation({
    mutationFn: async (attachmentId: string): Promise<DownloadResult> => {
      const res = await attachmentClient.get<DownloadResult>(`/download/${ownerType}/${attachmentId}`);
      return res;
    },
  });
};