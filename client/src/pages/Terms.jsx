import React, { useEffect } from 'react'
import { Box, Typography } from '@mui/material'
import { authColors } from '../styles/authStyles'

const Terms = () => {
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
						Terms
					</Typography>
					<Typography
						sx={{
							fontSize: { xs: '28px', sm: '34px' },
							fontWeight: 700,
							color: authColors.textPrimary,
							letterSpacing: '-0.02em',
						}}
					>
						Terms of Use
					</Typography>
				</Box>

				<Typography sx={{ ...bodyStyle, fontStyle: 'italic' }}>
					Please read these Terms and Conditions ("Terms", "Terms and
					Conditions") carefully before using the CheckWriting Application
					("Application", "Service") operated by Synccos Inc. ("us", "we", or
					"our"). Your access to and use of the Application is conditioned
					upon your acceptance of and compliance with these Terms. These Terms
					apply to all users of the Application.
				</Typography>

				<Typography sx={sectionStyle}>1. License</Typography>
				<Typography sx={bodyStyle}>
					By accessing or using the Application, you agree to be bound by
					these Terms. If you disagree with any part of the terms, then you do
					not have permission to access or use the Application. Subject to
					these Terms, we grant you a limited, non-exclusive,
					non-transferable, and revocable license to use the Application for
					your personal, non-commercial purposes.
				</Typography>

				<Typography sx={sectionStyle}>2. Accounts and User Conduct</Typography>
				<Typography sx={bodyStyle}>
					To access some features of the Application, you must create an
					account ("Account"). You agree to provide accurate, current, and
					complete information during the registration process and to update
					such information as necessary. You are responsible for maintaining
					the confidentiality of your Account and password, and you agree to
					accept responsibility for all activities that occur under your
					Account.
				</Typography>
				<Typography sx={bodyStyle}>
					You agree not to use the Application for any illegal or unauthorized
					purposes, including but not limited to fraud, forgery, or identity
					theft. You also agree not to impersonate another person or entity or
					to use another person's Account without their permission.
				</Typography>

				<Typography sx={sectionStyle}>3. Fees and Payments</Typography>
				<Typography sx={bodyStyle}>
					Some features of the Application may require payment of fees. All
					fees are stated in U.S. dollars and are non-refundable. By using the
					Application, you agree to pay any applicable fees and authorize us
					to charge your chosen payment method.
				</Typography>

				<Typography sx={sectionStyle}>4. Intellectual Property</Typography>
				<Typography sx={bodyStyle}>
					The Application and its original content, features, and
					functionality are and will remain the exclusive property of Synccos
					Inc. and its licensors. The Application is protected by copyright,
					trademark, and other laws of both the United States and foreign
					countries.
				</Typography>

				<Typography sx={sectionStyle}>5. Disclaimers and Limitation of Liability</Typography>
				<Typography sx={bodyStyle}>
					The Application is provided on an "as is" and "as available" basis.
					We make no warranties, expressed or implied, and hereby disclaim and
					negate all other warranties, including without limitation, implied
					warranties or conditions of merchantability, fitness for a
					particular purpose, or non-infringement of intellectual property or
					other violation of rights.
				</Typography>
				<Typography sx={bodyStyle}>
					In no event shall Synccos Inc., its directors, employees, or agents
					be liable for any direct, indirect, incidental, special,
					consequential, or punitive damages, including but not limited to
					loss of profits, data, use, or goodwill, arising out of or in
					connection with your access to or use of the Application.
				</Typography>

				<Typography sx={sectionStyle}>6. Indemnification</Typography>
				<Typography sx={bodyStyle}>
					You agree to defend, indemnify, and hold harmless Synccos Inc. and
					its licensee and licensors, and their employees, contractors,
					agents, officers, and directors, from and against any and all
					claims, damages, obligations, losses, liabilities, costs or debt,
					and expenses (including but not limited to attorney's fees),
					resulting from or arising out of your use and access of the
					Application or your breach of these Terms.
				</Typography>

				<Typography sx={sectionStyle}>7. Governing Law</Typography>
				<Typography sx={bodyStyle}>
					These Terms shall be governed and construed in accordance with the
					laws of the United States and the state in which Synccos Inc. is
					incorporated, without regard to its conflict of law provisions.
				</Typography>

				<Typography sx={sectionStyle}>8. Changes to Terms</Typography>
				<Typography sx={bodyStyle}>
					We reserve the right, at our sole discretion, to modify or replace
					these Terms at any time. If a revision is material, we will provide
					at least 30 days' notice prior to any new terms taking effect. By
					continuing to access or use the Application after any revisions
					become effective, you agree to be bound by the revised terms.
				</Typography>

				<Typography sx={sectionStyle}>9. Termination</Typography>
				<Typography sx={bodyStyle}>
					We may terminate or suspend your access to the Application
					immediately, without prior notice or liability, if you breach these
					Terms. Upon termination, your right to use the Application will
					immediately cease. All provisions of the Terms which by their nature
					should survive termination shall survive termination, including,
					without limitation, ownership provisions, warranty disclaimers,
					indemnity, and limitations of liability.
				</Typography>

				<Typography sx={sectionStyle}>10. Privacy</Typography>
				<Typography sx={bodyStyle}>
					Your privacy is important to us. Please review our Privacy Policy,
					which informs you of our practices regarding the collection, use,
					and disclosure of personal information we receive from users of the
					Application. By using the Application, you agree to the collection
					and use of information in accordance with our Privacy Policy.
				</Typography>

				<Typography sx={sectionStyle}>11. Contact Us</Typography>
				<Typography sx={bodyStyle}>
					If you have any questions about these Terms, please contact us at{' '}
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

				<Typography sx={sectionStyle}>12. Third-Party Services</Typography>
				<Typography sx={bodyStyle}>
					The Application may contain links to third-party websites or
					services that are not owned or controlled by Synccos Inc. We have no
					control over and assume no responsibility for the content, privacy
					policies, or practices of any third-party websites or services. You
					acknowledge and agree that Synccos Inc. shall not be responsible or
					liable, directly or indirectly, for any damage or loss caused or
					alleged to be caused by or in connection with the use of or reliance
					on any such content, goods, or services available on or through any
					such websites or services.
				</Typography>

				<Typography sx={sectionStyle}>13. Updates and Maintenance</Typography>
				<Typography sx={bodyStyle}>
					We may, from time to time, provide updates or perform maintenance on
					the Application. This may result in temporary interruptions or
					downtime. We will make reasonable efforts to minimize any disruption
					to your access and use of the Application during such times.
				</Typography>

				<Typography sx={sectionStyle}>14. Security</Typography>
				<Typography sx={bodyStyle}>
					We are committed to ensuring the security of the Application and the
					information it processes. While we strive to use commercially
					acceptable means to protect your personal information, we cannot
					guarantee its absolute security. By using the Application, you
					acknowledge that you understand the risks associated with
					transmitting information over the internet and that Synccos Inc. is
					not responsible for any unauthorized access to or use of your
					personal information.
				</Typography>

				<Typography sx={sectionStyle}>15. Force Majeure</Typography>
				<Typography sx={bodyStyle}>
					Synccos Inc. shall not be held liable for any failure or delay in
					the performance of its obligations under these Terms due to causes
					beyond its reasonable control, including but not limited to acts of
					God, war, terrorism, labor disputes, embargoes, government orders or
					actions, technical failures, or any other unforeseen events or
					circumstances.
				</Typography>

				<Typography sx={bodyStyle}>
					By accessing or using the CheckWriting Application, you agree to be
					bound by these Terms and Conditions. If you do not agree with any
					part of these Terms and Conditions, you are not authorized to access
					or use the Application.
				</Typography>

				<Typography sx={sectionStyle}>16. Severability</Typography>
				<Typography sx={bodyStyle}>
					If any provision of these Terms is found to be invalid or
					unenforceable by a court of competent jurisdiction, the remaining
					provisions shall remain in full force and effect, and the invalid or
					unenforceable provision shall be deemed replaced by a valid and
					enforceable provision that most closely reflects the intent of the
					original provision.
				</Typography>

				<Typography sx={sectionStyle}>17. Waiver</Typography>
				<Typography sx={bodyStyle}>
					No waiver of any provision of these Terms by Synccos Inc. shall be
					deemed a further or continuing waiver of such provision or any other
					provision, and any failure by Synccos Inc. to assert a right or
					provision under these Terms shall not constitute a waiver of such
					right or provision.
				</Typography>

				<Typography sx={sectionStyle}>18. Entire Agreement</Typography>
				<Typography sx={bodyStyle}>
					These Terms, along with our Privacy Policy, constitute the entire
					agreement between you and Synccos Inc. regarding your use of the
					Application and supersede all prior agreements, understandings, and
					communications, whether written or oral, with respect to the subject
					matter hereof.
				</Typography>

				<Typography sx={sectionStyle}>19. Assignment</Typography>
				<Typography sx={bodyStyle}>
					You may not assign or transfer your rights or obligations under
					these Terms without the prior written consent of Synccos Inc. Any
					attempted assignment or transfer without such consent will be null
					and void. Synccos Inc. may freely assign or transfer its rights and
					obligations under these Terms without restriction.
				</Typography>

				<Typography sx={sectionStyle}>20. Notices</Typography>
				<Typography sx={bodyStyle}>
					Any notices or other communications required or permitted hereunder
					shall be in writing and shall be deemed given when delivered (a)
					personally, (b) by registered or certified mail, postage prepaid,
					return receipt requested, (c) by a nationally recognized overnight
					courier, or (d) by email, provided that a copy is also sent by
					another means specified in this section.
				</Typography>

				<Typography sx={sectionStyle}>21. No Agency</Typography>
				<Typography sx={bodyStyle}>
					No agency, partnership, joint venture, employee-employer, or
					franchisor-franchisee relationship is intended or created by these
					Terms. Neither party shall have any authority to bind the other
					party in any manner whatsoever.
				</Typography>

				<Typography sx={sectionStyle}>22. Compliance with Laws</Typography>
				<Typography sx={bodyStyle}>
					You agree to comply with all applicable laws, regulations, and rules
					in connection with your access to and use of the Application. You
					shall not use the Application in any manner that would violate any
					applicable laws, regulations, or rules, including but not limited to
					any export control laws or regulations.
				</Typography>

				<Typography sx={sectionStyle}>23. Dispute Resolution</Typography>
				<Typography sx={bodyStyle}>
					Any dispute, controversy, or claim arising out of or in connection
					with these Terms, including any question regarding its existence,
					validity, or termination, shall be resolved by arbitration in
					accordance with the rules of the American Arbitration Association.
					The seat of arbitration shall be the city in which Synccos Inc. is
					incorporated, and the language of the arbitration shall be English.
					The decision of the arbitrator shall be final and binding on the
					parties, and judgment upon the award rendered by the arbitrator may
					be entered in any court having jurisdiction thereof.
				</Typography>

				<Typography sx={bodyStyle}>
					By accessing or using the CheckWriting Application, you agree to be
					bound by these Terms and Conditions. If you do not agree with any
					part of these Terms and Conditions, you are not authorized to access
					or use the Application.
				</Typography>

				<Typography sx={sectionStyle}>24. Customer Support</Typography>
				<Typography sx={bodyStyle}>
					If you encounter any issues, have questions, or require assistance
					in using the Application, please contact our customer support team
					at checkwriter@synccos.com. We will make reasonable efforts to
					respond to your inquiries and address any concerns you may have.
				</Typography>

				<Typography sx={sectionStyle}>25. Headings</Typography>
				<Typography sx={bodyStyle}>
					The headings used in these Terms are for convenience only and shall
					not be considered in the interpretation or construction of these
					Terms.
				</Typography>

				<Typography sx={sectionStyle}>26. Updates to the Application</Typography>
				<Typography sx={bodyStyle}>
					We reserve the right, at our sole discretion, to update, modify, or
					discontinue the Application or any features, functionality, or
					content thereof at any time, with or without prior notice. We will
					make reasonable efforts to notify you of any significant changes to
					the Application.
				</Typography>

				<Typography sx={sectionStyle}>27. Export Restrictions</Typography>
				<Typography sx={bodyStyle}>
					You agree to comply with all applicable export and re-export control
					laws and regulations, including, without limitation, the Export
					Administration Regulations maintained by the U.S. Department of
					Commerce, trade and economic sanctions maintained by the Treasury
					Department's Office of Foreign Assets Control, and the International
					Traffic in Arms Regulations maintained by the Department of State.
				</Typography>
			</Box>
		</Box>
	)
}

export default Terms
