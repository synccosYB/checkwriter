import React, { useState } from "react";
import { styles } from "./styles";
import { useHistory } from 'react-router-dom/cjs/react-router-dom.min'
import { Box, Divider, Typography } from "@mui/material";
import CallMadeIcon from '@mui/icons-material/CallMade';
import { Chart } from './components/Chart'
import useGetMonthlySingup from "../../../API/admin/useGetMonthlySingup";

const AdminDashboard: React.FC = () => {
  const [range, setRange] = useState('yearly');
  const {data} = useGetMonthlySingup(range);
  const history = useHistory();
  const totalUser = data ? data.total : 0

  return (
    <Box sx={styles.wrapper}>
      <Typography sx={styles.title}>
        Admin Dashboard
      </Typography>

      <Typography
        variant="body1"
        color="text.secondary"
        sx={styles.description}
      >
        Get a quick overview of user activity, including new signups, total growth, and usage trends all in one easy-to-read dashboard.
      </Typography>

      <Divider sx={{ my: '24px' }} />


      <Box sx={styles.cardTotalContainer}>
        <Box sx={styles.cardHeader} onClick={()=>history.push("/dashboard/user-management")}>
          <Typography sx={styles.cardTotalTitle}>Total Users</Typography>
          <CallMadeIcon sx={styles.cardTotalIcon} />
        </Box>
        <Typography sx={styles.cardTotalAmount}>{Number(totalUser).toLocaleString()}</Typography>
      </Box>

      <Chart range={range} setRange={setRange} data={data?.data} />
    </Box>
  )
}

export default AdminDashboard;
