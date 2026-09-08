export interface TagPayload {
	name: string
	color: string
	group?: string
}

export interface UpdateTagPayload {
	body: Partial<TagPayload>
	id: string
}

export interface TagResponse extends TagPayload {
	_id: string
	ownerId: string
	ownerType: 'user' | 'organization'
	inUse: boolean
}
