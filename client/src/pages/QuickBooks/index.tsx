import React, { useEffect, useMemo, useState } from 'react'
import { Box, CircularProgress, Divider, Typography } from '@mui/material'
import { styles } from './styles'
import { CustomButton } from '../../components/buttons/CustomButton'
import { useLocation, useHistory } from 'react-router-dom'
import {
        ConnectQuickbooksIcon,
        DisconnectQuickbooksIcon
} from '../../components/Icons'
import CustomTabs from '../../components/tabs'
import { Mapping } from './components/Mapping'
import { DisconnectAlert } from './components/modals/DisconnectAlert'
import useUserQuickbook from '../../API/quickbook/useUserQuickbook'
import { QUICKBOOK_BASE_URL } from '../../API/quickbook/quickbookClient'
import useRemoveUserQuickbook from '../../API/quickbook/useRemoveUserQuickbook'
import useQuickbookMapping from '../../API/quickbook/useQuickbookMapping'
import { useDispatch } from 'react-redux'
import { updateSnackbar } from '../../redux/snackbarState'
import useGetQuickbookPayee from '../../API/quickbook/useGetQuickbookPayee'
import useGetQuickbookBank from '../../API/quickbook/useGetQuickbookBank'
import useQuickbookCallback from '../../API/quickbook/useQuickbookCallback'

const QuickBooks: React.FC = () => {
        const dispatch = useDispatch()
        const [activeTab, setActiveTab] = useState<number>(0)
        const [openDisconnectAlert, setOpenDisconnectAlert] = useState(false)
        const { data: userQuickbookData, refetch } = useUserQuickbook()
        const { mutate: removeUserQuickbook } = useRemoveUserQuickbook()
        const [callback, setCallback] = useState(false);
        const [payeeSearch, setPayeeSearch] = useState('')
        const [bankSearch, setBankSearch] = useState('')

        const [payeePage, setPayeePage] = useState(0)
        const [bankPage, setBankPage] = useState(0)

        const { data: mappedPayeeData } = useGetQuickbookPayee({
                page: payeePage,
                pageSize: 5,
                search: payeeSearch,
                mappedProfile: activeTab === 1
        })
        const { data: mappedBankData } = useGetQuickbookBank({
                page: bankPage,
                pageSize: 5,
                search: bankSearch,
                mappedProfile: activeTab === 1
        })

        const isConnected = userQuickbookData?.isActive
        const location = useLocation()
        const history = useHistory()
        const { mutate, isPending: quickbookCallbackLoading } = useQuickbookCallback()

        const handleDisconnect = () => {
                removeUserQuickbook()
                setOpenDisconnectAlert(false)
        }

        const cbKey = useMemo(() => {
    const qp = new URLSearchParams(location.search);
    const code = qp.get('code');
    return code ? `qbo_cb_${code}` : null;
  }, [location.search]);

  useEffect(() => {
    if (!cbKey) return;

    if (sessionStorage.getItem(cbKey)) return;

    sessionStorage.setItem(cbKey, '1');

    mutate(location.search, {
      onSuccess: () => {
        dispatch(updateSnackbar({
          open: true, severity: 'success', message: 'QuickBooks added successfully'
        }));
        refetch();
      },
      onSettled: () => {
        const qp = new URLSearchParams(location.search);
        qp.delete('code'); qp.delete('state'); qp.delete('realmId');
        history.replace({ search: qp.toString() });
      },
    });
  }, [cbKey, location.search, mutate, dispatch, history, refetch]);

        const handleConnect = () => {
                if (
                        process.env?.REACT_APP_ENABLE_QBO_INTEGRATION &&
                        !userQuickbookData?.isActive
                ) {
                        window.location.href = `${QUICKBOOK_BASE_URL}/auth`
                }
        }

        const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
                setActiveTab(newValue)
        }

        const handleSearch = (type: string, value: string) => {
                if (type === 'bank') {
                        setBankSearch(value)
                } else {
                        setPayeeSearch(value)
                }
        }

        const handlePageChange = (type: string, value: number) => {
                if (type === 'bank') {
                        setBankPage(value)
                } else {
                        setPayeePage(value)
                }
        }

        return (
                <Box sx={styles.wrapper}>
                        <Typography sx={styles.title}>Connect to QuickBooks Online</Typography>

                        <Typography
                                variant="body1"
                                color="text.secondary"
                                sx={styles.description}
                        >
                                Easily sync your payees and bank accounts from QuickBooks with just a
                                few clicks.
                        </Typography>

                        <Divider sx={{ my: '24px' }} />

                        <Box sx={styles.card}>
                                <Box sx={styles.logoAndCheckmark}>
                                        <Box sx={styles.logo}>
                                                <img
                                                        src="/img/quickbooks_logo.png"
                                                        alt="QuickBooks"
                                                        style={{ height: '100%' }}
                                                />
                                        </Box>
                                        <div>
                                                {quickbookCallbackLoading && (
                                                        <CircularProgress
                                                                color="success"
                                                                sx={{
                                                                        width: '12px !important',
                                                                        height: '12px !important',
                                                                        marginRight: '8px'
                                                                }}
                                                        />
                                                )}
                                                {isConnected ? (
                                                        <ConnectQuickbooksIcon />
                                                ) : (
                                                        <DisconnectQuickbooksIcon />
                                                )}
                                        </div>
                                </Box>
                                <Box sx={styles.cardContent}>
                                        <Typography
                                                variant="body1"
                                                color="text.secondary"
                                                sx={styles.cardContentText}
                                        >
                                                {isConnected
                                                        ? 'Your QuickBooks account is linked. You can now manage payee and bank account mappings.'
                                                        : 'Simplify your workflow: Create checks in QuickBooks, print them with Check Writer.'}
                                        </Typography>

                                        <CustomButton
                                                variant="contained"
                                                color="primary"
                                                onClick={() =>
                                                        isConnected ? setOpenDisconnectAlert(true) : handleConnect()
                                                }
                                        >
                                                {isConnected ? 'Disconnect' : 'Connect'}
                                        </CustomButton>
                                </Box>
                        </Box>
                        {isConnected && (
                                <>
                                        <CustomTabs
                                                tabs={[{ label: 'Unmapped' }, { label: 'Mapped' }]}
                                                activeTab={activeTab}
                                                handleTabChange={handleTabChange}
                                                styles={styles.tabs}
                                                tabStyles={styles.tab}
                                        />

                                        <Box>
                                                {activeTab === 0 ? (
                                                        <Box sx={styles.mappingContainer}>
                                                                <Mapping
                                                                        type="unmapped"
                                                                        mapType="payee"
                                                                        PayeeData={mappedPayeeData?.data}
                                                                        handleSearch={handleSearch}
                                                                        meta={mappedPayeeData?.meta}
                                                                        handlePage={handlePageChange}
                                                                />
                                                                <Mapping
                                                                        type="unmapped"
                                                                        mapType="bank"
                                                                        bankData={mappedBankData?.data}
                                                                        handleSearch={handleSearch}
                                                                        meta={mappedBankData?.meta}
                                                                        handlePage={handlePageChange}
                                                                />
                                                        </Box>
                                                ) : (
                                                        <Box sx={styles.mappingContainer}>
                                                                <Mapping
                                                                        type="mapped"
                                                                        mapType="payee"
                                                                        PayeeData={mappedPayeeData?.data}
                                                                        handleSearch={handleSearch}
                                                                        meta={mappedPayeeData?.meta}
                                                                        handlePage={handlePageChange}
                                                                />
                                                                <Mapping
                                                                        type="mapped"
                                                                        mapType="bank"
                                                                        bankData={mappedBankData?.data}
                                                                        handleSearch={handleSearch}
                                                                        meta={mappedBankData?.meta}
                                                                        handlePage={handlePageChange}
                                                                />
                                                        </Box>
                                                )}
                                        </Box>
                                </>
                        )}
                        <DisconnectAlert
                                open={openDisconnectAlert}
                                onClose={() => setOpenDisconnectAlert(false)}
                                onConfirm={handleDisconnect}
                        />
                </Box>
        )
}

export default QuickBooks
