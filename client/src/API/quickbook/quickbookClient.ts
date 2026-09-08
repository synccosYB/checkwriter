import Api from '../Api'

export const QUICKBOOK_BASE_URL = `${process.env.REACT_APP_BASE_URL}/quickbooks`

export const quickbookClient = new Api({
    baseURL: QUICKBOOK_BASE_URL,
    timeout: 100000
})
