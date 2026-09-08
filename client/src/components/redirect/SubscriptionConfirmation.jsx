import { Box, Link, styled } from '@mui/material'
import { ConfirmationIcon, SiteLogo } from '../Icons'
import { useHistory } from 'react-router-dom/cjs/react-router-dom.min'
import { CustomButton } from '../shared/buttons/CustomButton'
import GTM_EVENT from '../../utils/gtm_tags'

const Heading = styled('h2')(({ theme }) => ({
	fontFamily: 'Inter',
	fontWeight: 600,
	fontSize: '40px',
	lineHeight: '100%',
	letterSpacing: '0%',
	color: '#000000'
}))

const Description = styled('p')(({ theme }) => ({
	fontFamily: 'Inter',
	fontWeight: 500,
	fontSize: '20px',
	lineHeight: '100%',
	letterSpacing: '0%',
	textAlign: 'center',
	color: '#00000099'
}))


const SubscriptionConfirmation = ({trial}) => {
    const history = useHistory()
    const handleManageSubscription = () => {
        if (trial) {
					history.push('/dashboard/bank-accounts')
				} else {
					history.push('/dashboard/subscription-management')
				}
    }
	return (
		<Box
			justifyContent={'center'}
			alignItems={'center'}
			display={'flex'}
			flexDirection={'column'}
			sx={{ height: '100vh', textAlign: 'center' }}
		>
			<ConfirmationIcon />
			<Box mt={6} mb={'12px'}>
				<SiteLogo />
			</Box>
			<Heading>
                {
                    trial ? `Welcome to Check Writer!` : `Thank You for Subscribing!`
                }
            </Heading>
			<Description sx={{ maxWidth: '553px', mt: '8px' }}>
				{
                    trial ? `You’re now on a free trial. You can start creating and printing checks
				right away.` : `Your subscription is now active. Let’s get started with your first check.`
                }
			</Description>
			<Description>Thank you for Sign Up</Description>
			<Box justifyContent={'center'} display={'flex'} columnGap={'12px'} mt={'40px'}>
                    <CustomButton
                        variant="light"
                        type="submit"
                        color="error"
                        startIcon={null}
                        endIcon={null}
                        onClick={handleManageSubscription}
                        sx={{color:'#000000DE'}}
                        data-gtm={trial ? GTM_EVENT.THANK_YOU_TRIAL_BANK_SETUP_CLICKED : GTM_EVENT.THANK_YOU_SUBSCRIPTION_MANAGE_CLICKED}
                    >
                        {trial ? `Set Up Bank Account` : `Manage Subscription`}
                    </CustomButton>
				<Link href="/dashboard" style={{ textDecoration: 'none' }} data-gtm={trial ? GTM_EVENT.THANK_YOU_TRIAL_DASHBOARD_CLICKED : GTM_EVENT.THANK_YOU_SUBSCRIPTION_DASHBOARD_CLICKED}>
                <CustomButton
					variant="filled"
					startIcon={null}
					endIcon={null}
					onClick={null}
				>
					Start Using Check Writer
				</CustomButton>
                </Link>
			</Box>
		</Box>
	)
}

export default SubscriptionConfirmation
