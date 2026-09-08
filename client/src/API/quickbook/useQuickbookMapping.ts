import { useSelector } from "react-redux";
import { RootState } from "../../types/redux.types";
import { quickbookClient } from "./quickbookClient";
import { useQuery } from "@tanstack/react-query";
import { QuickbooksMapping } from "../../types/quickbooks.types";

const useQuickbookMapping = () => {
    const org = useSelector((state: RootState) => state.appData?.selectedOrganization);
    const ownerType = org ? 'organization' : 'user'
    return useQuery({
            queryKey: ['quickbooks-mapping', ownerType],
            queryFn: async (): Promise<QuickbooksMapping> => quickbookClient.get(`/user/getQuickbooksProfiles/${ownerType}`)
        })
}

export default useQuickbookMapping;