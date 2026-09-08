import { useSelector } from "react-redux";
import { RootState } from "../../types/redux.types";
import { quickbookClient } from "./quickbookClient";
import { useQuery } from "@tanstack/react-query";
import { BankAccount, QuickbooksMapping } from "../../types/quickbooks.types";
import { isNotNullOrUndefined } from "../../utils/helper";

interface Response {
    data: BankAccount[],
    meta: {
        total: number,
        page: number,
        limit: number,
        totalPages: number
    }
}

const useGetQuickbookBank = (filters: any = {}) => {
    const org = useSelector((state: RootState) => state.appData?.selectedOrganization);
    const ownerType = org ? 'organization' : 'user'

    const queryKey = ['quickbooks-bank-mapping', ownerType]
    const queryParams: any = {}
    
        for (const key in filters) {
            if (filters.hasOwnProperty(key) && isNotNullOrUndefined(filters[key])) {
                queryParams[key] = filters[key]
                queryKey.push(filters[key])
            }
        }
    
        if (isNotNullOrUndefined(filters.page) && filters.pageSize) {
            queryParams.page = filters.page + 1
            queryKey.push(filters.page + 1, filters.pageSize)
        }

    return useQuery({
            queryKey: queryKey,
            queryFn: async (): Promise<Response> => quickbookClient.get(`/user/getQuickbooksBanks/${ownerType}`, queryParams)
        })
}

export default useGetQuickbookBank;