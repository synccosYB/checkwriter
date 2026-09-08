export interface GroupPayload {
	name: string
	color: string
}

export interface UpdateGroupPayload {
	body: GroupPayload
	id: string
}

export interface GroupResponse extends GroupPayload {
	_id: string
	ownerId: string
	ownerType: 'user' | 'organization'
}
