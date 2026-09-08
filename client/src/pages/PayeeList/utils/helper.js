import { formatPhoneNumber } from '../../../utils/helpers/formatPhoneNumber'

export const getColumns = (isSmallScreen) => {
	const baseColumns = [
		{
			id: 'checkbox',
			label: 'checkbox',
			width: isSmallScreen ? '50px' : '60px',
			fixWidth: true,
			textAlign: 'center'
		},
		{
			id: 'name',
			label: 'Name',
			width: isSmallScreen ? 'minmax(100px, 1fr)' : 'minmax(120px, 1.5fr)',
			textAlign: 'left'
		},
		{
			id: 'payeeAddress',
			label: 'Address',
			width: isSmallScreen ? 'minmax(150px, 1.8fr)' : 'minmax(180px, 2fr)',
			textAlign: 'left'
		},
		{
			id: 'email',
			label: 'Email Address',
			width: isSmallScreen ? 'minmax(130px, 1.5fr)' : 'minmax(160px, 1.8fr)',
			textAlign: 'left'
		},
		{
			id: 'phone',
			label: 'Number',
			width: isSmallScreen ? 'minmax(100px, 1.2fr)' : 'minmax(120px, 1.4fr)',
			textAlign: 'center'
		},
		{
			id: 'status',
			label: 'Status',
			width: isSmallScreen ? '120px' : 'minmax(110px, 1.2fr)',
			fixWidth: isSmallScreen,
			textAlign: 'center'
		},
		{
			id: 'contextMenu',
			label: 'Actions',
			width: isSmallScreen ? '70px' : '80px',
			fixWidth: true,
			textAlign: 'center'
		}
	]
	return baseColumns
}

export const makeTableData = (data) => {
	const temp = []
	data.forEach((item, index) => {
		let obj = {}

		obj = { ...item }

		obj._originalEmail = item?.email
		obj._originalPhone = item?.phone

		obj.payeeAddress = `${item?.address?.addressLine1 || ''}, ${
			item?.address?.addressLine2 || ''
		}`

		let timestamp = item._id.toString().substring(0, 8)
		let date = new Date(parseInt(timestamp, 16) * 1000)

		obj.createdDate = `${
			date.getMonth() + 1
		}/${date.getDate()}/${date.getFullYear()}`

		obj.email = item?.email || '-'
		obj.phone = formatPhoneNumber(item?.phone)

		temp.push(obj)
	})

	return temp
}
