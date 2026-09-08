import {
        Box,
        FormControl,
        MenuItem,
        OutlinedInput,
        Select,
        Typography
} from '@mui/material'
import { useState } from 'react'
import { styles } from './styles'
import ExpensesChart from '../ExpensesChart/ExpensesChart'

const Graphs = ({ type, onSelectDuration, graphData }) => {
        const [period, setPeriod] = useState('Weekly')

        return (
                <Box sx={styles.container}>
                        <Box sx={styles.header}>
                                <Typography sx={styles.title}>Stats</Typography>

                                <Box sx={styles.selectContainer}>
                                        <Box>
                                                <FormControl sx={styles.formControl} size="small">
                                                        <Select
                                                                id="period"
                                                                variant="outlined"
                                                                input={<OutlinedInput style={{ borderColor: 'green' }} />}
                                                                inputProps={{ 'aria-label': 'Without label' }}
                                                                defaultValue={'Weekly'}
                                                                value={period}
                                                                sx={styles.select}
                                                                onChange={(e) => {
                                                                        setPeriod(e.target.value)
                                                                        onSelectDuration(e.target.value)
                                                                }}
                                                                MenuProps={{
                                                                        sx: styles.menuProps
                                                                }}
                                                                color="success"
                                                        >
                                                                <MenuItem value={'Weekly'} defaultChecked sx={styles.menuItem}>
                                                                        Weekly
                                                                </MenuItem>
                                                                <MenuItem value={'Monthly'} sx={styles.menuItem}>
                                                                        Monthly
                                                                </MenuItem>
                                                                <MenuItem value={'Yearly'} sx={styles.menuItem}>
                                                                        Yearly
                                                                </MenuItem>
                                                        </Select>
                                                </FormControl>
                                        </Box>
                                </Box>
                        </Box>

                        <ExpensesChart period={period} type={type} graphData={graphData} />
                </Box>
        )
}

export default Graphs
