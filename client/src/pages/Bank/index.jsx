import React, { useState } from 'react'
import { Box, TextField, InputAdornment, Button } from '@mui/material'

import { styles } from './styles'
import SearchIcon from '@mui/icons-material/Search'
import AddIcon from '@mui/icons-material/Add'
import ActiveBankAccount from './components/ActiveBankAccount'

import { AddNewModal } from './components/modals'
import Tabs from '../../components/shared/tabs'
import { useDebounce } from '../../utils/hooks/useDebounce'

const BankAccount = () => {
	const [searchQuery, setSearchQuery] = useState('')

	const debouncedQuery = useDebounce(searchQuery, 200)

	const [openAddNewModal, setOpenAddNewModal] = useState(false)

	const renderHeader = () => (
		<Box sx={styles.actionContainer}>
			<TextField
				placeholder="Search"
				sx={{ ...styles.searchField }}
				value={searchQuery}
				onChange={({ target: { value } }) => setSearchQuery(value)}
				InputProps={{
					startAdornment: (
						<InputAdornment position="start" sx={styles.searchIconContainer}>
							<SearchIcon sx={styles.searchIcon} />
						</InputAdornment>
					)
				}}
			/>
			<Button
				sx={styles.nextButton}
				startIcon={<AddIcon />}
				onClick={() => setOpenAddNewModal(true)}
			>
				New
			</Button>
		</Box>
	)

	return (
		<Box sx={styles.wrapper}>
			<Box sx={styles.tabContainer}>
				<Tabs
					tabsPanelProps={{ sx: { px: 0 } }}
					tabsData={[
						{
							title: 'Bank Accounts',
							component: (
								<>
									{renderHeader()}
									<ActiveBankAccount
										status={'active'}
										search={debouncedQuery}
									/>
								</>
							)
						},
						{
							title: 'Deactivated Bank Accounts',
							component: (
								<>
									{renderHeader()}
									<ActiveBankAccount
										status={'inactive'}
										search={debouncedQuery}
									/>
								</>
							)
						}
					]}
				/>
			</Box>

			<AddNewModal
				open={openAddNewModal}
				onClose={() => {
					setOpenAddNewModal(false)
				}}
			/>
		</Box>
	)
}

export default BankAccount
