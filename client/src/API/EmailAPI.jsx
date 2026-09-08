import { postRequest } from '.'

const sendCheckEmails = async (body) => {

	const res = await postRequest('/checks/send-check-details', body, {
		headers: {
			'Content-Type': 'multipart/form-data' // Set the content type to multipart/form-data
		}
	})
	return res
}

export { sendCheckEmails }
