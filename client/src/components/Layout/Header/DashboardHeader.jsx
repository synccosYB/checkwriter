import MuiAppBar from '@mui/material/AppBar'
import {
        Box,
        Button,
        Divider,
        MenuItem,
        Select,
        Toolbar,
        Tooltip,
        IconButton,
        Typography
} from '@mui/material'
import useCheckUserScubscriptions from '../../../API/users/useCheckUserScubscriptions'
import { styled, useTheme } from '@mui/material/styles'
import { HelpOutlineOutlined } from '@mui/icons-material'
import MenuIcon from '@mui/icons-material/Menu'
import { useHistory } from 'react-router'
import { useDispatch, useSelector } from 'react-redux'
import ButtonComponent from '../../shared/ButtonComponent'
import AddButton from './AddButton'
import CompanyLogo from './CompanyLogo'
import ProfilePopover from './ProfilePopover'
import { checkWriterLogo1, onlyLogo } from '../../../assets/svg'
import {
        fetchGroups,
        fetchTags
} from '../../../utils/helper'
import { updateSelectedOrganization } from '../../../redux/appData'
import { CardMembership } from '@mui/icons-material'
import useOrganizations from '../../../API/users/organizations/useOrganizations'
import useUserInfo from '../../../API/users/useUserInfo'
import { MyCookies } from '../../../utils/cookies/Cookies'

const DashboardHeader = ({ open, setOpen, mt, isMobile }) => {
        const selectedOrganization = useSelector(
                (state) => state.appData.selectedOrganization
        )
        const dispatch = useDispatch()
        let history = useHistory()
        const { data: userData } = useUserInfo()
        const theme = useTheme()

        const { data: organizationData } = useOrganizations()

        const userFirstName = userData?.firstName
        const userLastName = userData?.lastName

        const drawerWidth = 240

        const changeCompany = (data) => {
                MyCookies.set(MyCookies.KEYS.ORGANIZATION, data?._id)
                dispatch(updateSelectedOrganization(data?._id))

                applicationRefresh()
        }

        const applicationRefresh = () => {
                fetchTags(dispatch)
                fetchGroups(dispatch)
        }

        const AppBar = styled(MuiAppBar, {
                shouldForwardProp: (prop) => prop !== 'open'
        })(({ theme, open }) => ({
                transition: theme.transitions.create(['width', 'margin'], {
                        easing: theme.transitions.easing.sharp,
                        duration: theme.transitions.duration.leavingScreen
                }),
                ...(open && {
                        marginLeft: drawerWidth,
                        width: `calc(100% - ${drawerWidth}px)`,
                        transition: theme.transitions.create(['width', 'margin'], {
                                easing: theme.transitions.easing.sharp,
                                duration: theme.transitions.duration.enteringScreen
                        })
                })
        }))

        const orgSelectStyles = {
                '&.MuiOutlinedInput-root': {
                        borderRadius: '10px',
                        minWidth: '180px',
                        '& fieldset.MuiOutlinedInput-notchedOutline': {
                                borderColor: theme.palette.divider,
                        },
                        '&:hover fieldset.MuiOutlinedInput-notchedOutline': {
                                borderColor: '#bcc3ce',
                        },
                },
                '& .MuiSelect-select': {
                        padding: '7px 12px',
                        fontSize: '0.875rem',
                        fontWeight: 500,
                        color: theme.palette.text.primary,
                }
        }

        const orgMenuProps = {
                PaperProps: {
                        sx: {
                                borderRadius: '12px',
                                boxShadow: '0px 8px 16px rgba(0,0,0,0.06), 0px 4px 8px rgba(0,0,0,0.04)',
                                border: `1px solid ${theme.palette.divider}`,
                                mt: 1,
                        }
                },
                sx: {
                        '& .MuiMenuItem-root': {
                                fontSize: '0.875rem',
                                borderRadius: '6px',
                                mx: 0.5,
                                '&.Mui-selected': {
                                        backgroundColor: `${theme.palette.primary.main}10`,
                                },
                                '&:hover': {
                                        backgroundColor: '#f0f2f5',
                                }
                        }
                }
        }

        return (
                <AppBar
                        key={selectedOrganization}
                        position="fixed"
                        open={open}
                        elevation={0}
                        sx={{
                                marginTop: mt || 0,
                                background: '#fff',
                                boxShadow: 'none',
                                borderBottom: `1px solid ${theme.palette.divider}`,
                                zIndex: isMobile ? 1199 : 10,
                                width: '100%'
                        }}
                >
                        {isMobile ? (
                                <Toolbar
                                        sx={{
                                                display: 'flex',
                                                alignItems: 'center',
                                                flexDirection: 'column',
                                                '&.MuiToolbar-root': {
                                                        minHeight: 'auto',
                                                        padding: '0px'
                                                }
                                        }}
                                >
                                        <UserInfoSection
                                                userId={userData?._id}
                                                userFirstName={userFirstName}
                                                userLastName={userLastName}
                                                userEmail={userData?.email}
                                                isMobile={isMobile}
                                        />
                                        <Box
                                                sx={{
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        justifyContent: 'space-between',
                                                        width: '100%',
                                                        my: 1,
                                                        px: 1,
                                                }}
                                        >
                                                <div className="sidebar-logo d-flex align-items-center flex-row">
                                                        {checkWriterLogo1}
                                                        <div className="sidebar-logo1">{onlyLogo}</div>
                                                </div>
                                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                                                        <AddButton />
                                                        <Tooltip
                                                                title={
                                                                        <span>
                                                                                Please contact at{' '}
                                                                                <a
                                                                                        href="mailto:support@synccos.com"
                                                                                        target="blank"
                                                                                        rel="no-referrer"
                                                                                        style={{ color: '#fff', fontWeight: 600 }}
                                                                                >
                                                                                        support@synccos.com
                                                                                </a>{' '}
                                                                                for queries and support
                                                                        </span>
                                                                }
                                                        >
                                                                <HelpOutlineOutlined
                                                                        sx={{
                                                                                color: theme.palette.text.secondary,
                                                                                fontSize: '22px',
                                                                                '&:hover': { cursor: 'pointer', color: theme.palette.primary.main }
                                                                        }}
                                                                />
                                                        </Tooltip>
                                                        <IconButton
                                                                aria-label="open drawer"
                                                                onClick={() => setOpen(!open)}
                                                                sx={{
                                                                        color: theme.palette.text.primary,
                                                                        width: 36,
                                                                        height: 36,
                                                                }}
                                                        >
                                                                <MenuIcon />
                                                        </IconButton>
                                                </Box>
                                        </Box>

                                        <Box
                                                sx={{
                                                        display: 'flex',
                                                        justifyContent: 'space-between',
                                                        width: '100%',
                                                        alignItems: 'center',
                                                        px: 2.5,
                                                        pb: 1,
                                                }}
                                        >
                                                <Typography
                                                        sx={{
                                                                color: theme.palette.text.primary,
                                                                fontSize: '1.125rem',
                                                                fontWeight: 600,
                                                        }}
                                                >
                                                        Welcome <br /> {userData?.firstName} {userData?.lastName}!
                                                </Typography>

                                                {!organizationData?.length ? (
                                                        <ButtonComponent
                                                                text="Create Organization"
                                                                variant="light"
                                                                click={() => {
                                                                        history.push('/dashboard/create-organization')
                                                                }}
                                                                style={{ height: '32px' }}
                                                                extraClass="black-button glassmorph-btn"
                                                        />
                                                ) : (
                                                        <Select
                                                                defaultValue={
                                                                        MyCookies.get(MyCookies.KEYS.ORGANIZATION) ?? userFirstName
                                                                }
                                                                sx={{
                                                                        ...orgSelectStyles,
                                                                        height: '32px',
                                                                }}
                                                                MenuProps={orgMenuProps}
                                                        >
                                                                <Typography
                                                                        variant="overline"
                                                                        sx={{ px: 2, pt: 1, display: 'block', color: theme.palette.text.disabled }}
                                                                >
                                                                        Organizations
                                                                </Typography>
                                                                {!!organizationData?.length ? (
                                                                        organizationData?.map((data, index) => {
                                                                                return (
                                                                                        <MenuItem
                                                                                                key={index}
                                                                                                value={data?._id}
                                                                                                onClick={() => {
                                                                                                        changeCompany(data)
                                                                                                }}
                                                                                        >
                                                                                                {data?.organizationName}
                                                                                        </MenuItem>
                                                                                )
                                                                        })
                                                                ) : (
                                                                        <MenuItem disabled>No organizations</MenuItem>
                                                                )}
                                                                <Divider sx={{ borderColor: theme.palette.divider }} />
                                                                <Typography
                                                                        variant="overline"
                                                                        sx={{ px: 2, display: 'block', color: theme.palette.text.disabled }}
                                                                >
                                                                        Personal Account
                                                                </Typography>
                                                                <MenuItem
                                                                        value={`${userFirstName}`}
                                                                        onClick={() => {
                                                                                MyCookies.remove(MyCookies.KEYS.ORGANIZATION)
                                                                                dispatch(updateSelectedOrganization(null))
                                                                                applicationRefresh()
                                                                        }}
                                                                >
                                                                        {userData?.firstName} {userData?.lastName}
                                                                </MenuItem>
                                                                <Divider sx={{ borderColor: theme.palette.divider }} />
                                                                <MenuItem
                                                                        onClick={() => {
                                                                                history.push('/dashboard/manage-organizations')
                                                                        }}
                                                                        sx={{
                                                                                color: theme.palette.primary.main,
                                                                                fontWeight: 600,
                                                                        }}
                                                                >
                                                                        Manage Organizations
                                                                </MenuItem>
                                                        </Select>
                                                )}
                                        </Box>
                                </Toolbar>
                        ) : (
                                <Toolbar
                                        sx={{
                                                display: 'flex',
                                                justifyContent: 'space-between',
                                                alignItems: 'center',
                                                '&.MuiToolbar-root': {
                                                        minHeight: '56px',
                                                        px: 3,
                                                }
                                        }}
                                >
                                        <Typography
                                                sx={{
                                                        color: theme.palette.text.primary,
                                                        marginLeft: '15.5rem',
                                                        fontSize: '1rem',
                                                        fontWeight: 600,
                                                }}
                                        >
                                                Welcome {userData?.firstName} {userData?.lastName}!
                                        </Typography>

                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                                                <AddButton />
                                                <Tooltip
                                                        title={
                                                                <span>
                                                                        Please contact at{' '}
                                                                        <a
                                                                                href="mailto:support@synccos.com"
                                                                                target="blank"
                                                                                rel="no-referrer"
                                                                                style={{ color: '#fff', fontWeight: 600 }}
                                                                        >
                                                                                support@synccos.com
                                                                        </a>{' '}
                                                                        for queries and support
                                                                </span>
                                                        }
                                                >
                                                        <HelpOutlineOutlined
                                                                sx={{
                                                                        color: theme.palette.text.secondary,
                                                                        fontSize: '22px',
                                                                        '&:hover': { cursor: 'pointer', color: theme.palette.primary.main }
                                                                }}
                                                        />
                                                </Tooltip>

                                                <Box
                                                        sx={{
                                                                height: '28px',
                                                                width: '1px',
                                                                backgroundColor: theme.palette.divider,
                                                                mx: 0.5,
                                                        }}
                                                />

                                                {!organizationData?.length ? (
                                                        <ButtonComponent
                                                                text="Create Organization"
                                                                variant="light"
                                                                click={() => {
                                                                        history.push('/dashboard/create-organization')
                                                                }}
                                                                extraClass="black-button glassmorph-btn"
                                                        />
                                                ) : (
                                                        <Select
                                                                defaultValue={
                                                                        MyCookies.get(MyCookies.KEYS.ORGANIZATION) ?? userFirstName
                                                                }
                                                                sx={{
                                                                        ...orgSelectStyles,
                                                                        '&.MuiOutlinedInput-root': {
                                                                                ...orgSelectStyles['&.MuiOutlinedInput-root'],
                                                                                margin: '0',
                                                                        }
                                                                }}
                                                                MenuProps={orgMenuProps}
                                                        >
                                                                <Typography
                                                                        variant="overline"
                                                                        sx={{ px: 2, pt: 1, display: 'block', color: theme.palette.text.disabled }}
                                                                >
                                                                        Organizations
                                                                </Typography>
                                                                {!!organizationData?.length ? (
                                                                        organizationData?.map((data, index) => {
                                                                                return (
                                                                                        <MenuItem
                                                                                                key={index}
                                                                                                value={data?._id}
                                                                                                onClick={() => {
                                                                                                        changeCompany(data)
                                                                                                }}
                                                                                        >
                                                                                                {data?.organizationName}
                                                                                        </MenuItem>
                                                                                )
                                                                        })
                                                                ) : (
                                                                        <MenuItem disabled>No organzations</MenuItem>
                                                                )}
                                                                <Divider sx={{ borderColor: theme.palette.divider }} />
                                                                <Typography
                                                                        variant="overline"
                                                                        sx={{ px: 2, display: 'block', color: theme.palette.text.disabled }}
                                                                >
                                                                        Personal Account
                                                                </Typography>
                                                                <MenuItem
                                                                        value={`${userFirstName}`}
                                                                        onClick={() => {
                                                                                MyCookies.remove(MyCookies.KEYS.ORGANIZATION)
                                                                                dispatch(updateSelectedOrganization(null))
                                                                                applicationRefresh()
                                                                        }}
                                                                >
                                                                        {userData?.firstName} {userData?.lastName}
                                                                </MenuItem>
                                                                <Divider sx={{ borderColor: theme.palette.divider }} />
                                                                <MenuItem
                                                                        onClick={() => {
                                                                                history.push('/dashboard/manage-organizations')
                                                                        }}
                                                                        sx={{
                                                                                color: theme.palette.primary.main,
                                                                                fontWeight: 600,
                                                                        }}
                                                                >
                                                                        Manage Organizations
                                                                </MenuItem>
                                                        </Select>
                                                )}

                                                <Box
                                                        sx={{
                                                                height: '28px',
                                                                width: '1px',
                                                                backgroundColor: theme.palette.divider,
                                                                mx: 0.5,
                                                        }}
                                                />

                                                <CompanyLogo />

                                                <UserInfoSection
                                                        userId={userData?._id}
                                                        userFirstName={userFirstName}
                                                        userLastName={userLastName}
                                                        userEmail={userData?.email}
                                                        isMobile={isMobile}
                                                />
                                        </Box>
                                </Toolbar>
                        )}
                </AppBar>
        )
}

export default DashboardHeader

const UserInfoSection = ({
        userId,
        userFirstName,
        userLastName,
        userEmail,
        isMobile
}) => {
        const history = useHistory()
        const {
                data: subscription,
                isLoading,
                isPending
        } = useCheckUserScubscriptions()
        const isTrial = subscription?.isTrialPeriod
        const isSubscribed = subscription?.isSubscribed
        const isScheduledToCancel = subscription?.isScheduledToCancel

        const buttonTitle = subscription?.subscriptionStatusText

        const getButtonStyles = () => {
                if (isTrial) {
                        return { backgroundColor: '#FFF3E0', color: '#E65100', border: '1px solid #FFE0B2' }
                }
                if (isSubscribed && !isScheduledToCancel) {
                        return { backgroundColor: '#E8F5E9', color: '#2E7D32', border: '1px solid #C8E6C9' }
                }
                if (isScheduledToCancel) {
                        return { backgroundColor: '#FFF8E1', color: '#F57F17', border: '1px solid #FFF3C4' }
                }
                return { backgroundColor: '#FFEBEE', color: '#C62828', border: '1px solid #FFCDD2' }
        }

        const conditionalStyles = {
                visibility: isLoading || isPending ? 'hidden' : 'visible',
                ...getButtonStyles()
        }

        const handleManageSubscription = () => {
                history.push('/dashboard/subscription-management')
        }

        return (
                <Box
                        sx={
                                isMobile
                                        ? {
                                                        width: '100%'
                                          }
                                        : {
                                                        display: 'flex',
                                                        gap: 1.5,
                                                        alignItems: 'center',
                                          }
                        }
                >
                        <Button
                                sx={
                                        isMobile
                                                ? {
                                                                textTransform: 'none',
                                                                ...conditionalStyles,
                                                                width: '100%',
                                                                borderRadius: '10px !important',
                                                                fontSize: '0.8125rem',
                                                                fontWeight: 600,
                                                  }
                                                : {
                                                                ...conditionalStyles,
                                                                borderRadius: '20px !important',
                                                                textTransform: 'none',
                                                                fontSize: '0.8125rem',
                                                                fontWeight: 600,
                                                                px: 2,
                                                  }
                                }
                                onClick={handleManageSubscription}
                        >
                                <CardMembership
                                        sx={{
                                                fontSize: '14px',
                                                marginRight: '5px'
                                        }}
                                />
                                {buttonTitle}
                        </Button>
                        {!isMobile && (
                                <ProfilePopover
                                        userFirstName={userFirstName}
                                        userLastName={userLastName}
                                        userEmail={userEmail}
                                        onManageSubscription={handleManageSubscription}
                                />
                        )}
                </Box>
        )
}
