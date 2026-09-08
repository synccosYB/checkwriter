import Api from '../Api'

export const attachmentClient = new Api({
    baseURL: `${process.env.REACT_APP_BASE_URL}/attachments`,
    timeout: 100000
})
