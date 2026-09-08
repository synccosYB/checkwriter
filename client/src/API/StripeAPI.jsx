import { getRequest } from "."

const getSession = async(id) => {
    const res = await getRequest('/stripe/getSessionDetails/' + id)
    return res
}

export {getSession}