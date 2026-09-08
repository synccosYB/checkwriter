import { getRequest } from '.'

const subscriptionAPI = async (id) => {
	const res = await getRequest(
		id ? `/managesubscription?isTrialPeriod=${id}` : '/managesubscription',
		{}
	)
	return res
}

export { subscriptionAPI }
