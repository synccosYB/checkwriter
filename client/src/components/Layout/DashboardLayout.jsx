import React, { useState, useEffect } from 'react'
import { useTheme } from '@mui/material/styles'
import { Box, useMediaQuery } from '@mui/material'

import DashboardHeader from './Header/DashboardHeader'
import Sidebar from './Sidebar'
import DashboardRoutes from '../../routes/DashboardRoutes'
import ActAsUserAlert from '../Alert'
import { useSelector } from 'react-redux'

const DashboardLayout = (props) => {
        const [open, setOpen] = useState(false)
        const { showAlert } = useSelector((state) => state.alert)
        const theme = useTheme();
        const isMobile = useMediaQuery(theme.breakpoints.down('md'));

        const topOffset = showAlert ? '56px' : '0px'

        useEffect(() => {
                setOpen(!isMobile);
        }, [isMobile]);

        return (
                <>
                        <ActAsUserAlert />
                        <Box sx={{ display: 'flex', height: '100%', backgroundColor: theme.palette.background.default }}>
                                <DashboardHeader
                                        open={open}
                                        setOpen={setOpen}
                                        mt={topOffset}
                                        isMobile={isMobile}
                                />
                                <Sidebar
                                        open={open}
                                        setOpen={setOpen}
                                        mt={topOffset}
                                        isMobile={isMobile}
                                />
                                <Box
                                        component="main"
                                        sx={
                                                isMobile
                                                        ? {
                                                                        flexGrow: 1,
                                                                        paddingInline: '0px',
                                                                        paddingTop: '80px',
                                                                        paddingBottom: '20px',
                                                                        boxSizing: 'border-box',
                                                                        width: '100%',
                                                                        backgroundColor: theme.palette.background.default,
                                                                        transition: theme.transitions.create(['margin', 'width'], {
                                                                                easing: theme.transitions.easing.sharp,
                                                                                duration: theme.transitions.duration.leavingScreen
                                                                        })
                                                          }
                                                        : {
                                                                        flexGrow: 1,
                                                                        p: 3,
                                                                        paddingBottom: '0',
                                                                        paddingTop: '24px',
                                                                        marginTop: '56px',
                                                                        backgroundColor: theme.palette.background.default,
                                                                        minHeight: 'calc(100vh - 56px)',
                                                          }
                                        }
                                >
                                        <Box
                                                sx={{
                                                        mt: showAlert ? 5 : 0,
                                                        boxSizing: 'border-box',
                                                }}
                                        >
                                                {props?.children || <DashboardRoutes />}
                                        </Box>
                                </Box>
                        </Box>
                </>
        )
}

export default DashboardLayout
