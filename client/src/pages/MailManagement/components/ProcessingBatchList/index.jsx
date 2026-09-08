import { useEffect, useState } from 'react'
import { CustomTable } from '../../../../components/table/CustomTable'
import {
	Box,
	CircularProgress,
	Pagination,
	PaginationItem,
	Typography
} from '@mui/material'
import { CustomButton } from '../../../../components/buttons/CustomButton'
import { styles } from './styles.js'

import { FilterIcon } from '../../../../components/Icons'
import { BatchDetailDialog } from '../modals/BatchDetailModal/index.jsx'
import useMailBatches from '../../../../API/admin/useMailBatches.js'
import usePagination from '../../../../utils/hooks/usePagination.js'
import useBatchDetails from '../../../../API/admin/useBatchDetails.js'

const getMappedBatch = (batch) => {
	const obj = {
		_id: batch._id,
		createdBy: `${batch?.user?.firstName} ${batch?.user?.lastName}`,
		createdDate: new Date(batch.createdAt).toDateString(),
		total: batch.totalChecks,
		no: batch.batchNumber
	}
	return obj
}

export const ProcessingBatchList = () => {
	const { page, setPage, pageSize } = usePagination()
	const { data, isLoading } = useMailBatches({ page, pageSize })

	const batches = data?.data || []

	const [openDialog, setOpenDialog] = useState(false)
	const [selectedBatch, setSelectedBatch] = useState(null)
	const { data: batchData, isLoading: isLoadingBatchDetails } = useBatchDetails(
		selectedBatch?._id
	)

	useEffect(() => {
		if (batchData) {
			setOpenDialog(true)
		}
	}, [batchData])

	const handleCloseDialog = () => {
		setOpenDialog(false)
		setSelectedBatch(null)
	}

	const handleBatchClick = (batch) => {
		setSelectedBatch(getMappedBatch(batch))
	}

	const renderCell = (row, column) => {
		switch (column.id) {
			case 'status':
				return (
					<CustomButton
						size="small"
						sx={{
							width: '200px',
							color: getStatusColor(row.status),
							backgroundColor: `${getStatusColor(row.status)}0D`,
							border: `1px solid ${getStatusColor(row.status)}`,
							'&:hover': {
								backgroundColor: `${getStatusColor(row.status)}1A`,
								border: `1px solid ${getStatusColor(row.status)}`
							}
						}}
					>
						{row.status}
					</CustomButton>
				)
			case 'no':
				return (
					<Typography
						sx={{
							color: getStatusColor(column.id),
							fontSize: '12px',
							cursor: 'pointer'
						}}
					>
						{row.batchNumber} &nbsp;
						{isLoadingBatchDetails && selectedBatch._id === row._id && (
							<CircularProgress size={'14px'} />
						)}
					</Typography>
				)
			case 'total':
				return (
					<Typography
						sx={{ color: getStatusColor(column.id), fontSize: '12px' }}
					>
						{row.totalChecks}
					</Typography>
				)
			case 'createdDate':
				return (
					<Typography
						sx={{ color: getStatusColor(column.id), fontSize: '12px' }}
					>
						{new Date(row.createdAt).toDateString()}
					</Typography>
				)
			case 'createdBy':
				return (
					<Typography
						sx={{ color: getStatusColor(column.id), fontSize: '12px' }}
					>{`${row?.user?.firstName} ${row?.user?.lastName}`}</Typography>
				)

			case 'processing':
				return (
					<Typography
						sx={{ color: getStatusColor(column.id), fontSize: '12px' }}
					>
						{row.processingCount}
					</Typography>
				)

			case 'mailed':
				return (
					<Typography
						sx={{ color: getStatusColor(column.id), fontSize: '12px' }}
					>
						{row.mailedCount}
					</Typography>
				)
			case 'account':
				return `${row.user?.firstName} ${row.user?.lastName}`
			case 'org':
				return row.organization.organizationName
			default:
				return (
					<Typography
						sx={{ color: getStatusColor(column.id), fontSize: '12px' }}
					>
						{row[column.id]}
					</Typography>
				)
		}
	}

	const renderHeaderCell = (column) => {
		return (
			<Typography
				sx={{
					color: getStatusColor(column.id),
					fontSize: '12px',
					fontWeight: '600'
				}}
			>
				{column.label}
			</Typography>
		)
	}

	const getStatusColor = (status) => {
		switch (status) {
			case 'processing':
			case 'Processing':
				return '#EF6C00'
			case 'total':
				return '#058205'
			case 'mailed':
			case 'Mailed':
				return '#1e3a5f'
			default:
				return '#000000DE'
		}
	}

	return (
		<>
			<Box sx={styles.actionContainer}>
				<Box sx={styles.actionButtons}>
					<CustomButton
						variant="outlined"
						endIcon={<FilterIcon />}
						// onClick={handleFilterClick}
						color="primary"
						sx={styles.filterContainer}
					>
						<Box sx={{ display: { xs: 'none', sm: 'block' } }}>Filters</Box>
					</CustomButton>
				</Box>
			</Box>{' '}
			<CustomTable
				columns={[
					{ id: 'no', label: 'Batch No.', width: '180px' },
					{ id: 'createdBy', label: 'Created By', width: '220px' },
					{ id: 'createdDate', label: 'Created Date', width: '140px' },
					{ id: 'total', label: 'Total Checks', width: '200px' },
					{ id: 'processing', label: 'Processing', width: '140px' },
					{ id: 'mailed', label: 'Mailed', width: '120px' },
					{
						id: 'status',
						label: 'Status',
						width: '120px'
					}
				]}
				data={batches}
				renderCell={renderCell}
				renderHeaderCell={renderHeaderCell}
				isCenteredCells={true}
				onClickRow={handleBatchClick}
			/>
			<Box
				sx={{
					...styles.paginationContainer,
					pointerEvents: isLoading ? 'none' : 'all'
				}}
			>
				<Pagination
					count={Math.ceil((data?.totalCount || 1) / pageSize)}
					page={page + 1}
					rowsPerPage={pageSize}
					onChange={(event, value) => setPage(value - 1)}
					renderItem={(item) => (
						<PaginationItem
							slots={{
								previous: () => 'Previous',
								next: () => 'Next'
							}}
							{...item}
							sx={styles.paginationItem}
						/>
					)}
					sx={styles.pagination}
				/>
			</Box>
			{openDialog && (
				<BatchDetailDialog
					open={openDialog}
					onClose={handleCloseDialog}
					batch={selectedBatch}
					checks={batchData?.mailed_checks || []}
				/>
			)}
		</>
	)
}
