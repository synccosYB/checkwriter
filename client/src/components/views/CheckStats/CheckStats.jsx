import { Grid } from '@mui/material'
import { styles } from './styles'
import StatsIndicator from '../StatsIndicator/StatsIndicator'
import { formatUSD } from '../../../utils/helper'

const CheckStats = ({ type, stats, profiles }) => {
	const showRedirect = profiles.length === 1

	return (
		<Grid container spacing={{ xs: 2, md: 2, xl: 7 }} sx={styles.container}>
			<Grid item xs={12} sm={4} sx={styles.gridItem}>
				{type === 'Total Checks' && (
					<StatsIndicator
						color="#1e3a5f"
						textColor="white"
						title="Total checks"
						data={stats?.totalChecks}
						redirectUrl={`/dashboard/my-checks`}
						showRedirect={showRedirect}
					/>
				)}
				{type === 'Total Expenses' && (
					<StatsIndicator
						color="#1e3a5f"
						textColor="white"
						title="Total Amount"
						data={formatUSD(stats?.totalChecks)}
						redirectUrl={`/dashboard/my-checks`}
						showRedirect={showRedirect}
					/>
				)}
			</Grid>
			<Grid item xs={12} sm={4} sx={styles.gridItem}>
				{type === 'Total Checks' && (
					<StatsIndicator
						color="#ecfdf5"
						textColor="#065f46"
						title="Cleared"
						data={stats.totalClearedChecks}
						redirectUrl={`/dashboard/my-checks?status=Cleared Checks`}
						showRedirect={showRedirect}
					/>
				)}
				{type === 'Total Expenses' && (
					<StatsIndicator
						color="#ecfdf5"
						textColor="#065f46"
						title="Cleared"
						data={formatUSD(stats.totalClearedChecks)}
						redirectUrl={`/dashboard/my-checks?status=Cleared Checks`}
						showRedirect={showRedirect}
					/>
				)}
			</Grid>
			<Grid item xs={12} sm={4} sx={styles.gridItem}>
				{type === 'Total Checks' && (
					<StatsIndicator
						color="#f8fafc"
						textColor="#1a1a2e"
						title="Drafts"
						data={stats.totalDraftChecks}
						redirectUrl={`/dashboard/my-checks?status=Draft Checks`}
						showRedirect={showRedirect}
					/>
				)}
				{type === 'Total Expenses' && (
					<StatsIndicator
						color="#f8fafc"
						textColor="#1a1a2e"
						title="Drafts"
						data={formatUSD(stats.totalDraftChecks)}
						redirectUrl={`/dashboard/my-checks?status=Draft Checks`}
						showRedirect={showRedirect}
					/>
				)}
			</Grid>
		</Grid>
	)
}

export default CheckStats
