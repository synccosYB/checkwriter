import { postRequest } from '.'

const postMailRate = async (body) => {
	const res = await postRequest(`/checks/bulkMail/calculateRate`, body)
	return res
}

export { postMailRate }