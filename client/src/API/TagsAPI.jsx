import { deleteRequest, getRequest, postRequest, putRequest } from '.'

const addTag = async (body) => {
	const res = await postRequest('/users/user/tags', body)
	return res
}

const deleteTag = async (id) => {
	const res = await deleteRequest(`/users/user/tags/tag/${id}`)
	return res
}

const getAllTags = async () => {
	const res = await getRequest('/users/user/tags')
	return res
}

const getTagById = async (id) => {
	const res = await getRequest(`/users/user/tags/tag/${id}`)
	return res
}

const updateTag = async (id, body) => {
	const res = await putRequest(`/users/user/tags/tag/${id}`, body)
	return res
}

const getTags = async (tags) => {
	const res = await getRequest(`/users/user/getTags?${tags}`)
	return res
}

export { addTag, deleteTag, updateTag, getTagById, getAllTags, getTags }
