import { ArrowOutwardOutlined } from '@mui/icons-material'
import { Box, IconButton, Typography } from '@mui/material'
import { useHistory } from 'react-router-dom/cjs/react-router-dom.min'
import { styles } from './styles'
const StatsIndicator = ({
	color,
	textColor,
	title,
	data,
	redirectUrl,
	showRedirect
}) => {
	const history = useHistory()

	const moveToMyChecks = () => {
		history.push(redirectUrl)
	}

	return (
		<Box
			sx={{
				...styles.card,
				backgroundColor: color,
				color: textColor
			}}
		>
			<Box style={styles.cardHeader}>
				<Typography
					sx={{
						...styles.title,
						color: textColor
					}}
				>
					{title}
				</Typography>
				{showRedirect && (
					<IconButton onClick={moveToMyChecks} sx={styles.iconButton}>
						<ArrowOutwardOutlined
							sx={{
								...styles.icon,
								color: textColor
							}}
						/>
					</IconButton>
				)}
			</Box>
			<Box>
				<Typography
					variant="h3"
					sx={{
						...styles.value,
						color: textColor
					}}
				>
					{data}
				</Typography>
			</Box>
		</Box>
	)
}

export default StatsIndicator
