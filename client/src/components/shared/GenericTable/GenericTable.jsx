import React, { useEffect } from 'react'
import {
	Paper,
	TableContainer,
	Table,
	TableHead,
	TableRow,
	TableCell,
	TableBody,
	TablePagination,
	IconButton,
	TableSortLabel,
	Popover,
	Checkbox
} from '@mui/material'
import {
	FilterAltOutlined,
	FilterAltRounded,
	KeyboardArrowDown,
	KeyboardArrowUp
} from '@mui/icons-material'
import './Table.css'
import TableSkeleton from '../Skeletons/TableSkeleton'
import { useState } from 'react'
import dayjs from 'dayjs'
import Option from './GenericTableSubComponents/Option'
import Number from './GenericTableSubComponents/Number'
import Date from './GenericTableSubComponents/Date'
import NoDataFound from '../../views/NoDataFound'

const ExpandedRow = ({ expandedColumnData, modifiedData, size }) => {
	return (
		<TableCell colSpan={size} className="p-0 m-0">
			<div className="container">
				<div className="row">
					<div className="col">
						{expandedColumnData.map((column, index) => {
							return (
								<>
									{index < 3 && (
										<TableRow>
											<TableCell style={{ border: '0px' }}>
												<b className="text-secondary">
													<small>{column.key + ' : '}</small>
												</b>
											</TableCell>
											<TableCell style={{ border: '0px' }} className="p-2">
												<small>{modifiedData[column.value]}</small>
											</TableCell>
										</TableRow>
									)}
								</>
							)
						})}
					</div>
					<div className="col">
						{expandedColumnData.map((column, index) => {
							return (
								<>
									{index >= 3 && (
										<TableRow>
											<TableCell style={{ border: '0px' }}>
												<b className="text-secondary">
													<small>{column.key + ' : '}</small>
												</b>
											</TableCell>
											<TableCell style={{ border: '0px' }} className="p-2">
												<small>{modifiedData[column.value]}</small>
											</TableCell>
										</TableRow>
									)}
								</>
							)
						})}
					</div>
				</div>
			</div>
		</TableCell>
	)
}

const GenericTableRow = ({
	rowData,
	columnData,
	expandedColumnData,
	index,
	clickable,
	selectRow
}) => {
	const [expanded, setExpanded] = useState(false)

	const toggleExpand = () => {
		setExpanded(!expanded)
	}

	return (
		<>
			<TableRow
				key={index}
				onClick={
					clickable
						? (e) => {
								selectRow(rowData?._id, false, e)
						  }
						: null
				}
				className={clickable ? 'clickableRow' : ''}
				style={
					rowData?.sno?.props?.checked
						? { backgroundColor: 'rgb(175 239 168 / 13%)' }
						: null
				}
			>
				{columnData.map((column, index) => {
					if (column.type && column.type === 'html') {
						return (
							<TableCell
								className="generic-table-data-cell"
								key={index}
								align={column?.align || 'center'}
								width={column?.colWidth || '10%'}
								sx={{
									borderBottom: '1px solid #c8cbcb'
								}}
							>
								<div className="cell-border">
									{index == 0 && expandedColumnData && (
										<div style={{ display: 'inline-block' }}>
											<IconButton
												onClick={(event) => {
													toggleExpand()
													event.stopPropagation()
												}}
												sx={{
													padding: '3px'
												}}
											>
												{expanded ? <KeyboardArrowUp /> : <KeyboardArrowDown />}
											</IconButton>
										</div>
									)}
									{rowData?.[column.value]?.['html']
										? rowData[column.value]['html']
										: rowData[column.value]}
								</div>
							</TableCell>
						)
					} else if (column.type && column.type === 'contextmenu') {
						return (
							<TableCell
								className="generic-table-data-cell"
								key={index}
								align={column?.align || 'center'}
								width={column?.colWidth || '10%'}
								sx={{
									borderBottom: '1px solid #c8cbcb'
								}}
							>
								<div className="cell-border">
									<div className="d-flex align-items-center justify-content-center">
										<div>{rowData[column?.value]} </div>
									</div>
								</div>
							</TableCell>
						)
					} else {
						return (
							<TableCell
								className="generic-table-data-cell"
								key={index}
								align={column?.align || 'center'}
								width={column?.colWidth || '10%'}
								sx={{
									borderBottom: '1px solid #c8cbcb'
								}}
							>
								<div className="cell-border">
									<p
										className={`generic-table-data ${
											column?.extraClass || ''
										} `}
										style={
											rowData.backColor && column.value === 'status'
												? { backgroundColor: rowData.backColor }
												: null
										}
									>
										{rowData[column.value]}
									</p>
								</div>
							</TableCell>
						)
					}
				})}
			</TableRow>

			{expanded && (
				<ExpandedRow
					expandedColumnData={expandedColumnData}
					modifiedData={rowData}
					size={columnData.length}
				/>
			)}
		</>
	)
}

const GenericTable = ({
	columnData,
	expandedColumnData,
	modifiedData,
	isLoading,
	initialfilter,
	clickable,
	selectRow,
	selectedRows,
	noDataProps,
	paginationOff,
	height = '60vh'
}) => {
	const [renderModifiedData, setRenderModifiedData] = useState(modifiedData)

	useEffect(() => {
		clearAllFilter()
	}, [modifiedData])

	const [order, setOrder] = useState('asc')
	const [orderBy, setOrderBy] = useState(initialfilter || 'id')
	const [page, setPage] = useState(0)
	const [rowsPerPage, setRowsPerPage] = useState(10)
	const [anchorEl, setAnchorEl] = React.useState(null)
	const [filterOptions, setFilterOptions] = React.useState(null)
	const [filterMap, setFilterMap] = React.useState(new Map())

	const hasFilter = columnData.some((obj) => obj.hasOwnProperty('filterType'))

	const handleChangePage = (event, newPage) => {
		setPage(newPage)
	}

	const handleChangeRowsPerPage = (event) => {
		setRowsPerPage(parseInt(event.target.value, 10))
		setPage(0)
	}

	const stableSort = (array, comparator) => {
		const stabilizedThis = array.map((el, index) => [el, index])
		stabilizedThis.sort((a, b) => {
			const order = comparator(a[0], b[0])
			if (order !== 0) {
				return order
			}
			return a[1] - b[1]
		})
		return stabilizedThis.map((el) => el[0])
	}

	const descendingComparator = (a, b, orderBy) => {
		if (orderBy === 'amount') {
			let first = parseFloat(a[orderBy].replace('$', ''))
			let second = parseFloat(b[orderBy].replace('$', ''))

			if (second < first) {
				return -1
			}
			if (second > first) {
				return 1
			}
		} else if (orderBy.includes('Date')) {
			let first = dayjs(a[orderBy], 'D/M/YYYY').toDate()
			let second = dayjs(b[orderBy], 'D/M/YYYY').toDate()

			return second.getTime() - first.getTime()
		} else {
			if (b[orderBy] < a[orderBy]) {
				return -1
			}
			if (b[orderBy] > a[orderBy]) {
				return 1
			}
		}

		return 0
	}

	const getComparator = (order, orderBy) => {
		return order === 'desc'
			? (a, b) => descendingComparator(a, b, orderBy)
			: (a, b) => -descendingComparator(a, b, orderBy)
	}

	const visibleRows = React.useMemo(() => {
		if (renderModifiedData.length > 0 || filterMap.size != 0) {
			let filteredData = modifiedData.filter((item1) =>
				renderModifiedData.some((item2) => item2._id === item1._id)
			)
			return stableSort(filteredData, getComparator(order, orderBy)).slice(
				page * rowsPerPage,
				page * rowsPerPage + rowsPerPage
			)
		} else {
			return stableSort(modifiedData, getComparator(order, orderBy)).slice(
				page * rowsPerPage,
				page * rowsPerPage + rowsPerPage
			)
		}
	}, [
		order,
		orderBy,
		page,
		rowsPerPage,
		modifiedData,
		renderModifiedData,
		filterMap,
		selectedRows
	])

	const createSortHandler = (property) => (event) => {
		handleRequestSort(event, property)
	}

	const handleRequestSort = (event, property) => {
		const isAsc = orderBy === property && order === 'asc'
		setOrder(isAsc ? 'desc' : 'asc')
		setOrderBy(property)
	}

	const handleClose = () => {
		setAnchorEl(null)
	}

	const open = Boolean(anchorEl)
	const id = open ? 'simple-popover' : undefined

	const filterData = (event, key, type) => {
		setAnchorEl(event.currentTarget)
		setFilterOptions({ key: key, type: type })
	}

	const recieveFilter = (filter, key, type) => {
		let temp = filterMap
		temp.set(key, {
			type: type,
			filter: filter
		})
		setFilterMap(temp)
		applyFilter(temp)
	}

	const applyFilter = (filters) => {
		let temp = modifiedData
		for (let filter of filters) {
			let _key = filter[0]
			let type = filter[1].type
			let value = filter[1].filter

			switch (type) {
				case 'option':
					let columnType = columnData.find((item) => item.value === _key).type
					if (columnType !== 'html') {
						temp = temp.filter((item) => {
							if (value.includes(item[_key])) {
								return item
							}
						})
					} else {
						temp = temp.filter((item) => {
							if (value.includes(item[_key]['value'])) {
								return item
							}
						})
					}
					break
				case 'number':
					temp = temp.filter((item) => {
						if (
							parseInt(item[_key].substring(1, item[_key].length)) >=
								value.min &&
							parseInt(item[_key].substring(1, item[_key].length)) <= value.max
						) {
							return item
						}
					})
					handleClose()
					break
				case 'date':
					temp = temp.filter((item) => {
						const date = dayjs(item[_key])
						if (date >= value.startDate && date <= value.endDate) {
							return item
						}
					})
					handleClose()
					break

				default:
					return null
			}
		}
		setRenderModifiedData(temp)
	}

	const clearFilter = (key) => {
		let temp = filterMap
		temp.delete(key)
		setFilterMap(temp)
		applyFilter(temp)
	}

	const clearAllFilter = () => {
		setFilterMap(new Map())
		applyFilter(new Map())
	}

	const checkAll = (event) => {
		let checked = event.target.checked

		if (checked) {
			let arr =
				renderModifiedData.length === 0 ? modifiedData : renderModifiedData
			let sel = arr.map((item) => item._id)
			selectRow(sel, true)
		} else {
			selectRow([], true)
		}
	}

	const getFilter = () => {
		switch (filterOptions?.type) {
			case 'option':
				return (
					<Option
						data={modifiedData}
						columnData={columnData}
						_key={filterOptions?.key}
						sendFilter={recieveFilter}
						filterMap={filterMap}
						clear={clearFilter}
					/>
				)
			case 'number':
				return (
					<Number
						data={modifiedData}
						_key={filterOptions?.key}
						sendFilter={recieveFilter}
						filterMap={filterMap}
						clear={clearFilter}
					/>
				)
			case 'date':
				return (
					<Date
						data={modifiedData}
						_key={filterOptions?.key}
						sendFilter={recieveFilter}
						filterMap={filterMap}
						clear={clearFilter}
					/>
				)
			default:
				return <p>other</p>
		}
	}

	return (
		<Paper
			className="generic-table-div"
			sx={{ width: '100%', overflow: 'hidden', borderRadius: '8px' }}
		>
			<TableContainer
				className="generic-table-inner-container"
				sx={{ maxHeight: height }}
			>
				<Table className="generic-table" stickyHeader aria-label="sticky table">
					<TableHead className="generic-table-head">
						<TableRow className="generic-table-head-row">
							{columnData.map((data, index) => {
								return (
									<TableCell
										className="generic-table-head-cell"
										width={data?.colWidth || '10%'}
										key={index}
										align={data?.align || 'center'}
									>
										{data?.isSort ? (
											<TableSortLabel
												active={orderBy === data.value}
												direction={orderBy === data.value ? order : 'asc'}
												onClick={createSortHandler(data.value)}
												sx={{
													textAlign: data?.align || 'center',
													'& .MuiTableSortLabel-icon': {
														position: 'absolute',
														left: '-25px'
													}
												}}
												//hideSortIcon={true}
											>
												<small style={{ fontSize: '12px' }}>{data.key}</small>
											</TableSortLabel>
										) : data?.key === 'checkbox' ? (
											<Checkbox
												sx={{
													'&.MuiCheckbox-root': {
														padding: '8px',
														'&.Mui-checked': {
															color: '#5EA479'
														},
														'&:hover': {
															backgroundColor: '#1e3a5f29'
														},
														'& .MuiSvgIcon-root': {
															width: '18px',
															height: '18px'
														}
													}
												}}
												onClick={checkAll}
											/>
										) : (
											<small style={{ fontSize: '12px' }}>{data.key}</small>
										)}

										{data?.isFilter ? (
											<IconButton
												aria-describedby={data._id}
												variant="contained"
												onClick={(event) =>
													filterData(event, data.value, data.filterType)
												}
												sx={{
													padding: '10px',
													marginLeft: '3px',
													width: '16px',
													height: '16px',
													marginRight: '-10px'
												}}
											>
												{!filterMap.has(data?.value) ? (
													<FilterAltOutlined style={{ fontSize: '14px' }} />
												) : (
													<FilterAltRounded
														style={{ fontSize: '14px', color: '#1e3a5f' }}
													/>
												)}
											</IconButton>
										) : null}
									</TableCell>
								)
							})}
						</TableRow>
					</TableHead>

					<TableBody
						className="generic-table-body"
						style={
							modifiedData?.length === 0 || visibleRows?.length === 0
								? {
										height: '30vh',
										padding: '0',
										position: 'relative'
								  }
								: null
						}
					>
						{isLoading ? (
							<TableSkeleton count={columnData.length} />
						) : modifiedData.length === 0 ? (
							<NoDataFound {...noDataProps} needBtn={true} />
						) : visibleRows?.length === 0 ? (
							<NoDataFound {...noDataProps} needBtn={false} />
						) : (
							visibleRows.map((rowData, index) => {
								return (
									<React.Fragment key={index}>
										<GenericTableRow
											rowData={rowData}
											index={index}
											columnData={columnData}
											expandedColumnData={expandedColumnData}
											clickable={clickable}
											selectRow={selectRow}
										/>
									</React.Fragment>
								)
							})
						)}
					</TableBody>
					<Popover
						id={id}
						open={open}
						anchorEl={anchorEl}
						onClose={handleClose}
						anchorOrigin={{
							vertical: 'bottom',
							horizontal: 'left'
						}}
						sx={{
							border: 0
						}}
						style={{
							position: 'position',
							marginLeft: '-70px',
							marginTop: '16px'
						}}
					>
						{getFilter()}
					</Popover>
				</Table>
			</TableContainer>

			<div className="d-flex align-items-center justify-content-between mt-4 w-100">
				<div className="col-auto">
					{hasFilter && filterMap.size > 0 ? (
						<p
							className="text-danger btn clearFilter m-0"
							style={{
								fontSize: '14px'
							}}
							onClick={clearAllFilter}
						>
							Clear All Filters
						</p>
					) : null}
				</div>
				{!paginationOff &&
				(modifiedData?.length > 0 || visibleRows?.length > 0) ? (
					<div className="col-auto">
						<TablePagination
							align="center"
							className="generic-table-pagination"
							component={'div'}
							rowsPerPageOptions={[10, 15, 20]}
							count={
								renderModifiedData.length > 0
									? renderModifiedData.length
									: modifiedData.length
							}
							rowsPerPage={rowsPerPage}
							onPageChange={handleChangePage}
							onRowsPerPageChange={handleChangeRowsPerPage}
							page={page}
						/>
					</div>
				) : null}
			</div>
		</Paper>
	)
}

export default GenericTable
