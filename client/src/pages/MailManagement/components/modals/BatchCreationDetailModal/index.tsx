import React from 'react'
import { CustomDialog } from '../../../../../components/dialog/CustomDialog'
import { Box, Typography, useTheme } from '@mui/material'
import { styles } from '../BatchPrintModal/styles'
import { CustomTable } from '../../../../../components/table/CustomTable'
import { CustomButton } from '../../../../../components/buttons/CustomButton'
import { getStatusColor } from '../../AllCheckMailList/helpers'
import { formatUSD } from '../../../../../utils/helper'

interface Props {
	open: boolean
	onClose: () => void
	title: string
	checks: Record<string, any>[]
	onConfirm: () => void
	status?: string
}

function BatchCreationDetailModal({
	open,
	onClose,
	title,
	checks,
	onConfirm,
	status
}: Props) {
	const theme = useTheme()
	const renderCell = (row, column) => {
		switch (column.id) {
			case 'status':
				return (
					<CustomButton
						size="small"
						sx={{
							width: '80px',
							color: getStatusColor(row.status, theme),
							backgroundColor: `${getStatusColor(row.status, theme)}0D`,
							border: `1px solid ${getStatusColor(row.status, theme)}`,
							'&:hover': {
								backgroundColor: `${getStatusColor(row.status, theme)}1A`,
								border: `1px solid ${getStatusColor(row.status, theme)}`
							}
						}}
					>
						{row.status}
					</CustomButton>
				)

			case 'no':
				return row.check.checkNumber
			case 'payeeName':
				return row.payee.name
			case 'issuedDate':
				return new Date(row.requestedAt).toDateString()
			case 'account':
				return `${row.user?.firstName} ${row.user?.lastName}`
			case 'amount':
				return formatUSD(row.check.amount)
			default:
				return row[column.id]
		}
	}

	const failed = checks.filter((i) => i.status === 'error').length
	const success = checks.filter((i) => i.status === 'success').length

	const heading = {
		success: `The batch was created successfully with ${success} check(s)`,
		failed: `All checks in this batch have failed. No batch has been created. Please review the details and try again.`,
		partial: `The batch was created with  ${success} successful checks and ${failed} failed checks. You can view your list of batch now.`
	}

	return (
		<CustomDialog
			width="1000px"
			open={open}
			onClose={onClose}
			title={title}
			content={
				<Box sx={styles.section}>
					<Typography sx={styles.description}>{heading[status]}</Typography>
					<Typography sx={styles.checksCount}>
						Number of Checks: {checks?.length}
					</Typography>

					<CustomTable
						columns={[
							{ id: 'no', label: 'Check No.', width: '60px' },

							{ id: 'payeeName', label: 'Payee Name', width: '120px' },

							{
								id: 'account',
								label: 'User Account',
								width: '120px'
							},
							{ id: 'issuedDate', label: 'Issued Date', width: '60px' },
							{ id: 'status', label: 'Status', width: '120px' }
						]}
						data={checks}
						renderCell={renderCell}
						isCenteredCells={true}
					/>
				</Box>
			}
			actions={
				<Box display={status === 'failed' ? 'none' : 'block'}>
					<CustomButton onClick={() => onConfirm()}>View Batch</CustomButton>
				</Box>
			}
		/>
	)
}

export default BatchCreationDetailModal
