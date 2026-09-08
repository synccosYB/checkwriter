import React from 'react'
import {
  Box,
  Grid,
  Avatar,
  Divider,
  Stack,
  Typography,
  useTheme,
  IconButton
} from '@mui/material'
import OpenInNewRoundedIcon from '@mui/icons-material/OpenInNewRounded'
import CheckRoundedIcon from '@mui/icons-material/CheckRounded'
import DeleteOutlineRoundedIcon from '@mui/icons-material/DeleteOutlineRounded'
import {
  PageContainer,
  CardBox,
  CardHeaderRow,
  Badge,
  PriceRow,
  Label,
  ValueMuted,
  MutedText,
  PMIconWrap,
  ConfirmationModalDesc
} from './styles'
import { CustomButton } from '../../components/buttons/CustomButton'
import {
  setPostSetupAction,
  consumePostSetupAction,
  clearPostSetupAction
} from './lib'

import useCheckUserScubscriptions from '../../API/users/useCheckUserScubscriptions'
import ConfirmationModal from '../../components/shared/Modals/ConfirmationModal'
import {
  CancelIcon,
  ConfirmSubscription,
  ReactiveSubscription,
  TrialIcon
} from '../../components/Icons'
import { getSubscriptionStatusColor } from '../UserManagement'
import { getPaymentMethodIcon } from '../../utils/helper'

import useCancelSubscription from '../../API/stripe/useCancelSubscription'
import useReactivateSubscription from '../../API/stripe/useReactivateSubscription'
import useSubscribeNow from '../../API/stripe/useSubscribeNow'

import moment from 'moment'
import useListPaymentMethods from '../../API/users/useListPaymentMethods'
import {
  useCreateSetupSession,
  useCreateSubscriptionViaApi,
  useDeletePaymentMethod,
  useFinalizeSetupSession,
  useSetDefaultPaymentMethod,
  useVerifyTrialDollar
} from '../../API/stripe/endpoints'
import { useDispatch } from 'react-redux'
import { updateSnackbar } from '../../redux/snackbarState'
import { useHistory } from 'react-router-dom'
import LoadingModal from '../../components/shared/Modals/LoadingModal'
import { GeneratingCheckIcon, PDFIcon } from '../../components/Icons'
import { formatUSD } from '../../utils/helper'


const fmtUnixDate = (unix) =>
  typeof unix === 'number' ? moment.unix(unix).format('MMM DD, YYYY') : '—'

const pickRenewalUnix = (s) => {
  if (!s) return null
  if (s.nextBillingAt) return s.nextBillingAt
  if (s.currentPeriodEnd) return s.currentPeriodEnd
  if (s.renewalAt) return s.renewalAt
  if (s.isSubscribed && s.cancelAt) return s.cancelAt
  return null
}

const next30DayDate = () => moment().add(30, 'days').format('MM/DD/YYYY')

const getCtaText = (mode, trialDays) => {
  switch (mode) {
    case 'trial':
      return 'Skip Trial and Subscribe Now'
    case 'subscribed':
      return 'Cancel Subscription'
    case 'scheduleToCancel':
      return 'Reactivate Subscription'
    case 'trial_expired':
    case 'canceled':
      return 'Subscribe Now'
    case 'no_subscription':
    default:
      return `Start ${trialDays}-Day Free Trial`
  }
}

const getStatusMemoNode = (
  mode,
  { trialEndsAt, cancelAt, isScheduledToCancel }
) => {
  if (mode === 'trial') {
    if (isScheduledToCancel) {
      return (
        <MutedText>
          Your <strong>trial</strong> is scheduled to cancel on{' '}
          <span style={{ color: '#1e3a5f' }}>
            {fmtUnixDate(cancelAt || trialEndsAt)}
          </span>
          .
        </MutedText>
      )
    }
    return (
      <MutedText>
        Your <strong>trial</strong> ends on{' '}
        <span style={{ color: '#1e3a5f' }}>{fmtUnixDate(trialEndsAt)}</span>.
      </MutedText>
    )
  }
  if (mode === 'scheduleToCancel') {
    return (
      <MutedText>
        Your subscription will cancel on{' '}
        <span style={{ color: '#1e3a5f' }}>{fmtUnixDate(cancelAt)}</span>.
      </MutedText>
    )
  }
  return null
}

/** Helper to parse URL param once (for finalize setup) */
const getQueryParam = (name) => {
  const params = new URLSearchParams(window.location.search)
  return params.get(name)
}

export default function SubscriptionManagement() {
  const theme = useTheme()
  const dispatch = useDispatch()
  const history = useHistory()
  const { data: subscriptionData, refetch: refetchSub } =
    useCheckUserScubscriptions()

  // Payment method list (attached to customer)
  const {
    data: pmListData,
    refetch: refetchPms,
    isFetching: loadingPms
  } = useListPaymentMethods()

  const hasStripeCustomer = !!pmListData?.hasStripeCustomer
  const paymentMethods = Array.isArray(pmListData?.paymentMethods)
    ? pmListData.paymentMethods
    : []
  const defaultPm = paymentMethods.find((pm) => pm.isDefault) || null

  // Mutations
  const { mutate: cancelAtPeriodEnd, isPending: canceling } =
    useCancelSubscription()
  const { mutate: reactivate, isPending: reactivating } =
    useReactivateSubscription()
  const { mutate: subscribeNow, isPending: subscribingNow } = useSubscribeNow()

  const { mutate: createSetupSession, isPending: creatingSetup } =
    useCreateSetupSession()
  const { mutate: finalizeSetup, isPending: finalizingSetup } =
    useFinalizeSetupSession()

  const { mutate: setDefaultPm, isPending: settingDefault } =
    useSetDefaultPaymentMethod()
  const { mutate: deletePm, isPending: deletingPm } = useDeletePaymentMethod()

  const { mutate: verifyTrialDollar, isPending: verifyingDollar } =
    useVerifyTrialDollar()
  const { mutate: createSubscriptionViaApi, isPending: creatingSub } =
    useCreateSubscriptionViaApi()

  const mode = subscriptionData?.subscriptionMode
  const statusColor = getSubscriptionStatusColor(
    subscriptionData?.subscriptionStatusText || '—',
    theme
  )

  const renewalUnix = React.useMemo(
    () => pickRenewalUnix(subscriptionData),
    [subscriptionData]
  )

  // ----- Effects: finalize setup & consume post action -----
  React.useEffect(() => {
    const sessionId = getQueryParam('setup_session_id')
    if (!sessionId) return

    // strip param
    const url = new URL(window.location.href)
    url.searchParams.delete('setup_session_id')
    window.history.replaceState({}, '', url.toString())

    finalizeSetup(
      { sessionId, setAsDefault: true },
      {
        onSuccess: (res) => {
          const post = consumePostSetupAction() // clears it atomically
          const newPmId = res?.paymentMethod?.id || defaultPm?.id || null

          if (post?.action === 'subscribe-now') {
            // Skip trial - redirect to thank you page
            closeModal()
            setFlowLoading('subscription')
            subscribeNow(undefined, {
              onSuccess: () => afterSuccess('subscription'),
              onError: () => setFlowLoading(null)
            })
            return
          }

          if (post?.action === 'create-paid-sub') {
            if (!newPmId) {
              refetchPms()
              return
            }
            closeModal()
            setFlowLoading('subscription')
            createSubscriptionViaApi(
              { paymentMethodId: newPmId },
              {
                onSuccess: () => afterSuccess('subscription'),
                onError: () => setFlowLoading(null)
              }
            )
            return
          }

          if (post?.action === 'start-trial') {
            if (!newPmId) {
              refetchPms()
              return
            }
            closeModal()
            setFlowLoading('trial')
            // Verify $1 auth-only, then create trial
            verifyTrialDollar(
              { paymentMethodId: newPmId },
              {
                onSuccess: () => {
                  createSubscriptionViaApi(
                    { paymentMethodId: newPmId, trialMode: true },
                    {
                      onSuccess: () => afterSuccess('trial'),
                      onError: () => setFlowLoading(null)
                    }
                  )
                },
                onError: () => {
                  setFlowLoading(null)
                  dispatch(
                    updateSnackbar({
                      open: true,
                      severity: 'error',
                      message:
                        'Card verification failed. Please check your payment method.'
                    })
                  )
                }
              }
            )
            return
          }

          // Normal add-card flow (no auto action)
          refetchPms()
        },
        onError: () => {
          clearPostSetupAction() // safety
        }
      }
    )

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [finalizeSetup, refetchPms])

  // If user canceled setup — clean the post action
  React.useEffect(() => {
    const canceled = getQueryParam('setup_canceled')
    if (!canceled) return
    const url = new URL(window.location.href)
    url.searchParams.delete('setup_canceled')
    window.history.replaceState({}, '', url.toString())
    clearPostSetupAction()
  }, [])

  // Extra safety: clear on unmount
  React.useEffect(() => {
    return () => {
      clearPostSetupAction()
    }
  }, [])

  // UI state
  const [modal, setModal] = React.useState('none') // 'none' | 'cancel' | 'trial' | 'confirm' | 'reactivate' | 'cancelTrial'
  const [flowLoading, setFlowLoading] = React.useState(null) // 'trial' | 'subscription' | null
  const closeModal = () => setModal('none')

  const openPrimaryActionModal = () => {
    switch (mode) {
      case 'subscribed':
        return setModal('cancel')
      case 'scheduleToCancel':
        return setModal('reactivate')
      case 'trial':
        return setModal('confirm') // skip trial → paid (subscribeNow)
      case 'no_subscription':
        return setModal('trial') // start trial via API ($1 verify)
      case 'trial_expired':
      case 'canceled':
      default:
        return setModal('confirm') // fresh paid start via API
    }
  }

  const afterSuccess = (nextMode) => {
    if (nextMode) {
      // Only redirect for new trial or new subscription
      setFlowLoading(null)
      closeModal()
      const thankYouPath =
        nextMode === 'trial' ? '/thank-you/trial' : '/thank-you/subscription'
      history.push(thankYouPath)
      return
    }
    setFlowLoading(null)
    closeModal()
    refetchSub()
    refetchPms()
  }

  // Handler for cancel/reactivate operations (no redirect, no loader)
  const afterCancelSuccess = () => {
    closeModal()
    refetchSub()
    refetchPms()
  }

  // ----- Payment method actions -----
  const openAddCard = () => {
    const returnUrl = window.location.href.split('?')[0]
    createSetupSession(
      { returnUrl },
      {
        onSuccess: (data) => {
          window.location.replace(data?.url)
        }
      }
    )
  }

  const handleSetDefault = (paymentMethodId) => {
    setDefaultPm({ paymentMethodId }, { onSuccess: afterSuccess })
  }

  const handleDeletePm = (paymentMethodId) => {
    deletePm({ paymentMethodId }, { onSuccess: afterSuccess })
  }

  // ----- Subscription actions -----
  const handleCancelSubscription = () =>
    cancelAtPeriodEnd(undefined, { onSuccess: afterCancelSuccess })

  const handleReactivate = () =>
    reactivate(undefined, { onSuccess: afterCancelSuccess })

  // API-first trial start: $1 auth hold, then create sub with trialDays from backend config
  const handleStartTrial = () => {
    if (mode !== 'no_subscription') return

    if (!defaultPm) {
      // No card yet → collect card first, then auto-run trial flow after return
      setPostSetupAction('start-trial')
      openAddCard()
      return
    }

    closeModal()
    setFlowLoading('trial')
    // Card exists → verify $1 auth-only, then create trial subscription
    verifyTrialDollar(
      { paymentMethodId: defaultPm.id },
      {
        onSuccess: () => {
          createSubscriptionViaApi(
            { paymentMethodId: defaultPm.id, trialMode: true },
            {
              onSuccess: () => {
                afterSuccess('trial')
              },
              onError: () => {
                setFlowLoading(null)
              }
            }
          )
        },
        onError: () => {
          setFlowLoading(null)
          dispatch(
            updateSnackbar({
              open: true,
              severity: 'error',
              message:
                'Card verification failed. Please check your payment method.'
            })
          )
        }
      }
    )
  }

  // Paid flows
  const handleSubscribeNow = () => {
    if (mode === 'trial') {
      // Skip trial - redirect to thank you page
      if (!defaultPm) {
        setPostSetupAction('subscribe-now')
        openAddCard()
        return
      }
      closeModal()
      setFlowLoading('subscription')
      subscribeNow(undefined, {
        onSuccess: () => {
          afterSuccess('subscription')
        },
        onError: () => {
          setFlowLoading(null)
        }
      })
    } else {
      // New subscription - redirect to thank you page
      if (!defaultPm) {
        setPostSetupAction('create-paid-sub')
        openAddCard()
        return
      }
      closeModal()
      setFlowLoading('subscription')
      createSubscriptionViaApi(
        { paymentMethodId: defaultPm.id },
        {
          onSuccess: () => {
            afterSuccess('subscription')
          },
          onError: () => {
            setFlowLoading(null)
          }
        }
      )
    }
  }

  // Trial cancellation flow
  const openCancelTrialConfirm = () => setModal('cancelTrial')
  const handleCancelTrialConfirmed = () =>
    cancelAtPeriodEnd(undefined, { onSuccess: afterCancelSuccess })

  const headerCtaText = getCtaText(mode, subscriptionData?.trialDays)
  const busy =
    canceling ||
    reactivating ||
    subscribingNow ||
    creatingSub ||
    verifyingDollar ||
    flowLoading !== null

  const trialCancelScheduled =
    mode === 'trial' && subscriptionData?.isScheduledToCancel

  return (
    <PageContainer>
      {/* Header */}
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          borderBottom: '1px solid #e2e8f0',
          pb: '12px',
          flexWrap: 'wrap',
          rowGap: '8px'
        }}
      >
        <Box>
          <Typography variant="h2" fontWeight={500} fontSize={30}>
            Subscription Management
          </Typography>
          <MutedText>
            Manage your current plan, payment methods, and billing preferences.
          </MutedText>
        </Box>

        <Box display="flex" alignItems="center" gap={1}>
          {mode === 'trial' && (
            <>
              {/* If trial is not yet set to cancel → show Cancel Trial (with confirmation) */}
              {!trialCancelScheduled && (
                <CustomButton
                  variant="text"
                  color="primary"
                  onClick={openCancelTrialConfirm}
                  disabled={canceling || !hasStripeCustomer || !defaultPm}
                  sx={{ ml: 2 }}
                >
                  {canceling ? 'Canceling…' : 'Cancel Trial'}
                </CustomButton>
              )}
              {/* If trial is scheduled to cancel → show Keep Trial */}
              {trialCancelScheduled && (
                <CustomButton
                  variant="text"
                  color="primary"
                  onClick={handleReactivate} // clears cancel_at_period_end
                  disabled={reactivating || !hasStripeCustomer || !defaultPm}
                  sx={{ ml: 2 }}
                >
                  {reactivating ? 'Keeping…' : 'Keep Trial'}
                </CustomButton>
              )}
            </>
          )}
          <CustomButton
            variant="outlined"
            color="primary"
            onClick={openPrimaryActionModal}
            sx={{ alignSelf: 'end' }}
            disabled={busy}
          >
            {headerCtaText}
          </CustomButton>
        </Box>
      </Box>

      <LoadingModal
        open={!!flowLoading || finalizingSetup}
        icon={<GeneratingCheckIcon />}
        overlayIcon={
          flowLoading === 'trial' ? (
            <ConfirmSubscription />
          ) : flowLoading === 'subscription' ? (
            <ConfirmSubscription />
          ) : (
            <ConfirmSubscription />
          )
        }
        title={
          finalizingSetup && !flowLoading
            ? 'Processing Payment Method...'
            : flowLoading === 'trial'
              ? 'Starting Your Trial...'
              : flowLoading === 'subscription'
                ? 'Activating Your Subscription...'
                : 'Processing...'
        }
        description={
          finalizingSetup && !flowLoading
            ? 'Please wait while we process your payment method.'
            : flowLoading === 'trial'
              ? 'Please wait while we start your trial. This may take a few seconds.'
              : flowLoading === 'subscription'
                ? 'Please wait while we activate your subscription. This may take a few seconds.'
                : 'Please wait...'
        }
      />

      {/* Status bar */}
      <CardBox
        sx={{ mb: 3, p: 2, mt: 4, boxShadow: '0px 8px 12px -4px #0A0D120F' }}
      >
        <Grid
          container
          alignItems="center"
          spacing={2}
          justifyContent="space-between"
        >
          <Grid item>
            <Typography fontWeight={600} fontSize={20}>
              Subscription Status
            </Typography>
            {getStatusMemoNode(mode, {
              trialEndsAt: subscriptionData?.trialEndsAt,
              cancelAt: subscriptionData?.cancelAt,
              isScheduledToCancel: subscriptionData?.isScheduledToCancel
            })}
          </Grid>
          <Grid item>
            <CustomButton
              size="small"
              sx={{
                width: 200,
                color: statusColor,
                backgroundColor: `${statusColor}0D`,
                border: `1px solid ${statusColor}`,
                '&:hover': {
                  backgroundColor: `${statusColor}1A`,
                  border: `1px solid ${statusColor}`
                },
                maxWidth: 'fit-content'
              }}
            >
              {subscriptionData?.subscriptionStatusText || '—'}
            </CustomButton>
          </Grid>
        </Grid>
      </CardBox>

      <Grid container spacing={3}>
        {/* Plan Details */}
        <Grid item xs={12} md={6}>
          <CardBox
            sx={{ minHeight: '235px' }}
            display="flex"
            flexDirection="column"
            justifyContent="space-between"
          >
            <CardHeaderRow>
              <Typography fontWeight={600} fontSize={26}>
                Plan Details
              </Typography>
              <Badge>Pro Plan</Badge>
            </CardHeaderRow>

            <Box sx={{ mt: 2 }}>
              <Label fontSize={18} fontWeight={500} color="#00000099">
                Plan Price
              </Label>
              <PriceRow>
                <Typography
                  variant="h3"
                  fontWeight={600}
                  fontSize={40}
                  color="#1e3a5f"
                  lineHeight={1}
                >
                  {typeof subscriptionData?.price === 'number' ? formatUSD(subscriptionData.price) : '—'}
                </Typography>
                <Typography
                  sx={{ alignSelf: 'flex-end', pb: 0.5 }}
                  color="#00000099"
                  fontSize={16}
                  fontWeight={600}
                >
                  /month
                </Typography>
              </PriceRow>
            </Box>

            {mode === 'subscribed' && (
              <>
                <Divider sx={{ my: 2 }} />
                <Stack direction="row" spacing={1} alignItems="center">
                  <Label fontSize={20} fontWeight={600} color="#000">
                    Next Renewal Date:
                  </Label>
                  <ValueMuted color="#00000099" fontSize={20} fontWeight={600}>
                    {fmtUnixDate(renewalUnix)}
                  </ValueMuted>
                </Stack>
              </>
            )}
          </CardBox>
        </Grid>

        {/* Payment Methods */}
        <Grid item xs={12} md={6}>
          <CardBox
            sx={{ minHeight: '235px' }}
            display="flex"
            flexDirection="column"
            justifyContent="space-between"
          >
            <CardHeaderRow>
              <Typography fontWeight={600} fontSize={26}>
                Payment Methods
              </Typography>
            </CardHeaderRow>

            {/* Primary/default method (or empty state) */}
            {paymentMethods.length > 0 ? (
              <Stack spacing={2} sx={{ mt: 2 }}>
                {paymentMethods.map((pm) => {
                  const isDefault = !!pm.isDefault
                  return (
                    <Stack
                      key={pm.id}
                      direction="row"
                      alignItems="center"
                      spacing={2}
                      sx={{
                        mt: 0,
                        p: 1,
                        border: '1px solid #e2e8f0',
                        borderRadius: 2
                      }}
                    >
                      <PMIconWrap>
                        <Avatar variant="rounded">
                          {getPaymentMethodIcon(pm?.brand) ? (
                            <img
                              src={getPaymentMethodIcon(pm.brand)}
                              alt={pm?.brand || 'card'}
                            />
                          ) : (
                            <OpenInNewRoundedIcon />
                          )}
                        </Avatar>
                      </PMIconWrap>

                      <Box sx={{ flex: 1, minWidth: 0 }}>
                        <Typography fontWeight={600} fontSize={18} color="#000">
                          {(pm?.brand || 'Card').replace(/^./, (c) =>
                            c.toUpperCase()
                          )}{' '}
                          ending in {pm?.last4 || '—'}{' '}
                          {isDefault ? '· Default' : ''}
                        </Typography>
                        <Typography
                          fontSize={14}
                          color="#00000099"
                          fontWeight={400}
                        >
                          <Box component="span" sx={{ mr: 1.5 }}>
                            •••• •••• •••• {pm?.last4 || '—'}
                          </Box>
                          • Exp: {pm?.exp_month || '—'}/{pm?.exp_year || '—'}
                        </Typography>
                      </Box>

                      {/* Manage: Set default / Delete */}
                      {!isDefault && (
                        <IconButton
                          size="small"
                          title="Set as default"
                          onClick={() => handleSetDefault(pm.id)}
                          disabled={settingDefault}
                        >
                          <CheckRoundedIcon fontSize="small" />
                        </IconButton>
                      )}
                      <IconButton
                        size="small"
                        title="Delete"
                        onClick={() => handleDeletePm(pm.id)}
                        disabled={
                          deletingPm ||
                          (isDefault &&
                            (mode === 'subscribed' ||
                              mode === 'trial' ||
                              mode === 'scheduleToCancel'))
                        }
                      >
                        <DeleteOutlineRoundedIcon fontSize="small" />
                      </IconButton>
                    </Stack>
                  )
                })}
              </Stack>
            ) : (
              <Typography sx={{ mt: 2 }} color="#00000099">
                No saved payment methods.
              </Typography>
            )}

            <Box sx={{ mt: 3, display: 'flex', gap: 1 }}>
              <CustomButton
                variant="outlined"
                color="primary"
                onClick={openAddCard}
                disabled={creatingSetup || finalizingSetup}
              >
                <Box display={'flex'} columnGap={1}>
                  {creatingSetup || finalizingSetup
                    ? 'Opening…'
                    : paymentMethods.length
                      ? 'Add Card'
                      : 'Add a Card to Continue'}
                  <OpenInNewRoundedIcon fontSize="small" />
                </Box>
              </CustomButton>
            </Box>
          </CardBox>
        </Grid>
      </Grid>

      {/* Modals */}
      {modal === 'cancel' && (
        <ConfirmationModal
          open
          onClose={closeModal}
          onConfirm={handleCancelSubscription}
          title="Confirm Cancellation"
          description={
            <ConfirmationModalDesc mb={2}>
              Are you sure you want to cancel your subscription?
              <br /> You’ll keep access until{' '}
              <span style={{ color: '#1e3a5f' }}>
                {fmtUnixDate(renewalUnix)}
              </span>
              , after which your subscription will end.
            </ConfirmationModalDesc>
          }
          icon={<CancelIcon />}
          confirmLabel={canceling ? 'Canceling…' : 'Cancel Subscription'}
        />
      )}

      {modal === 'trial' && (
        <ConfirmationModal
          open
          onClose={closeModal}
          onConfirm={handleStartTrial}
          title="Start Free Trial"
          description={
            <ConfirmationModalDesc mb={2}>
              Start your free{' '}
              <span style={{ color: '#1e3a5f' }}>
                {subscriptionData?.trialDays}-day
              </span>{' '}
              trial now?
              <br />
              We’ll place a temporary $1 authorization hold and immediately void
              it.
              <br />
              You’ll have full access until {next30DayDate()}, after which you
              can choose to subscribe.
            </ConfirmationModalDesc>
          }
          icon={<TrialIcon />}
          confirmLabel={
            flowLoading === 'trial' || verifyingDollar || creatingSub
              ? 'Starting…'
              : 'Start Trial'
          }
        />
      )}

      {modal === 'cancelTrial' && (
        <ConfirmationModal
          open
          onClose={closeModal}
          onConfirm={handleCancelTrialConfirmed}
          title="Cancel Trial?"
          description={
            <ConfirmationModalDesc mb={2}>
              Your trial will remain active until it ends, but we’ll schedule it
              to cancel and not convert to a paid plan.
              <br />
              You can choose “Keep Trial” anytime before it ends.
            </ConfirmationModalDesc>
          }
          icon={<CancelIcon />}
          confirmLabel={canceling ? 'Scheduling…' : 'Cancel Trial'}
        />
      )}

      {modal === 'confirm' && (
        <ConfirmationModal
          open
          onClose={closeModal}
          onConfirm={handleSubscribeNow}
          title={mode === 'trial' ? 'Confirm Subscription' : 'Subscribe'}
          description={
            <ConfirmationModalDesc mb={2}>
              {mode === 'trial' ? (
                <>
                  Subscribe now for{' '}
                  <span style={{ color: '#1e3a5f' }}>
                    {typeof subscriptionData?.price === 'number' ? formatUSD(subscriptionData.price) : '—'}
                  </span>
                  /month?
                  <br />
                  Your trial will end immediately and billing starts today.
                </>
              ) : (
                <>
                  Subscribe now for{' '}
                  <span style={{ color: '#1e3a5f' }}>
                    {typeof subscriptionData?.price === 'number' ? formatUSD(subscriptionData.price) : '—'}
                  </span>
                  /month?
                </>
              )}
              <br />
              Your next billing date will be {next30DayDate()}.
            </ConfirmationModalDesc>
          }
          icon={<ConfirmSubscription />}
          confirmLabel={
            flowLoading === 'subscription' || subscribingNow || creatingSub
              ? 'Processing…'
              : mode === 'trial'
                ? 'Subscribe Now'
                : 'Subscribe'
          }
        />
      )}

      {modal === 'reactivate' && (
        <ConfirmationModal
          open
          onClose={closeModal}
          onConfirm={handleReactivate}
          title="Reactivate Subscription"
          description={
            <ConfirmationModalDesc mb={2}>
              Prevent cancellation and keep your subscription active?
            </ConfirmationModalDesc>
          }
          icon={<ReactiveSubscription />}
          confirmLabel={reactivating ? 'Reactivating…' : 'Reactivate'}
        />
      )}
    </PageContainer>
  )
}
