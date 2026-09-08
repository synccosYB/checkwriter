import { ArrowForwardIosOutlined } from '@mui/icons-material'
import { Box, Typography } from '@mui/material'
import GenericTable from '../../shared/GenericTable/GenericTable'

import CheckStatusPopover from '../../shared/Popovers/CheckStatusPopover'
import { useHistory } from 'react-router-dom/cjs/react-router-dom.min'
import useChecks from '../../../API/checks/useChecks'
import { styles } from './styles'
import { formatUSD } from '../../../utils/helper'

const RecentChecks = () => {
        const history = useHistory()
        const { data, isLoading } = useChecks({ pageSize: 5, page: 0 })

        const checks = data?.data || []

        const columnData = [
                {
                        key: 'Check No.',
                        value: 'checkNumber',
                        colWidth: '10%',
                        align: 'center'
                },
                {
                        key: 'Payee Name',
                        value: 'payeeName',
                        colWidth: '10%',
                        align: 'center'
                },
                {
                        key: 'Status',
                        type: 'html',
                        value: 'status',
                        colWidth: '10%',
                        align: 'center'
                },
                {
                        key: 'Amount',
                        value: 'amount',
                        colWidth: '10%',
                        align: 'center'
                }
        ]

        const makeTableData = (data) => {
                const temp = []

                data.slice(0, 7).forEach((item) => {
                        let obj = {}
                        obj.payeeName = item?.payee?.name
                        obj.checkNumber = item.checkNumber
                        obj.status = {
                                value: item.status,
                                html: (
                                        <CheckStatusPopover
                                                checkStatus={item?.status}
                                                checkId={item?._id}
                                                freezeStatus={true}
                                        />
                                )
                        }

                        if (item.isBlankCheck && !item.amount) obj.amount = ''
                        else {
                                obj.amount = item?.amount !== null ? formatUSD(item.amount) : '$0.00'
                        }

                        obj._id = item._id
                        temp.push(obj)
                })

                return temp
        }

        return (
                <Box sx={styles.container}>
                        <Box sx={styles.header}>
                                <Typography sx={styles.title}>Recent Checks</Typography>

                                <Box
                                        sx={styles.viewAll}
                                        onClick={() => {
                                                history.push('/dashboard/my-checks')
                                        }}
                                >
                                        <Typography>
                                                View All <ArrowForwardIosOutlined fontSize="10px" />
                                        </Typography>
                                </Box>
                        </Box>
                        <Box sx={styles.tableContainer}>
                                <GenericTable
                                        columnData={columnData}
                                        modifiedData={makeTableData(checks || [])}
                                        paginationOff={true}
                                        isLoading={isLoading}
                                        noDataProps={{
                                                btnText: 'Add Check',
                                                click: () => history.push('/dashboard/my-checks?create=true')
                                        }}
                                        height="352px"
                                />
                        </Box>
                </Box>
        )
}

export default RecentChecks
