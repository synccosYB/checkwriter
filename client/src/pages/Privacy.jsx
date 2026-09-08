import React, { useEffect } from 'react'
import { Box, Typography } from '@mui/material'
import { authColors } from '../styles/authStyles'

const Privacy = () => {
	useEffect(() => {
		window.scrollTo(0, 0)
	}, [])

	const sectionStyle = {
		fontSize: '16px',
		fontWeight: 700,
		color: authColors.textPrimary,
		mt: 4,
		mb: 1.5,
		letterSpacing: '-0.01em',
	}

	const bodyStyle = {
		fontSize: '15px',
		lineHeight: 1.7,
		color: authColors.textSecondary,
		mb: 2,
	}

	return (
		<Box
			sx={{
				minHeight: '100vh',
				backgroundColor: authColors.background,
				py: { xs: 4, sm: 6, md: 8 },
				px: { xs: 2, sm: 3 },
			}}
		>
			<Box
				sx={{
					maxWidth: '720px',
					mx: 'auto',
					backgroundColor: '#fff',
					borderRadius: '16px',
					padding: { xs: '32px 24px', sm: '48px 40px', md: '56px 56px' },
					boxShadow: '0 1px 3px rgba(0,0,0,0.06)',
				}}
			>
				<Box sx={{ textAlign: 'center', mb: 5 }}>
					<Typography
						sx={{
							fontSize: '12px',
							fontWeight: 700,
							textTransform: 'uppercase',
							letterSpacing: '0.1em',
							color: authColors.accent,
							mb: 1.5,
						}}
					>
						Privacy
					</Typography>
					<Typography
						sx={{
							fontSize: { xs: '28px', sm: '34px' },
							fontWeight: 700,
							color: authColors.textPrimary,
							letterSpacing: '-0.02em',
						}}
					>
						Privacy Policy
					</Typography>
				</Box>

				<Typography sx={{ ...bodyStyle, fontStyle: 'italic' }}>
					Thank you for choosing Synccos Inc. ("Synccos," "we," "us," or
					"our"). This Privacy Policy describes how we collect, use, and
					disclose information that we obtain about visitors to our website,
					synccos.com, and users of our services.
				</Typography>

				<Typography sx={sectionStyle}>1. Collection of Information</Typography>
				<Typography sx={bodyStyle}>
					We collect personal information about you in various ways, such as
					when you provide it to us through our website or through our
					customer support channels. The types of personal information we may
					collect include your name, email address, telephone number, payment
					information, device type, operating system, browser type, IP
					address, location, and usage data. We may also collect information
					about your interactions with our website and advertisements, such as
					the pages you visit and the links you click.
				</Typography>

				<Typography sx={sectionStyle}>2. Use of Information</Typography>
				<Typography sx={bodyStyle}>
					We use the personal information we collect to provide, maintain, and
					improve our services, to personalize your experience, to communicate
					with you, to conduct research and analysis, to develop and improve
					our products and services, and to respond to your inquiries and
					requests. We may also use your personal information for marketing
					purposes, such as sending you promotional emails, unless you opt-out
					of receiving such communications.
				</Typography>

				<Typography sx={sectionStyle}>3. Sharing of Information</Typography>
				<Typography sx={bodyStyle}>
					We may share your personal information with third-party service
					providers who assist us in providing our services, such as payment
					processors, cloud storage providers, and marketing and analytics
					providers. We require these service providers to comply with
					applicable data protection laws and to use the information only for
					the purposes for which it was provided. We may also share your
					personal information with our affiliates, partners, and advisors for
					business purposes, such as to provide support and improve our
					products and services. We may also share your personal information
					if we are required to do so by law or in connection with legal
					proceedings. In the event of a merger, acquisition, or sale of all
					or a portion of our business, we may transfer your personal
					information to the relevant third party.
				</Typography>

				<Typography sx={sectionStyle}>4. Security</Typography>
				<Typography sx={bodyStyle}>
					We take reasonable measures to protect your personal information
					from unauthorized access, use, and disclosure. We use encryption and
					other security technologies to protect your personal information,
					and we conduct periodic security assessments and audits to ensure
					the ongoing effectiveness of our security measures. However, no
					method of transmission over the Internet or electronic storage is
					completely secure, and we cannot guarantee the absolute security of
					your personal information.
				</Typography>

				<Typography sx={sectionStyle}>5. Data Retention</Typography>
				<Typography sx={bodyStyle}>
					Synccos Inc. will retain your personal information for as long as
					necessary to provide our services and to comply with legal
					obligations. We may also retain your personal information for a
					longer period if necessary to resolve disputes or enforce our
					agreements.
				</Typography>

				<Typography sx={sectionStyle}>6. International Transfers</Typography>
				<Typography sx={bodyStyle}>
					Synccos Inc. is based in the United States, and your personal
					information may be transferred to and processed in other countries
					where our service providers are located. These countries may have
					different data protection laws than your country of residence, but
					we will take appropriate measures to ensure that your personal
					information is protected following applicable law.
				</Typography>

				<Typography sx={sectionStyle}>7. Children's Privacy</Typography>
				<Typography sx={bodyStyle}>
					Our services are not intended for use by children under the age of
					18, and we do not knowingly collect personal information from
					children under the age of 18.
				</Typography>

				<Typography sx={sectionStyle}>8. Additional Rights</Typography>
				<Typography sx={bodyStyle}>
					Depending on your location, you may have additional rights regarding
					your personal information, such as the right to access, correct, and
					delete your personal information, as well as the right to object to
					certain processing activities. Please contact us at the address
					provided in the policy if you would like to exercise these rights.
				</Typography>

				<Typography sx={sectionStyle}>9. Links to Other Websites</Typography>
				<Typography sx={bodyStyle}>
					Our website may contain links to other websites not operated by us.
					We are not responsible for the privacy practices of these websites
					and encourage you to review their privacy policies.
				</Typography>

				<Typography sx={sectionStyle}>10. Changes to this Privacy Policy</Typography>
				<Typography sx={bodyStyle}>
					We may update this Privacy Policy from time to time. If we make
					material changes, we will be sure to give notice on our website and
					by other means as appropriate.
				</Typography>

				<Typography sx={sectionStyle}>11. Contact Us</Typography>
				<Typography sx={bodyStyle}>
					If you have any questions or concerns about this Privacy Policy,
					don't hesitate to contact us at{' '}
					<a href="mailto:support@synccos.com" style={{ color: authColors.navyLight, textDecoration: 'none' }}>
						support@synccos.com
					</a>
					, by phone at{' '}
					<a href="tel:+1 833-279-6226" style={{ color: authColors.navyLight, textDecoration: 'none' }}>
						+1 833-279-6226
					</a>
					, or by mail at:
				</Typography>
				<Typography sx={{ ...bodyStyle, mb: 0 }}>Synccos Inc.</Typography>
				<Typography sx={{ ...bodyStyle, mb: 0 }}>1021 State Rt.</Typography>
				<Typography sx={bodyStyle}>32 Highland Mills, NY 10930</Typography>
			</Box>
		</Box>
	)
}

export default Privacy
