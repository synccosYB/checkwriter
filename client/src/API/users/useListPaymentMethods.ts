import { useQuery } from "@tanstack/react-query";
import { usersClient } from "./userClient";

function useListPaymentMethods() {
  return useQuery({
		queryKey: ['list payment method'],
		queryFn: () => usersClient.get<ListPaymentMethodsResponse>(`/paymentmethods`),
	})
}

export default useListPaymentMethods;

export interface ListPaymentMethodsResponse {
	hasStripeCustomer: boolean
	paymentMethods: PaymentMethod[]
}

export interface PaymentMethod {
	id: string
	brand: string
	last4: string
	exp_month: number
	exp_year: number
	isDefault: boolean
}

