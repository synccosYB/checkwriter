import React from 'react'
import {
	AreaChart,
	Area,
	XAxis,
	YAxis,
	Tooltip,
	ResponsiveContainer
} from 'recharts'
import { Box, Typography } from '@mui/material'
import { formatUSD } from '../../../utils/helper'
import { styles } from './styles'

const ExpensesChart = ({ period, type, graphData }) => {
	const chartData = graphData?.chartData
	const total = graphData?.total || 0
	const startDate = graphData?.formattedDateRange?.startDate
	const endDate = graphData?.formattedDateRange?.endDate

	return (
		<>
			<Box sx={styles.header}>
				<Typography sx={styles.title}>
					{type === 'Total Expenses'
						? formatUSD(total)
						: chartData?.reduce(
								(acc, item) => (acc += parseInt(item.checks)),
								0
						  )}
				</Typography>
				<Typography sx={styles.dateRange}>
					{startDate}- &nbsp;
					{endDate}
				</Typography>
			</Box>

			<Box sx={styles.chartContainer}>
				<ResponsiveContainer width="100%" height="100%">
					<AreaChart
						data={chartData}
						margin={{
							top: 10,
							right: 30,
							left: 0,
							bottom: 0
						}}
					>
						<defs>
							<linearGradient id="coloramt" x1="0" y1="0" x2="0" y2="1">
								<stop offset="5%" stopColor="#EEFCDB" stopOpacity={1} />
								<stop offset="95%" stopColor="#EEFCDB" stopOpacity={0} />
							</linearGradient>
						</defs>
						<XAxis dataKey="name" style={styles.axis} />
						{type === 'Total Expenses' ? (
							<YAxis
								domain={[0, total]}
								allowDecimals={true}
								style={styles.axis}
							/>
						) : (
							<YAxis allowDecimals={false} style={styles.axis} />
						)}

						<Tooltip />
						<Area
							type="monotone"
							dataKey={type === 'Total Expenses' ? 'amount' : 'checks'}
							stroke={styles.area.stroke}
							fillOpacity={styles.area.fillOpacity}
							fill="url(#coloramt)"
						/>
					</AreaChart>
				</ResponsiveContainer>
			</Box>
		</>
	)
}

export default ExpensesChart
