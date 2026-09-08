import React from 'react'
import { Box, Typography } from '@mui/material'
import { styles as progressBarStyles } from './styles'

interface ProgressBarSegments {
	orangeSegment: number
	redSegment: number
	greenSegment: number
	graySegment: number
}

interface ProgressBarProps {
	percentage: number
	value: number
	total: number
	isCompleted: boolean
	showValue?: boolean
	segments: ProgressBarSegments
}

const ProgressBar: React.FC<ProgressBarProps> = ({
	value,
	total,
	isCompleted,
	showValue = true,
	segments,
	percentage
}) => {
	const normalizedValue = isCompleted
		? 100
		: Math.min((value / total) * 100, 100)

	let currentFilledPercentage = normalizedValue

	const orangePct = isCompleted
		? 0
		: Math.min((segments.orangeSegment / total) * 100, currentFilledPercentage)
	currentFilledPercentage -= orangePct

	const redPct = isCompleted
		? 0
		: Math.min((segments.redSegment / total) * 100, currentFilledPercentage)
	currentFilledPercentage -= redPct

	const greenPct = isCompleted
		? 100
		: Math.min((segments.greenSegment / total) * 100, currentFilledPercentage)

	const filledSegmentsTotalPct = orangePct + redPct + greenPct
	const grayPct = isCompleted ? 0 : Math.max(0, 100 - filledSegmentsTotalPct)

	return (
		<Box sx={progressBarStyles?.progressBarContainer}>
			<Box sx={progressBarStyles?.progressBar}>
				{!isCompleted && orangePct > 0 && (
					<Box
						sx={{
							width: `${orangePct}%`,
							background: '#FF6A00',
							height: '100%'
						}}
					/>
				)}
				{!isCompleted && redPct > 0 && (
					<Box
						sx={{
							width: `${redPct}%`,
							background: '#F03D3E',
							height: '100%'
						}}
					/>
				)}
				{greenPct > 0 && (
					<Box
						sx={{
							width: `${greenPct}%`,
							background: '#058205',
							height: '100%'
						}}
					/>
				)}
				{!isCompleted && grayPct > 0 && (
					<Box
						sx={{
							width: `${grayPct}%`,
							background: '#E0E0E0',
							height: '100%'
						}}
					/>
				)}

				{showValue && (
					<Typography variant="body2" sx={progressBarStyles?.progressBarText}>
						{Math.round(percentage)}%
					</Typography>
				)}
			</Box>
		</Box>
	)
}

export default ProgressBar
