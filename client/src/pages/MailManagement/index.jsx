import { Box, Typography } from '@mui/material'

import { styles } from './styles'
import { AllCheckMailList } from './components/AllCheckMailList'
import { ProcessingBatchList } from './components/ProcessingBatchList'
import { ShipmentsAdminList } from './components/ShipmentsAdminList'
import Tabs from '../../components/shared/tabs'

import useMailingStats from '../../API/admin/useMailingStats'

const MailManagement = () => {
        const { data } = useMailingStats()

        const totals = {
                all: data?.all || 0,
                submitted: data?.submitted || 0,
                processing: data?.processing || 0,
                mailed: data?.mailed || 0,
                canceled: data?.canceled || 0,
                totalBatches: data?.totalBatches || 0,
                error: data?.error || 0
        }

        return (
                <Box sx={styles.wrapper}>
                        <Typography sx={styles.title}>Admin Mailing Management</Typography>

                        <Typography
                                variant="body1"
                                color="text.secondary"
                                sx={styles.description}
                        >
                                Manage and process check mailing requests efficiently. View pending,
                                processing, and mailed checks, batch print requests, and track mailing
                                status in one place.
                        </Typography>

                        <Box sx={styles.tabContainer}>
                                <Tabs
                                        tabsData={[
                                                {
                                                        title: 'All',
                                                        titleNode: (
                                                                <Typography color="#777777" className="fs-6 m-0 tab-all">
                                                                        All{' '}
                                                                        <Typography fontSize={'12px'} as="span">
                                                                                ({totals.all})
                                                                        </Typography>
                                                                </Typography>
                                                        ),
                                                        component: <AllCheckMailList />
                                                },
                                                {
                                                        title: 'Submitted',
                                                        titleNode: (
                                                                <Typography
                                                                        color={'#058205'}
                                                                        className="fs-6 m-0 tab-submitted"
                                                                >
                                                                        Submitted{' '}
                                                                        <Typography fontSize={'12px'} as="span">
                                                                                ({totals.submitted})
                                                                        </Typography>
                                                                </Typography>
                                                        ),
                                                        component: <AllCheckMailList search={'Submitted'} />
                                                },
                                                {
                                                        title: 'Processing',
                                                        titleNode: (
                                                                <Typography color={'#EF6C00'} className="fs-6 m-0 ">
                                                                        Processing{' '}
                                                                        <Typography fontSize={'12px'} as="span">
                                                                                ({totals.processing})
                                                                        </Typography>
                                                                </Typography>
                                                        ),
                                                        component: <AllCheckMailList search={'Processing'} />
                                                },
                                                {
                                                        title: 'Errors',
                                                        titleNode: (
                                                                <Typography color={'#F03D3E'} className="fs-6 m-0 ">
                                                                        Errors
                                                                        <Typography fontSize={'12px'} as="span">
                                                                                ({totals.error})
                                                                        </Typography>
                                                                </Typography>
                                                        ),
                                                        component: <AllCheckMailList search={'Error'} />
                                                },
                                                {
                                                        title: 'Mailed',
                                                        titleNode: (
                                                                <Typography color={'#1e3a5f'} className="fs-6 m-0 ">
                                                                        Mailed
                                                                        <Typography fontSize={'12px'} as="span">
                                                                                ({totals.mailed})
                                                                        </Typography>
                                                                </Typography>
                                                        ),
                                                        component: <AllCheckMailList search={'Mailed'} />
                                                },
                                                {
                                                        title: 'Canceled',
                                                        titleNode: (
                                                                <Typography color={'#F03D3E'} className="fs-6 m-0 ">
                                                                        Canceled{' '}
                                                                        <Typography fontSize={'12px'} as="span">
                                                                                ({totals.canceled})
                                                                        </Typography>
                                                                </Typography>
                                                        ),
                                                        component: <AllCheckMailList search={'Canceled'} />
                                                },
                                                {
                                                        title: 'Batches',
                                                        titleNode: (
                                                                <Typography color={'#EF6C99'} className="fs-6 m-0 ">
                                                                        Batches
                                                                        <Typography fontSize={'12px'} as="span">
                                                                                ({totals.totalBatches})
                                                                        </Typography>
                                                                </Typography>
                                                        ),
                                                        component: <ProcessingBatchList />
                                                },
                                                {
                                                        title: 'LOB & Carriers',
                                                        titleNode: (
                                                                <Typography color={'#5B3D1E'} className="fs-6 m-0 ">
                                                                        LOB & Carriers
                                                                </Typography>
                                                        ),
                                                        component: <ShipmentsAdminList />
                                                }
                                        ]}
                                />
                        </Box>
                </Box>
        )
}

export default MailManagement
