import { useQuery } from '@tanstack/react-query'
import { banksClient } from './banksClient'

export interface BankDetails {
	bankName: string | null
	routingNumber: string | null
	address1: string | null
	city: string | null
	state: string | null
	zip: string | null
	phone: string | null
	logoUrl: string | null
}

interface LookupResponse {
	bank: BankDetails | null
}

interface SearchResponse {
	banks: BankDetails[]
}

interface BankNameResponse {
	bankName: string | null
}

export function useBankLookup(routingNumber: string) {
	return useQuery({
		queryKey: ['bankLookup', routingNumber],
		queryFn: async () => {
			const res = await banksClient.get<LookupResponse>(`/lookup?rn=${routingNumber}`)
			return res?.bank ?? null
		},
		enabled: !!routingNumber && routingNumber.length === 9,
		retry: false,
	})
}

export function useSearchBanks(name: string) {
	return useQuery({
		queryKey: ['bankSearch', name],
		queryFn: async () => {
			const res = await banksClient.get<SearchResponse>(`/search?name=${encodeURIComponent(name)}`)
			return res?.banks ?? []
		},
		enabled: !!name && name.length >= 2,
		retry: false,
	})
}

export function useBankName(routingNumber: string) {
	return useQuery({
		queryKey: ['bankName', routingNumber],
		queryFn: async () => {
			const res = await banksClient.get<LookupResponse>(`/lookup?rn=${routingNumber}`)
			return { bankName: res?.bank?.bankName ?? null } as BankNameResponse
		},
		enabled: !!routingNumber && routingNumber.length === 9,
		retry: false,
	})
}
