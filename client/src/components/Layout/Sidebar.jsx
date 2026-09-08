import { useState } from 'react'
import {
        List,
        ListItem,
        ListItemButton,
        ListItemText,
        Icon,
        Divider,
        IconButton,
        useTheme,
        SwipeableDrawer,
        Box,
        Typography,
        Badge
} from '@mui/material'
import MuiDrawer from '@mui/material/Drawer'
import { styled } from '@mui/material/styles'
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft'
import LocalOfferOutlinedIcon from '@mui/icons-material/LocalOfferOutlined'
import {
        AccountBalanceOutlined,
        AddCircleOutline,
        ChevronRight,
        ErrorOutline,
        FormatListBulletedOutlined,
        LocalShippingOutlined,
        PaidOutlined,
        Payment,
        ReceiptLong,
        PeopleAltOutlined,
        DashboardOutlined,
        DescriptionOutlined,
        BusinessOutlined,
        SettingsOutlined,
        HistoryOutlined,
        IntegrationInstructionsOutlined,
        AttachFileOutlined,
        ReceiptOutlined,
        CurrencyExchangeOutlined
} from '@mui/icons-material'
import { checkIcon, checkWriterLogo1, onlyLogo } from '../../assets/svg'
import { useHistory, useLocation } from 'react-router'

import { useDispatch } from 'react-redux'
import { logOut } from '../../redux/loginLogout'
import { emptyAppData } from '../../redux/appData'
import FormModalMUI from '../shared/Modals/FormModalMUI'
import ButtonComponent from '../shared/ButtonComponent'
import { MyCookies } from '../../utils/cookies/Cookies'
import useUserInfo from '../../API/users/useUserInfo'
import ProfilePopover from './Header/ProfilePopover'
import useGenerateStripePortalLink from '../../API/stripe/useGenerateStripePortalLink'
import useCheckUserScubscriptions from '../../API/users/useCheckUserScubscriptions'
import { QuickbooksSidebarIcon } from '../Icons'
import useGetQuickbookPayee from '../../API/quickbook/useGetQuickbookPayee'
import useGetQuickbookBank from '../../API/quickbook/useGetQuickbookBank'

const DISABLE_PAYMENT_LINKS = JSON.parse(
        process.env.REACT_APP_DISABLE_PAYMENT_LINKS || false
)

const Sidebar = ({ open, setOpen, mt, isMobile }) => {
        const history = useHistory()
        const location = useLocation()
        const dispatch = useDispatch()
        const { data } = useUserInfo()
        const isAdmin = data?.role === 'superadmin'
        const [logoutModal, setLogoutModal] = useState(false)
        const theme = useTheme()
        const { data: subscription } = useCheckUserScubscriptions()
        const { mutate: getStripeUrl } = useGenerateStripePortalLink()

        const { data: unmappedPayee } = useGetQuickbookPayee({
                mappedProfile: false,
                limit: 1000
        })

        const { data: unmappedBank } = useGetQuickbookBank({
                mappedProfile: false,
                limit: 1000
        })

        const isTrial = subscription?.isTrialPeriod
        const isSubscribed = subscription?.isSubscribed

        const userFirstName = data?.firstName
        const userLastName = data?.lastName
        const userEmail = data?.email
        const userId = data?._id

        const drawerWidth = 240

        const unMappedCount =
                (unmappedPayee?.data?.length || 0) + (unmappedBank?.data?.length || 0)

        const enableQbo = JSON.parse(
                process.env.REACT_APP_ENABLE_QBO_INTEGRATION || false
        )

        const openedMixin = (theme) => ({
                width: drawerWidth,
                transition: theme.transitions.create('width', {
                        easing: theme.transitions.easing.sharp,
                        duration: theme.transitions.duration.enteringScreen
                }),
                overflowX: 'hidden'
        })

        const closedMixin = (theme) => ({
                transition: theme.transitions.create('width', {
                        easing: theme.transitions.easing.sharp,
                        duration: theme.transitions.duration.leavingScreen
                }),
                overflowX: 'hidden',
                width: `calc(${theme.spacing(7)} + 1px)`,
                [theme.breakpoints.up('sm')]: {
                        width: `calc(${theme.spacing(8)} + 1px)`
                }
        })

        const Drawer = styled(MuiDrawer, {
                shouldForwardProp: (prop) => prop !== 'open'
        })(({ theme, open }) => {
                return {
                        width: drawerWidth,
                        flexShrink: 0,
                        whiteSpace: 'nowrap',
                        boxSizing: 'border-box',

                        ...(open && {
                                ...openedMixin(theme),
                                '& .MuiDrawer-paper': {
                                        ...openedMixin(theme),
                                        backgroundColor: '#ffffff',
                                        borderRight: 'none',
                                        boxShadow: '1px 0 6px rgba(0,0,0,0.04)',
                                }
                        }),
                        ...(!open && {
                                ...closedMixin(theme),
                                '& .MuiDrawer-paper': {
                                        ...closedMixin(theme),
                                        backgroundColor: '#ffffff',
                                        borderRight: 'none',
                                        boxShadow: '1px 0 6px rgba(0,0,0,0.04)',
                                }
                        })
                }
        })

        const DrawerHeader = styled('div')(({ theme }) => ({
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'flex-end',
                padding: theme.spacing(0, 1),
                ...theme.mixins.toolbar
        }))

        const logout = () => {
                dispatch(logOut())
                dispatch(emptyAppData())
                MyCookies.removeAll()
                window.sessionStorage.removeItem('user-memory')
                history.push('/auth/login')
        }

        const handleManageSubscription = () => {
                if (!isSubscribed || isTrial) {
                        history.push('/dashboard/subscription-management')
                } else {
                        getStripeUrl(
                                { userId },
                                {
                                        onSuccess: (data) => {
                                                window.location.replace(data?.url)
                                        }
                                }
                        )
                }
        }

        const sidebarList = [
                {
                        icon: <DashboardOutlined />,
                        title: 'Dashboard',
                        path: '/dashboard/main'
                },
                {
                        icon: <AddCircleOutline />,
                        title: 'Create check',
                        path: '/dashboard/my-checks?create=true'
                },
                {
                        icon: checkIcon,
                        title: 'My checks',
                        path: '/dashboard/my-checks'
                },

                {
                        icon: <FormatListBulletedOutlined />,
                        title: 'Payee List',
                        path: '/dashboard/payees'
                },
                {
                        icon: <AccountBalanceOutlined />,
                        title: 'Bank Accounts',
                        path: '/dashboard/bank-accounts'
                },
                {
                        icon: <LocalOfferOutlinedIcon />,
                        title: 'My Tags',
                        path: '/dashboard/my-tags'
                },
                {
                        icon: <ReceiptLong />,
                        title: 'Check Register',
                        path: '/dashboard/check-register'
                },
                {
                        icon: <LocalShippingOutlined />,
                        title: 'All Mails',
                        path: '/dashboard/all-orders'
                }
        ]

        sidebarList.push(
                {
                        title: 'Divider',
                        disable: DISABLE_PAYMENT_LINKS
                },
                {
                        title: 'Module Head',
                        header: 'Receivables',
                        disable: DISABLE_PAYMENT_LINKS
                },
                {
                        icon: <Payment />,
                        title: 'Payment Links',
                        path: '/dashboard/payment-links',
                        disable: DISABLE_PAYMENT_LINKS
                },
                {
                        title: 'Divider',
                        disable: DISABLE_PAYMENT_LINKS && !enableQbo
                },
                {
                        title: 'Module Head',
                        header: 'Integrations',
                        disable: DISABLE_PAYMENT_LINKS && !enableQbo
                },
                {
                        title: 'QuickBooks',
                        icon: <QuickbooksSidebarIcon />,
                        path: '/dashboard/quickbooks',
                        disable: !enableQbo
                },
                {
                        icon: <PaidOutlined />,
                        title: 'Payments',
                        path: '/dashboard/integrations/payments',
                        disable: DISABLE_PAYMENT_LINKS
                }
        )

        if (isAdmin) {
                sidebarList.push(
                        {
                                title: 'Divider'
                        },
                        {
                                title: 'Module Head',
                                header: 'Admin'
                        },
                        {
                                icon: <DashboardOutlined />,
                                title: 'Admin Dashboard',
                                path: '/dashboard/admin'
                        },
                        {
                                icon: <PeopleAltOutlined />,
                                title: 'Users',
                                path: '/dashboard/user-management/'
                        },
                        {
                                icon: <DescriptionOutlined />,
                                title: 'Checks',
                                path: '/dashboard/admin/checks'
                        },
                        {
                                icon: <AccountBalanceOutlined />,
                                title: 'Banks',
                                path: '/dashboard/admin/banks'
                        },
                        {
                                icon: <FormatListBulletedOutlined />,
                                title: 'Payees',
                                path: '/dashboard/admin/payees'
                        },
                        {
                                icon: <ReceiptOutlined />,
                                title: 'Transactions',
                                path: '/dashboard/admin/transactions'
                        },
                        {
                                icon: <CurrencyExchangeOutlined />,
                                title: 'Refunds',
                                path: '/dashboard/admin/refunds'
                        },
                        {
                                icon: <BusinessOutlined />,
                                title: 'Organizations',
                                path: '/dashboard/admin/organizations'
                        },
                        {
                                icon: <HistoryOutlined />,
                                title: 'Audit Logs',
                                path: '/dashboard/admin/audit-logs'
                        },
                        {
                                icon: <SettingsOutlined />,
                                title: 'Platform Settings',
                                path: '/dashboard/admin/platform-settings'
                        },
                        {
                                icon: <IntegrationInstructionsOutlined />,
                                title: 'Integrations',
                                path: '/dashboard/admin/integrations-overview'
                        },
                        {
                                icon: <AttachFileOutlined />,
                                title: 'Attachments & Imports',
                                path: '/dashboard/admin/attachments-imports'
                        },
                        {
                                icon: <LocalShippingOutlined />,
                                title: 'Mail Management',
                                path: '/dashboard/mail-management'
                        },
                        {
                                icon: <HistoryOutlined />,
                                title: 'Scheduled Job Runs',
                                path: '/dashboard/admin/scheduled-job-runs'
                        }
                )
        }

        const isActive = (path) => {
                if (!path) return false
                return location.pathname.includes(path)
        }

        const navItemStyles = {
                padding: '2px 8px',
                margin: '1px 0',
        }

        const activeItemStyles = {
                backgroundColor: `${theme.palette.primary.main}0D`,
                borderRadius: '10px',
        }

        const renderNavItems = (items, closeMobile = false) =>
                items
                        .filter((item) => !item.disable)
                        .map((item, index) => {
                                if (item.title === 'Divider') {
                                        return (
                                                <Divider
                                                        key={index}
                                                        sx={{
                                                                margin: '8px 16px',
                                                                borderColor: theme.palette.divider,
                                                        }}
                                                />
                                        )
                                }
                                if (item?.title === 'Module Head') {
                                        return (
                                                <Typography
                                                        key={index}
                                                        variant="overline"
                                                        sx={{
                                                                display: 'block',
                                                                px: 2.5,
                                                                pt: 1.5,
                                                                pb: 0.5,
                                                                color: theme.palette.text.disabled,
                                                                fontSize: '0.6875rem',
                                                                fontWeight: 600,
                                                                letterSpacing: '0.08em',
                                                        }}
                                                >
                                                        {item?.header}
                                                </Typography>
                                        )
                                }
                                const active = isActive(item.path)
                                return (
                                        <ListItem
                                                key={index}
                                                disablePadding
                                                sx={navItemStyles}
                                        >
                                                <ListItemButton
                                                        onClick={() => {
                                                                history.push(item.path)
                                                                if (closeMobile) setOpen(false)
                                                        }}
                                                        sx={{
                                                                borderRadius: '10px',
                                                                py: 0.75,
                                                                px: 1.5,
                                                                minHeight: 40,
                                                                ...(active ? activeItemStyles : {}),
                                                                '&:hover': {
                                                                        backgroundColor: active
                                                                                ? `${theme.palette.primary.main}14`
                                                                                : '#f0f2f5',
                                                                },
                                                        }}
                                                >
                                                        <Icon
                                                                sx={{
                                                                        minWidth: 0,
                                                                        mr: open ? 1.5 : 'auto',
                                                                        display: 'inline-flex',
                                                                        alignItems: 'center',
                                                                        width: '20px',
                                                                        height: '20px',
                                                                        color: active ? theme.palette.primary.main : theme.palette.text.secondary,
                                                                        '& svg': {
                                                                                width: '20px',
                                                                                height: '20px',
                                                                        }
                                                                }}
                                                        >
                                                                {item.icon}
                                                        </Icon>
                                                        <ListItemText
                                                                primary={item.title}
                                                                sx={{
                                                                        opacity: open ? 1 : 0,
                                                                        '& .MuiTypography-root': {
                                                                                fontSize: '0.8125rem',
                                                                                fontWeight: active ? 600 : 500,
                                                                                color: active ? theme.palette.primary.main : theme.palette.text.primary,
                                                                        }
                                                                }}
                                                        />
                                                        {item.title === 'QuickBooks' && unMappedCount > 0 && open && (
                                                                <Badge
                                                                        badgeContent={unMappedCount}
                                                                        color="warning"
                                                                        sx={{ mr: 1 }}
                                                                />
                                                        )}
                                                </ListItemButton>
                                        </ListItem>
                                )
                        })

        return (
                <>
                        {isMobile ? (
                                <SwipeableDrawer
                                        anchor="left"
                                        open={open}
                                        onClose={() => setOpen(false)}
                                        onOpen={() => setOpen(true)}
                                        sx={{
                                                '& .MuiDrawer-paper': {
                                                        width: 280,
                                                        boxSizing: 'border-box',
                                                        backgroundColor: '#fff',
                                                        marginTop: mt || 0,
                                                        borderRight: 'none',
                                                }
                                        }}
                                >
                                        <Box
                                                sx={{
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        justifyContent: 'space-between',
                                                        p: 2,
                                                        pt: 3,
                                                }}
                                        >
                                                <div className="sidebar-logo d-flex align-items-center flex-row">
                                                        {checkWriterLogo1}
                                                        <div className="sidebar-logo1">{onlyLogo}</div>
                                                </div>
                                                <ProfilePopover
                                                        userFirstName={userFirstName}
                                                        userLastName={userLastName}
                                                        userEmail={userEmail}
                                                        onManageSubscription={handleManageSubscription}
                                                        setSideBarOpen={setOpen}
                                                />
                                        </Box>

                                        <List sx={{ px: 1, pt: 1 }}>
                                                {renderNavItems(sidebarList, true)}
                                        </List>
                                </SwipeableDrawer>
                        ) : (
                                <Drawer
                                        variant="permanent"
                                        open={open}
                                        className="app-sidebar"
                                        sx={{
                                                width: drawerWidth,
                                                flexShrink: 0,
                                                whiteSpace: 'nowrap',
                                                boxSizing: 'border-box',
                                                ...(open && {
                                                        ...openedMixin(theme),
                                                        '& .MuiDrawer-paper': {
                                                                ...openedMixin(theme),
                                                                backgroundColor: '#ffffff',
                                                                borderRight: 'none',
                                                                boxShadow: '1px 0 6px rgba(0,0,0,0.04)',
                                                        }
                                                }),
                                                ...(!open && {
                                                        ...closedMixin(theme),
                                                        '& .MuiDrawer-paper': {
                                                                ...closedMixin(theme),
                                                                backgroundColor: '#ffffff',
                                                                borderRight: 'none',
                                                                boxShadow: '1px 0 6px rgba(0,0,0,0.04)',
                                                        }
                                                })
                                        }}
                                >
                                        <Box sx={{ marginTop: mt || 0 }}>
                                                <DrawerHeader
                                                        sx={{
                                                                display: 'flex',
                                                                alignItems: 'center',
                                                                justifyContent: 'space-between',
                                                                px: 1.5,
                                                                minHeight: '64px !important',
                                                        }}
                                                >
                                                        <div
                                                                className="sidebar-logo d-flex align-items-center flex-row"
                                                                onClick={() => setOpen(!open)}
                                                                style={{ cursor: 'pointer' }}
                                                        >
                                                                {checkWriterLogo1}
                                                                <div className="sidebar-logo1">{open && onlyLogo}</div>
                                                        </div>
                                                        <IconButton
                                                                onClick={() => setOpen(!open)}
                                                                sx={{
                                                                        display: open ? 'flex' : 'none',
                                                                        width: 32,
                                                                        height: 32,
                                                                        color: theme.palette.text.secondary,
                                                                        '&:hover': {
                                                                                backgroundColor: '#f0f2f5',
                                                                        }
                                                                }}
                                                        >
                                                                {open ? <ChevronLeftIcon fontSize="small" /> : <ChevronRight fontSize="small" />}
                                                        </IconButton>
                                                </DrawerHeader>
                                        </Box>

                                        <List sx={{ px: 1, pt: 0.5 }}>
                                                {renderNavItems(sidebarList, false)}
                                        </List>
                                </Drawer>
                        )}

                        <FormModalMUI
                                open={logoutModal}
                                onClose={() => {
                                        setLogoutModal(false)
                                }}
                                maxWidth="sm"
                        >
                                <div class="container" style={{ width: '450px' }}>
                                        <div class="row">
                                                <div class="d-flex align-items-center justify-content-center txt-danger mt-3 mb-2">
                                                        <ErrorOutline sx={{ fontSize: '80px' }} />
                                                </div>
                                                <div class="col d-flex justify-content-center">
                                                        <div class="row">
                                                                <h3>
                                                                        <p>
                                                                                <b>Logout</b>
                                                                        </p>
                                                                </h3>
                                                        </div>
                                                </div>
                                        </div>
                                        <div class="row">
                                                <div class="col d-flex justify-content-center">
                                                        <div class="row text-center">
                                                                <p>Are you sure you want to logout?</p>
                                                        </div>
                                                </div>
                                        </div>
                                </div>

                                <div className="d-flex align-items-center justify-content-center mt-3 mb-4">
                                        <ButtonComponent
                                                text="Cancel"
                                                type="button"
                                                variant="light"
                                                click={() => {
                                                        setLogoutModal(false)
                                                }}
                                                extraClass="me-3"
                                        />
                                        <ButtonComponent
                                                text={'Logout'}
                                                type="submit"
                                                variant="danger"
                                                click={logout}
                                        />
                                </div>
                        </FormModalMUI>
                </>
        )
}

export default Sidebar
