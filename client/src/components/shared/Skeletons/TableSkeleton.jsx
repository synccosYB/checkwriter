import React from 'react'
import { TableRow, TableCell, Skeleton } from '@mui/material'

const TableSkeleton = ({ count }) => {
	return (
		<>
			{Array.from(Array(5).keys()).map((index) => {
				return (
					<TableRow key={index}>
						{Array.from(Array(count).keys()).map((indx) => {
							return (
								<TableCell
									className="generic-table-data-cell"
									key={indx}
									align="center"
								>
									<div className="cell-border">
										<Skeleton
											variant="text"
											sx={{ fontSize: '1rem', width: '80%' }}
										/>
									</div>
								</TableCell>
							)
						})}
					</TableRow>
				)
			})}
		</>
	)
}

export default TableSkeleton
