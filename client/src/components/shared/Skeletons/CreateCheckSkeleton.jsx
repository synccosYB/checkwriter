import { Skeleton } from '@mui/material'
import React from 'react'

const CreateCheckSkeleton = () => {
	return (
		<div className="container">
			<div className="row">
				{Array.from(Array(8).keys()).map((i, index) => (
					<div className="col-12 col-md-4 px-3" key={index}>
						<Skeleton
							variant="text"
							sx={{
								fontSize: '3.3rem',
								width: '100%',
								marginBottom: '0.8rem',
								transformOrigin: '0 0'
							}}
						/>
					</div>
				))}
			</div>
			<div className="d-flex align-items-center justify-content-between">
				<div className="d-flex align-items-center justify-content-start">
					<Skeleton
						variant="text"
						sx={{
							fontSize: '3rem',
							width: '120px',
							marginBottom: '0.8rem',
							transformOrigin: '0 0'
						}}
						className="me-3"
					/>
					<Skeleton
						variant="text"
						sx={{
							fontSize: '3rem',
							width: '120px',
							marginBottom: '0.8rem',
							transformOrigin: '0 0'
						}}
					/>
				</div>
				<div>
					<Skeleton
						variant="text"
						sx={{
							fontSize: '3.3rem',
							width: '120px',
							marginBottom: '0.8rem',
							transformOrigin: '0 0'
						}}
					/>
				</div>
			</div>
		</div>
	)
}

export default CreateCheckSkeleton
