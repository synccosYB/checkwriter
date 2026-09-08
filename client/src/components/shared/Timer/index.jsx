import { Box, Typography } from '@mui/material'
import React, { useEffect, useState } from 'react'

const DEFAULT_TIMER_IN_SECONDS = 30

const Timer = ({ onTimerComplete }) => {
	const [timeLeft, setTimeLeft] = useState(DEFAULT_TIMER_IN_SECONDS)

	useEffect(() => {
		if (timeLeft === 0) {
			onTimerComplete()
			return
		}

		const timerId = setInterval(() => {
			setTimeLeft((prevTime) => prevTime - 1)
		}, 1000)

		return () => clearInterval(timerId)
	}, [timeLeft, onTimerComplete])

	const formatTime = (seconds) => {
		return `${seconds}s`
	}

	return (
		<Box display={'flex'}>
			<Typography
				sx={{
					fontSize: { xs: '14px', sm: '18px' },
					lineHeight: '1.1',
					color: 'rgba(32, 68, 100, 1)'
				}}
			>
				{formatTime(timeLeft)}
			</Typography>
		</Box>
	)
}

export default Timer
