import { useEffect, useRef, useState } from 'react'
import { stripeLogo } from '../../assets/svg/IntegrationsSvg'
import { Box, CircularProgress, Icon, Alert, Tooltip, TextField, Typography } from '@mui/material'
import { deleteQuickBookAccount } from '../../API/IntegrationsAPI'
import { updateSnackbar } from '../../redux/snackbarState'
import { useSelector, useDispatch } from 'react-redux'
import { CheckCircle, WarningAmber } from '@mui/icons-material'
import ButtonComponent from '../../components/shared/ButtonComponent'
import quickbook from '../../assets/images/quickbook.png'
import MailOutlineIcon from '@mui/icons-material/MailOutline'

import useUserInfo from '../../API/users/useUserInfo'
import ComingSoonContainer from '../../components/shared/comingSoonContainer'
import useStripeAccount from '../../API/integrations/useStripeAccount'
import useIntegrateToStripe from '../../API/integrations/useIntegrateToStripe'
import useDeleteStripeAccount from '../../API/integrations/useDeleteStripeAccount'
import useQueryParams from '../../utils/hooks/useQueryParams'
import { GeneratingCheckIcon } from '../../components/Icons'
import { CustomDialog } from '../../components/shared/dialog/CustomDialog'
import useAuthorizeStripeoAuth from '../../API/integrations/useAuthorizeStripeoAuth'
import { QUICKBOOK_BASE_URL } from '../../API/quickbook/quickbookClient'
import useUserQuickbook from '../../API/quickbook/useUserQuickbook'
import useRemoveUserQuickbook from '../../API/quickbook/useRemoveUserQuickbook'
import { useDemoRestriction } from '../../hooks/useDemoRestriction'
import DemoRestrictionModal from '../../components/shared/DemoRestrictionModal'
import useGetLobStatus from '../../API/shipping/useGetLobStatus'
import useConfigureLob from '../../API/shipping/useConfigureLob'

const Payments = () => {
        const { queryParams, removeAllQueryParams } = useQueryParams()
        const shouldDisplayModal = !!queryParams.size

        const { mutate: authorizeStripeOauth } = useAuthorizeStripeoAuth()
        const { data: userQuickbookData } = useUserQuickbook()
        const { mutate: removeUserQuickbook } = useRemoveUserQuickbook()
        const dispatch = useDispatch()
        const { data: userData } = useUserInfo()

        const enableQbo = JSON.parse(
                process.env.REACT_APP_ENABLE_QBO_INTEGRATION || false
        )

        const selectedOrganization = useSelector(
                (state) => state.appData.selectedOrganization
        )

        const { guardAction, isModalOpen, closeDemoPopup } = useDemoRestriction()

        const { data: lobStatusData, isLoading: isLobStatusLoading } = useGetLobStatus()
        const lobStatus = lobStatusData?.data

        const { mutate: configureLob, isPending: isConfiguringLob } = useConfigureLob()
        const [lobConfigOpen, setLobConfigOpen] = useState(false)
        const [lobApiKey, setLobApiKey] = useState('')
        const [lobWebhookSecret, setLobWebhookSecret] = useState('')
        const [lobConfigError, setLobConfigError] = useState('')

        const handleSaveLobConfig = () => {
                setLobConfigError('')
                if (!lobApiKey.trim() && !lobWebhookSecret.trim()) {
                        setLobConfigError('Enter at least one value to save.')
                        return
                }
                configureLob(
                        {
                                ...(lobApiKey.trim() && { apiKey: lobApiKey.trim() }),
                                ...(lobWebhookSecret.trim() && { webhookSecret: lobWebhookSecret.trim() }),
                        },
                        {
                                onSuccess: () => {
                                        setLobConfigOpen(false)
                                        setLobApiKey('')
                                        setLobWebhookSecret('')
                                        dispatch(updateSnackbar({ open: true, message: 'LOB configuration saved.', severity: 'success' }))
                                },
                                onError: (err) => {
                                        setLobConfigError(err?.response?.data?.error || 'Failed to save LOB configuration.')
                                },
                        }
                )
        }

        const [isLoading, setLoading] = useState(false)

        const [quickAccount, setQuickAccount] = useState(false)

        const { data } = useStripeAccount()

        const haveAccount = !!data?.userAccount

        const { mutate: integrateToStripe, isPending: isIntegrating } =
                useIntegrateToStripe()
        const { mutate: deleteStripeAccount, isPending: isDeleting } =
                useDeleteStripeAccount()

        const isStripeLoading = isIntegrating || isDeleting

        const integrateStripe = () => {
                integrateToStripe({
                        ownerId: selectedOrganization ? selectedOrganization : userData?._id
                })
        }

        const hasRun = useRef(false)

        useEffect(() => {
                if (shouldDisplayModal && !hasRun.current) {
                        const code = queryParams.get('code')
                        const state = queryParams.get('state')

                        if (code && state) {
                                authorizeStripeOauth({ code, state })
                        } else {
                                removeAllQueryParams()
                        }

                        hasRun.current = true
                }
        }, [
                shouldDisplayModal,
                authorizeStripeOauth,
                removeAllQueryParams,
                queryParams
        ])

        const deleteQuick = async () => {
                let body = {}
                if (selectedOrganization && selectedOrganization !== null) {
                        body.userId = selectedOrganization
                } else {
                        body.userId = userData?._id // Assuming userId is available in the scope
                }
                try {
                        const res = await deleteQuickBookAccount(body)
                        if (res?.data.message === 'Account details deleted successfully') {
                                setQuickAccount(false)
                                dispatch(
                                        updateSnackbar({
                                                open: true,
                                                message: 'Account Removed Successfully',
                                                severity: 'warning'
                                        })
                                )
                        }
                } catch (error) {
                        dispatch(
                                updateSnackbar({
                                        open: true,
                                        message: 'Failed to remove QuickBooks account.',
                                        severity: 'error'
                                })
                        )
                }
        }

        const deleteAccount = async () => {
                deleteStripeAccount({ email: userData?.email })
        }

        // Model Code is here
        const [isAddPayeeModalOpen, setAddPayeeModalOpen] = useState(false)

        const openAddPayee = () => {
                setAddPayeeModalOpen(true)
        }

        const closeAddPayee = async () => {
                setAddPayeeModalOpen(false)
        }

        const handleConnectQuickbook = () => {
                if (enableQbo && !userQuickbookData?.isActive) {
                        window.location.href = `${QUICKBOOK_BASE_URL}/auth`
                } else {
                        removeUserQuickbook()
                }
        }

        return (
                <div className="">
                        {isLoading ? (
                                <div
                                        className="d-flex align-items-center justify-content-center"
                                        style={{
                                                height: '500px'
                                        }}
                                >
                                        <CircularProgress color="success" />
                                </div>
                        ) : (
                                <>
                                        <div className="row">
                                                <div className="col-4 ">
                                                        <div className=" position-relative integration-div p-3 shadow p-3 mb-5 bg-body rounded">
                                                                <span
                                                                        class="material-icons notranslate MuiIcon-root MuiIcon-fontSizeMedium position-absolute d-flex css-1ddj3s7"
                                                                        aria-hidden="true"
                                                                ></span>
                                                                <Icon
                                                                        className="position-absolute d-flex"
                                                                        sx={{
                                                                                fontSize: '1rem',
                                                                                color: '#1e3a5f',
                                                                                top: '10px',
                                                                                right: '10px'
                                                                        }}
                                                                >
                                                                        {haveAccount ? (
                                                                                <CheckCircle
                                                                                        sx={{
                                                                                                fontSize: 'inherit'
                                                                                        }}
                                                                                />
                                                                        ) : null}
                                                                </Icon>
                                                                <div className="d-flex align-items-center justify-content-start">
                                                                        <div className="logo" style={{ width: '10px' }}>
                                                                                {stripeLogo}
                                                                        </div>
                                                                </div>
                                                                <p className="fs-14 mb-3">
                                                                        Stripe is a payment processing platform that lets your
                                                                        business safely and effectively accept online and credit card
                                                                        payments.
                                                                </p>
                                                                <ButtonComponent
                                                                        text={haveAccount ? 'Remove' : 'Add'}
                                                                        variant="dark"
                                                                        extraClass="px-2 py-1 mt-2"
                                                                        onClick={() =>
                                                                                guardAction(() => {
                                                                                        if (haveAccount) {
                                                                                                deleteAccount()
                                                                                        } else {
                                                                                                integrateStripe()
                                                                                        }
                                                                                })
                                                                        }
                                                                />
                                                        </div>
                                                </div>

                                                <div className="col-4">
                                                        <div className="position-relative integration-div p-3 shadow p-3 mb-5 bg-body rounded">
                                                                <Icon
                                                                        className="position-absolute d-flex"
                                                                        sx={{
                                                                                fontSize: '1rem',
                                                                                top: '10px',
                                                                                right: '10px',
                                                                                color: lobStatus?.configured ? 'green' : 'orange'
                                                                        }}
                                                                >
                                                                        {isLobStatusLoading ? null : lobStatus?.configured ? (
                                                                                <Tooltip title={lobStatus.message}>
                                                                                        <CheckCircle sx={{ fontSize: 'inherit' }} />
                                                                                </Tooltip>
                                                                        ) : (
                                                                                <Tooltip title={lobStatus?.message || 'Not configured'}>
                                                                                        <WarningAmber sx={{ fontSize: 'inherit' }} />
                                                                                </Tooltip>
                                                                        )}
                                                                </Icon>
                                                                <div className="d-flex align-items-center justify-content-start mb-2">
                                                                        <MailOutlineIcon sx={{ fontSize: 28, color: '#1976d2', mr: 1 }} />
                                                                        <span className="fw-semibold fs-6">LOB Mail</span>
                                                                </div>
                                                                <p className="fs-14 mb-3">
                                                                        LOB sends physical checks via USPS on your behalf. Requires <code>LOB_API_KEY</code> and <code>LOB_WEBHOOK_SECRET</code> to be set as environment secrets.
                                                                </p>
                                                                {!isLobStatusLoading && lobStatus && !lobStatus.configured && (
                                                                        <Alert severity="warning" sx={{ fontSize: 12, mb: 1, py: 0 }}>
                                                                                {lobStatus.message}
                                                                        </Alert>
                                                                )}
                                                                {!isLobStatusLoading && lobStatus && !lobStatus.webhookSecretPresent && lobStatus.configured && (
                                                                        <Alert severity="info" sx={{ fontSize: 12, mb: 1, py: 0 }}>
                                                                                Set <code>LOB_WEBHOOK_SECRET</code> to receive delivery status updates.
                                                                        </Alert>
                                                                )}
                                                                <div className="d-flex align-items-center justify-content-between mt-2">
                                                                        <span class={`badge ${lobStatus?.configured ? 'bg-success' : 'bg-warning text-dark'}`}>
                                                                                {isLobStatusLoading ? 'Checking...' : lobStatus?.configured ? 'Active' : 'Not Configured'}
                                                                        </span>
                                                                        {userData?.role === 'superadmin' && (
                                                                                <ButtonComponent
                                                                                        text="Configure"
                                                                                        variant="dark"
                                                                                        extraClass="px-2 py-1"
                                                                                        onClick={() => setLobConfigOpen(true)}
                                                                                />
                                                                        )}
                                                                </div>
                                                        </div>
                                                </div>

                                                <div className="col-4 ">
                                                        <ComingSoonContainer enable={enableQbo}>
                                                                <div
                                                                        class=" position-relative integration-div p-3 shadow p-3 mb-5 bg-body rounded"
                                                                        style={{ minHeight: '80%', filter: 'grayscale(100%)' }}
                                                                >
                                                                        <span
                                                                                class="material-icons notranslate MuiIcon-root MuiIcon-fontSizeMedium position-absolute d-flex css-1ddj3s7"
                                                                                aria-hidden="true"
                                                                        ></span>
                                                                        <Icon
                                                                                className="position-absolute d-flex"
                                                                                sx={{
                                                                                        fontSize: '1rem',
                                                                                        color: '#1e3a5f',
                                                                                        top: '10px',
                                                                                        right: '10px'
                                                                                }}
                                                                        >
                                                                                {userQuickbookData?.isActive ? (
                                                                                        <CheckCircle
                                                                                                sx={{
                                                                                                        fontSize: 'inherit'
                                                                                                }}
                                                                                        />
                                                                                ) : null}
                                                                        </Icon>
                                                                        <div className="d-flex align-items-center justify-content-start">
                                                                                <img
                                                                                        class="logo"
                                                                                        style={{ width: '42%' }}
                                                                                        src={quickbook}
                                                                                        alt=""
                                                                                        loading="lazy" // Add this attribute for lazy loading
                                                                                />
                                                                        </div>
                                                                        <p className="fs-14 mb-3">
                                                                                Quickbooks is Online accounting software that gives you
                                                                                peace of mind
                                                                        </p>
                                                                        <ButtonComponent
                                                                                text={
                                                                                        !userQuickbookData || !userQuickbookData.isActive
                                                                                                ? 'Add'
                                                                                                : 'Remove'
                                                                                }
                                                                                variant="dark"
                                                                                extraClass="px-2 py-1 mt-2"
                                                                                onClick={() => guardAction(handleConnectQuickbook)}
                                                                                icon={isStripeLoading && <CircularProgress size={'8px'} />}
                                                                        />
                                                                </div>
                                                        </ComingSoonContainer>
                                                </div>
                                        </div>
                                </>
                        )}
                        {shouldDisplayModal && (
                                <CustomDialog
                                        open={shouldDisplayModal}
                                        onClose={() => {}}
                                        content={
                                                <Box display={'flex'} justifyContent={'center'}>
                                                        <GeneratingCheckIcon />
                                                </Box>
                                        }
                                />
                        )}
                        <DemoRestrictionModal open={isModalOpen} onClose={closeDemoPopup} />

                        <CustomDialog
                                open={lobConfigOpen}
                                onClose={() => { setLobConfigOpen(false); setLobConfigError('') }}
                                title="Configure LOB Mailing"
                                maxWidth="sm"
                                fullWidth
                                modalIcon={<MailOutlineIcon fontSize="large" color="primary" />}
                                content={
                                        <Box>
                                                <Typography variant="body2" color="text.secondary" mb={2}>
                                                        Enter your LOB credentials to enable physical check mailing via USPS. Leave a field blank to keep the current value.
                                                </Typography>
                                                <TextField
                                                        fullWidth
                                                        size="small"
                                                        label="LOB API Key"
                                                        placeholder="live_..."
                                                        type="password"
                                                        value={lobApiKey}
                                                        onChange={(e) => setLobApiKey(e.target.value)}
                                                        sx={{ mb: 2 }}
                                                        helperText="Found in your LOB dashboard under Settings → API Keys"
                                                />
                                                <TextField
                                                        fullWidth
                                                        size="small"
                                                        label="LOB Webhook Secret"
                                                        placeholder="..."
                                                        type="password"
                                                        value={lobWebhookSecret}
                                                        onChange={(e) => setLobWebhookSecret(e.target.value)}
                                                        helperText="Found in your LOB dashboard under Settings → Webhooks → Signing Secret"
                                                />
                                                {lobConfigError && (
                                                        <Alert severity="error" sx={{ mt: 2 }}>
                                                                {lobConfigError}
                                                        </Alert>
                                                )}
                                        </Box>
                                }
                                actions={
                                        <Box display="flex" gap={1} justifyContent="flex-end" width="100%">
                                                <ButtonComponent
                                                        text="Cancel"
                                                        variant="outlined"
                                                        extraClass="px-3"
                                                        onClick={() => { setLobConfigOpen(false); setLobConfigError('') }}
                                                        disabled={isConfiguringLob}
                                                />
                                                <ButtonComponent
                                                        text={isConfiguringLob ? 'Saving...' : 'Save Configuration'}
                                                        variant="dark"
                                                        extraClass="px-3"
                                                        onClick={handleSaveLobConfig}
                                                        disabled={isConfiguringLob}
                                                />
                                        </Box>
                                }
                        />
                </div>
        )
}

export default Payments
