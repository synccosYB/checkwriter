import React from 'react'

import {
	Table,
	TableBody,
	TableCell,
	TableContainer,
	TableHead,
	TableRow
} from '@mui/material'

import { Typography, Divider } from '@mui/material'

const InvoiceChecks = () => {
	return (
		<>
			<div
				className="container"
				style={{
					borderColor: '#bbbbbb',
					borderWidth: '0.5px',
					padding: '20px 0px 0'
				}}
			>
				<div className="page-header d-flex align-items-center justify-content-between mb-4 pb-4">
					<h3
						className="fs-5 fw-semibold m-0"
						style={{
							color: '#1a1a2e'
						}}
					>
						Invoice
					</h3>
				</div>
				<div
					className="row"
					style={{ marginTop: '50px', marginBottom: '40px' }}
				>
					<div className="col-12">
						<div
							className="container"
							style={{
								borderRadius: '12px',
								borderStyle: 'solid',
								borderColor: '#bbbbbb',
								borderWidth: '0.5px',
								padding: '20px 20px 0'
							}}
						>
							<div className="row">
								<div className="content">
									<div className="subscriptionsIn">
										<div className="mb-5">
											<Typography variant="body2">
												<Typography variant="body1">
													<strong>Email Subject: </strong>
													Check Shipment Request Received from [ORG_NAME] On
													[MM/DD/YYYY]
												</Typography>
											</Typography>
											<Typography variant="body1">
												<strong>Email Body:</strong>
												<br />
												<br />
												Below are the check shipment request received. Please
												find attached PDF to print the check.
											</Typography>
										</div>
									</div>
								</div>

								<div className="flex-container"></div>

								<div className="flex-container">
									<Typography variant="body1">
										<strong>Payee Name : Jason</strong>
									</Typography>
								</div>
								<TableContainer style={{ maxWidth: '60%' }}>
									<Table>
										<TableHead>
											<TableRow>
												<TableCell>
													<b>Check No</b>
												</TableCell>

												<TableCell>
													<b>Address</b>
												</TableCell>
												<TableCell>
													<b>Amount</b>
												</TableCell>
											</TableRow>
										</TableHead>
										<TableBody>
											<TableRow>
												{/* <TableCell>1</TableCell> */}
												<TableCell>00003</TableCell>
												{/* <TableCell >Leon</TableCell> */}
												<TableCell>
													123 Broadway Street, New York, NY 10019 United States
												</TableCell>
												<TableCell>$30.00</TableCell>
											</TableRow>
											{/* <TableCell>2</TableCell> */}
											<TableCell>00004</TableCell>
											{/* <TableCell >Leon</TableCell> */}
											<TableCell>
												123 Broadway Street, New York, NY 10019 United States
											</TableCell>
											<TableCell>$30.00</TableCell>
										</TableBody>
									</Table>
								</TableContainer>

								<div className="flex-container" style={{ marginTop: '30px' }}>
									<Typography variant="body1">
										<strong>Payee Name : Peter</strong>
									</Typography>
								</div>
								<TableContainer style={{ maxWidth: '60%' }}>
									<Table>
										<TableHead>
											{/* <TableCell>
													<b>Sr No.</b>
												</TableCell> */}
											<TableCell>
												<b>Check No</b>
											</TableCell>
											{/* <TableCell >
													<b>Payee Name</b>
												</TableCell> */}
											<TableCell>
												<b>Address</b>
											</TableCell>
											<TableCell>
												<b>Amount</b>
											</TableCell>
										</TableHead>
										<TableBody>
											<TableRow>
												{/* <TableCell>1</TableCell> */}
												<TableCell>00006</TableCell>
												{/* <TableCell >Leon</TableCell> */}
												<TableCell>
													456 John Street, Brooklyn, NY 10025 United States
												</TableCell>
												<TableCell>$30.00</TableCell>
											</TableRow>
										</TableBody>
									</Table>
								</TableContainer>
								{/* </Card> */}

								<Divider style={{ margin: '20px 0' }} />

								<div
									style={{
										display: 'flex',
										justifyContent: 'start',
										marginBottom: '10px'
									}}
								>
									<Typography
										variant="body2"
										style={{
											marginRight: '50px',
											fontSize: '18px',
											marginTop: '1px'
										}}
									>
										<b>Shipping Type</b>
									</Typography>
									{/* <Typography variant="body1"><b>Express</b></Typography> */}
									<div
										style={{
											backgroundColor: 'rgb(139 225 60)',
											color: 'white',
											padding: '4px 8px',
											borderRadius: '4px',
											fontWeight: 'bold'
											// borderRadius:"50%"
										}}
									>
										Express
									</div>
								</div>

								<Divider style={{ margin: '20px 0' }} />
							</div>
							<div className="mb-4">
								Thanks,<br></br>
								Synccos Team
							</div>
						</div>
					</div>
				</div>
			</div>
		</>
	)
}

export default InvoiceChecks
