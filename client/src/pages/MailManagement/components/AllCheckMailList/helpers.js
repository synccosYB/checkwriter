export const getStatusColor = (status, theme) => {
	switch (status) {
		case 'Processing':
			return '#EF6C00'
		case 'Submitted':
		case 'success':
			return '#058205'
		case 'Mailed':
			return '#1e3a5f'
		case 'Canceled':
		case 'error':
		case 'Error':
			return '#F03D3E'
		default:
			return theme.palette.text.primary
	}
}

export const shouldDisable = (source) =>
	source.length === 0 || source.every((c) => c.status !== 'Submitted')

const baseColumns = [
	{ id: 'selected', label: '', width: '40px' },
	{ id: 'no', label: 'Check No.', width: '180px' },
	{ id: 'payeeName', label: 'Payee Name', width: '220px' },
	{ id: 'account', label: 'User Account', width: '140px' },
	{ id: 'org', label: 'Organization', width: '200px' },
	{ id: 'issuedDate', label: 'Issued Date', width: '140px' },
	{ id: 'status', label: 'Status', width: '120px' },
	{ id: 'batchNumber', label: 'Batch Number', width: '140px' }
]

export const getColumns = (search) => {
	let columns = [...baseColumns]

	switch (search) {
		case 'Submitted':
		case 'Canceled':
		case 'Error':
			columns = columns.filter((i) => i.id !== 'batchNumber')
			break
		case 'Mailed':
			columns.push({ id: 'mailedDate', label: 'Mailed Date', width: '140px' })
			break
		default:
			break
	}

	return columns
}

export const getMappedBatch = (batch) => {
	const obj = {
		_id: batch._id,
		createdBy: `${batch?.createdBy?.firstName} ${batch?.createdBy?.lastName}`,
		createdDate: new Date(batch.createdAt).toDateString(),
		totalSuccessful: batch.mailed_checks.length,
		no: batch.batchNumber
	}
	return obj
}
