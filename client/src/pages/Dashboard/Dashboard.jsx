import CheckStats from '../../components/views/CheckStats/CheckStats'
import RecentChecks from '../../components/views/RecentChecks/RecentChecks'
import { useEffect, useState } from 'react'
import WelcomeModal from '../../components/views/Dashboard/welcomeModal'
import TypeSelector from '../../components/views/Dashboard/typeSelector'
import { getStarAndEndDate } from '../../utils/helper'
import useCheckStats from '../../API/checks/useCheckStats'
import { Box, Grid, Typography } from '@mui/material'
import ProfileSelector from '../../components/views/Dashboard/ProfileSelector'
import useUserInfo from '../../API/users/useUserInfo'
import { useSelector } from 'react-redux'
import { styles } from './styles'
import Graphs from '../../components/views/Graphs/Graphs'

const Dashboard = () => {
	const org = useSelector((state) => state?.appData?.selectedOrganization)
	const [type, setType] = useState('Total Expenses')
	const [dateRange, setDateRange] = useState(getStarAndEndDate())
	const [duration, setDuration] = useState('weekly')
	const [profiles, setProfiles] = useState([])
	const { data: userData } = useUserInfo()
	useEffect(() => {
		if (userData) {
			setProfiles(org ? [org] : [userData._id])
		}
	}, [userData, org])

	const includePersonalProfile = userData && profiles.includes(userData._id)
	const organizationIds = userData
		? profiles.filter((id) => id !== userData._id)
		: []

	const { data } = useCheckStats({
		type,
		includePersonalProfile,
		organizationIds,
		duration,
		...dateRange
	})

	const stats = {
		totalChecks: data?.totalChecks || 0,
		totalClearedChecks: data?.totalClearedChecks || 0,
		totalDraftChecks: data?.totalDraftChecks || 0
	}

	const handleApply = (selectedProfiles) => {
		if (selectedProfiles.length === 0) {
			setProfiles(org ? [org] : [userData?._id])
		} else {
			setProfiles(selectedProfiles)
		}
	}

	return (
		<>
			<Box sx={styles.pageContainer}>
				<Box sx={styles.pageHeader}>
					<Box
						sx={{
							display: 'flex',
							alignItems: 'center',
							columnGap: '12px',
							justifyContent: { md: 'flex-start', xs: 'space-between' },
							flex: { md: 'none', xs: '1' }
						}}
					>
						<Typography sx={styles.title}>Dashboard</Typography>
						<ProfileSelector value={profiles} onApply={handleApply} />
					</Box>
					<Box>
						<TypeSelector onSelect={setType} />
					</Box>
				</Box>
				<CheckStats type={type} stats={stats} profiles={profiles} />
				<Grid
					container
					spacing={{ xs: '8px', md: '16px', xl: '24px' }}
					sx={styles.graphsContainer}
				>
					<Grid item xs={12} lg={6} sx={styles.grraphItem}>
						<Graphs
							graphData={data?.checksCartData || {}}
							type={type}
							onSelectDuration={(period) => {
								setDuration(period.toLowerCase())
								setDateRange(getStarAndEndDate(period))
							}}
						/>
					</Grid>
					<Grid item xs={12} lg={6} sx={styles.grraphItem}>
						<RecentChecks />
					</Grid>
				</Grid>
			</Box>
			<WelcomeModal />
		</>
	)
}

export default Dashboard
