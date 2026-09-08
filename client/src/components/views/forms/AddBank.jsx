import React from 'react'

import CanadaBank from '../Banks/CanadaBank'
import USABank from '../Banks/USABank'

import Box from '@mui/material/Box'
import Tab from '@mui/material/Tab'
import TabContext from '@mui/lab/TabContext'
import TabList from '@mui/lab/TabList'
import TabPanel from '@mui/lab/TabPanel'
import { ErrorOutlineOutlined } from '@mui/icons-material'

const AddBank = ({
	onClose,
	bankData,
	isEdit,
	setDirty,
	warning,
	setWarning
}) => {
	const [value, setValue] = React.useState(bankData ? bankData.country : 'USA')

	const handleChange = (_, newValue) => {
		setValue(newValue)
	}

	return (
		<Box sx={{ width: '100%', typography: 'body1' }}>
			{warning && (
				<div class="alert alert-danger" role="alert">
					<div className="row row justify-content-between">
						<div className="col-auto p-2">
							<ErrorOutlineOutlined className="me-2" />
							Are you sure you want to close the modal? Your details wont be
							saved.
						</div>
						<div className="col-auto">
							<div className="row justify-content-end">
								<div className="col-auto">
									<button
										type="button"
										class="btn btn-light"
										onClick={() => setWarning(false)}
									>
										No
									</button>
								</div>
								<div className="col-auto">
									<button
										type="button"
										class="btn btn-danger"
										onClick={() => onClose(true)}
									>
										Yes
									</button>
								</div>
							</div>
						</div>
					</div>
				</div>
			)}
			<TabContext value={value}>
				{!isEdit ? (
					<Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
						<TabList
							onChange={handleChange}
							aria-label="lab API tabs example"
							centered
							TabIndicatorProps={{
								style: {
									backgroundColor: '#1e3a5f'
								}
							}}
							variant="fullWidth"
						>
							<Tab
								label="USA"
								value="USA"
								style={{ color: '#1e3a5f' }}
								className="fw-bold"
							/>
							<Tab
								label="CANADA"
								value="CANADA"
								style={{ color: '#1e3a5f' }}
								className="fw-bold"
							/>
						</TabList>
					</Box>
				) : null}

				<TabPanel value="USA" sx={{ padding: '2rem 1rem 1.5rem' }}>
					<USABank
						onClose={onClose}
						bankData={bankData}
						isEdit={isEdit}
						setDirty={setDirty}
					/>
				</TabPanel>
				<TabPanel value="CANADA" sx={{ padding: '2rem 1rem 1.5rem' }}>
					<CanadaBank
						onClose={onClose}
						bankData={bankData}
						isEdit={isEdit}
						setDirty={setDirty}
					/>
				</TabPanel>
			</TabContext>
		</Box>
	)
}

export default AddBank
