import Api from '../Api'
export const adminClient = new Api({
        baseURL: `${process.env.REACT_APP_BASE_URL}/admin`,
        timeout: 100000
})

export const sendMassSupportEmail = (payload) =>
        adminClient.post('/users/mass-email', payload)

export const getMassEmailRecipientCount = (payload) =>
        adminClient.post('/users/mass-email/count', payload)

export const getMassEmailPreview = (payload) =>
        adminClient.post('/users/mass-email/preview', payload)
