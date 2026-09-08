import { deleteRequest, getRequest, postRequest, putRequest } from '.'

const addGroup = async (body) => {
	const res = await postRequest('/users/user/groups', body)
	return res
}

const deleteGroup = async (id) => {
	const res = await deleteRequest(`/users/user/groups/group/${id}`)
	return res
}

const getAllGroups = async () => {
	const res = await getRequest('/users/user/groups')
	return res
}

const getGroupById = async (id) => {
	const res = await getRequest(`/users/user/groups/group/${id}`)
	return res
}

const updateGroup = async (id, body) => {
	const res = await putRequest(`/users/user/groups/group/${id}`, body)
	return res
}

const getGroups = async (groups) => {
	const res = await getRequest(`/users/user/getGroups?${groups}`)
	return res
}

export {
	addGroup,
	deleteGroup,
	updateGroup,
	getGroupById,
	getAllGroups,
	getGroups
}
