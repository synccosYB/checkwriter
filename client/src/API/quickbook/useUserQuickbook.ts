import { useQuery } from "@tanstack/react-query"
import { quickbookClient } from "./quickbookClient"
import { IQuickbook } from "../../types/quickbooks.types";
import { useSelector } from "react-redux";
import { RootState } from "../../types/redux.types";



const useUserQuickbook = () => {
    const org = useSelector((state: RootState) => state.appData?.selectedOrganization);
    const ownerType = org ? 'organization' : 'user'
    return useQuery({
            queryKey: ['quickbooks', ownerType],
            queryFn: async (): Promise<IQuickbook> => quickbookClient.get(`/user/${ownerType}`)
        })
}

export default useUserQuickbook;