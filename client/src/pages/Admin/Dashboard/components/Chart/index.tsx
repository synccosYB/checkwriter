import React, { useMemo, useState } from 'react';
import { UsersIcon } from '../../../../../components/Icons';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer
} from 'recharts';
import {
  Paper,
  Box,
  Typography,
  Select,
  MenuItem,
  SelectChangeEvent
} from '@mui/material';

import NorthIcon from '@mui/icons-material/North';
import SouthIcon from '@mui/icons-material/South';
import { styles } from '../../styles'
import { ChartData } from '../../../../../API/admin/useGetMonthlySingup';



interface CustomTooltipProps {
  active?: boolean;
  payload?: Array<{
    value: number;
    payload: ChartData;
  }>;
  label?: string;
  coordinate?: { x: number; y: number };
}

const CustomTooltip: React.FC<CustomTooltipProps> = ({ active, payload, coordinate }) => {
  if (active && payload && payload.length && coordinate) {
    const data = payload[0].payload;
    const percentageChangeValue = data.percentChange || 0;
    const percentageChangeValueColor = percentageChangeValue < 0 ? '#F03D3E' : '#058205';
    return (
      <Box
        sx={{
          position: 'absolute',
          left: coordinate.x,
          top: coordinate.y - 80,
          transform: 'translateX(-50%)',
          zIndex: 1000,
        }}
      >
        <Paper
          elevation={8}
          sx={styles.chartTooltip}
        >
          <Typography variant="caption" sx={{ whiteSpace: 'nowrap', color:"#bdbdbd" }}>
            {data.unit}
          </Typography>
          <br/>
          <Typography variant="caption" sx={{ color: '#bdbdbd', whiteSpace: 'nowrap', mr: '5px' }}>
            {`New Users = ${payload[0].value.toLocaleString()}`}
          </Typography>
          <Typography variant="caption" sx={{ color: percentageChangeValue === 0 ? 'grey' : percentageChangeValueColor, whiteSpace: 'nowrap' }}>
            {data.percentChange || 0}%
          </Typography>
        </Paper>
      </Box>
    );
  }
  return null;
};

const formatYAxisValue = (value: number): string => {
  if (value >= 1000000) {
    return `${(value / 1000000).toFixed(1)}M`;
  } else if (value >= 1000) {
    return `${(value / 1000).toFixed(0)}k`;
  }
  return value.toString();
};

export const Chart: React.FC<{data:ChartData[] | undefined ;range: string; setRange: React.Dispatch<React.SetStateAction<string>>}> = ({range, setRange, data}) => {

  const currentValue = data ? data.reduce((total, curr) => total + curr.value, 0) : 0

  const handlePeriodChange = (event: SelectChangeEvent) => {
    setRange(event.target.value);
  };

  return (
    <Paper
      elevation={3}
      sx={styles.chartContainer}
    >
      {/* Header */}
      <Box sx={styles.chartHeaderContainer}>
        <Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <UsersIcon />
            <Typography color="#000000DE" sx={{ mb: 0.5 , fontSize: {sm: '16px', xs: '14px'}}}>
              New Signups
            </Typography>
          </Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Typography sx={{ fontWeight: 700, color: 'text.primary', fontSize: {sm: '30px', xs: '20px'} }}>
              {currentValue.toLocaleString()}
            </Typography>
          </Box>
        </Box>

        <Select
          value={range}
          onChange={handlePeriodChange}
          sx={styles.chartSelect}
        >
          <MenuItem value="daily">Daily</MenuItem>
          <MenuItem value="weekly">Weekly</MenuItem>
          <MenuItem value="monthly">Monthly</MenuItem>
          <MenuItem value="yearly">Yearly</MenuItem>
        </Select>
      </Box>

      <Box sx={{ height: 300, width: '100%', position: 'relative' }}>
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart
            data={data}
            margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
          >
            <defs>
              <linearGradient id="colorGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#1e3a5f" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#1e3a5f" stopOpacity={0.05} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis
              dataKey="label"
              axisLine={false}
              tickLine={false}
              tick={{ fontSize: 12, fill: '#757575' }}
            />
            <YAxis
              axisLine={false}
              tickLine={false}
              tick={{ fontSize: 12, fill: '#757575' }}
              tickFormatter={formatYAxisValue}
            />
            <Tooltip
              content={<CustomTooltip />}
              position={{ x: 0, y: 0 }}
              allowEscapeViewBox={{ x: false, y: true }}
            />
            <Area
              type="monotone"
              dataKey="value"
              stroke="#1e3a5f"
              strokeWidth={2}
              fill="url(#colorGradient)"
              dot={false}
              activeDot={{
                r: 10,
                fill: '#1e3a5f',
                stroke: '#ffffff',
                strokeWidth: 2
              }}
            />
          </AreaChart>
        </ResponsiveContainer>
      </Box>
    </Paper>
  );
};