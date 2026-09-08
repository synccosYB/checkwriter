import { useQuery } from "@tanstack/react-query";
import { adminClient } from "./adminClient";

export interface ChartData {
    percentChange: number | null;
    unit: string;
    value: number;
}

interface Response {
    data: ChartData[]
    total: number;
}


const useGetMonthlySingup = (range: string) => {
    const querykey = ['monthly-singups', range];
    return useQuery({
        queryKey:querykey,
        queryFn: () =>
            adminClient.get<Response>(`/totalSignups`, {range})
    })
}

export default useGetMonthlySingup;