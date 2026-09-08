import { deleteRequest, getRequest } from '.'

const stripeIntegrate = async (email) => {
        const res = await getRequest(`/payment-link/get-oauth-link?email=${email}`)
        return res
}

const getStripeAccounts = async (email) => {
        const res = await getRequest(
                `/payment-link/getUserStripeAccount?email=${email}`
        )
        return res
}

const deleteStripeAccount = async (email) => {
        const res = await deleteRequest(
                `payment-link/deleteUserAccount?email=${email}`
        )
        return res
}

const addQuickBook = async (params) => {
        const queryString = new URLSearchParams(params).toString()
        return getRequest(`/quickbooks/integrate?${queryString}`)
}

const getQuickBookAccount = async (email) => {
        const queryString = new URLSearchParams(email).toString()
        const res = await getRequest(`/quickbooks/quickbooks?${queryString}`)
        return res
}

const deleteQuickBookAccount = async (email) => {
        const queryString = new URLSearchParams(email).toString()
        const res = await deleteRequest(
                `/quickbooks/delete-quickbooks?${queryString}`
        )
        return res
}

export {
        stripeIntegrate,
        getStripeAccounts,
        deleteStripeAccount,
        addQuickBook,
        getQuickBookAccount,
        deleteQuickBookAccount
}
