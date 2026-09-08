import React, { useEffect, useState } from 'react'
import { CircularProgress } from '@mui/material'
import { emailIcon, locationIcon, phoneIcon } from '../../../assets/svg'
import { Link } from 'react-router-dom'

import appLogo from '../../../assets/images/app-logo.png'
import playStoreImg from '../../../assets/images/play-store.png'
import appStoreImg from '../../../assets/images/app-store.png'

const Footer = () => {
	useEffect(() => {
		let tidioElem = document.getElementById('tidio-chat-iframe')
		tidioElem.addEventListener('click', () => {
			window?.tidioChatApi?.open(true)
		})
	}, [])

	const [email, setEmail] = useState('')
	const [isLoading, setIsLoading] = useState(false)
	const [isComplete, setIsComplete] = useState(false)

	const subscribe = async (e) => {
		const forms = document.querySelectorAll('.needs-validation')

		Array.from(forms).forEach((form) => {
			e.preventDefault()
			if (!form.checkValidity()) {
				e.stopPropagation()

				return false
			}
			form.classList.add('was-validated')
		})

		//e.preventDefault()
		setIsLoading(true)
		try {
			const res = await fetch('https://devsetup-new.synccos.com/subscribe', {
				method: 'POST',
				body: JSON.stringify({
					email
				}),
				headers: {
					'Content-Type': 'application/json'
					// 'Content-Type': 'application/x-www-form-urlencoded',
				}
			})

			await res.json()
			setIsLoading(false)
			setIsComplete(true)
			setEmail('')
			setTimeout(() => {
				setIsComplete(false)
			}, 3000)
		} catch (error) {
			setIsLoading(false)
			setIsComplete(false)
		}
	}

	return (
		<div className="app-footer">
			<div className="container-fluid m-0">
				<div className="upper-footer py-5">
					<div className="container">
						<div className="row">
							<div className="col-12 col-md-6">
								<div className="footer-head">
									<h3 className="section-sub-head text-white fw-semibold">
										Contact information
									</h3>
									<p>Please contact us for any questions or assistance.</p>
								</div>
							</div>
							<div className="col-12 col-md-6">
								<div className="contact-info">
									<div className="contact-info-div d-flex flex-row align-items-center justify-content-start">
										<div className="icon">{emailIcon}</div>
										<a
											href="mailto:support@synccos.com"
											className="contact-link"
										>
											support@synccos.com
										</a>
									</div>
									<div className="contact-info-div d-flex flex-row align-items-center justify-content-start">
										<div className="icon">{phoneIcon}</div>
										<a href="tel:+1 833-279-6226" className="contact-link">
											+1 833-279-6226
										</a>
									</div>
									<div className="contact-info-div d-flex flex-row align-items-center justify-content-start">
										<div className="icon">{locationIcon}</div>
										<p className="contact-txt m-0">
											1021 State Rt 32 Highland Mills NY 10930
										</p>
									</div>
								</div>
								<div className="d-flex align-items-center justify-content-start">
									<button
										className="border-0 app-download-btn bg-transparent me-2"
										data-bs-toggle="modal"
										data-bs-target="#app-download-modal"
									>
										<img src={playStoreImg} alt="" />
									</button>
									<button
										className="border-0 app-download-btn bg-transparent ms-2"
										data-bs-toggle="modal"
										data-bs-target="#app-download-modal"
									>
										<img src={appStoreImg} alt="" />
									</button>
								</div>
							</div>
						</div>
					</div>
				</div>
				<div className="middle-footer">
					<div className="container">
						<div className="row">
							<div className="col-12 col-md-6">
								<div className="footer-head">
									<h3 className="section-sub-head text-white fw-semibold">
										Stay connected
									</h3>
									<p>
										Do not miss the chance to stay updated on all the new cool
										features and join out mail list today.
									</p>
								</div>
								<div className="input-group">
									<form
										className="needs-validation d-flex align-items-center justify-content-center"
										onSubmit={subscribe}
										noValidate
									>
										<div className="d-flex align-items-center justify-content-center has-validation">
											<input
												placeholder="Enter your email"
												type="email"
												className="border-0 form-control"
												value={email}
												onChange={(e) => {
													setEmail(e.target.value)
												}}
												required
											/>

											<button
												type="submit"
												className="border-0 common-btn d-flex align-items-center justify-content-center"
												onClick={subscribe}
												disabled={isLoading || isComplete || email === ''}
											>
												{isComplete ? (
													<div classname="success-check subscribe">
														<svg
															xmlns="http://www.w3.org/2000/svg"
															className="svg-success"
															viewBox="0 0 24 24"
														>
															<g
																strokeLinecap="round"
																strokeLinejoin="round"
																strokeMiterlimit="10"
															>
																<circle
																	className="success-circle-outline"
																	cx="12"
																	cy="12"
																	r="11.5"
																/>
																<circle
																	className="success-circle-fill"
																	cx="12"
																	cy="12"
																	r="11.5"
																/>
																<polyline
																	className="success-tick"
																	points="17,8.5 9.5,15.5 7,13"
																/>
															</g>
															<linearGradient
																id="my-cool-gradient"
																x2="1"
																y2="1"
															>
																<stop offset="14.6%" stopColor="#84d6bf" />
																<stop offset="53.33%" stopColor="#1e3a5f" />
																<stop offset="84.95%" stopColor="#2da4aa" />
															</linearGradient>
														</svg>
													</div>
												) : isLoading ? (
													<CircularProgress className="spinner" />
												) : (
													'Subscribe'
												)}
											</button>
										</div>
										<div className="invalid-feedback">Incorrect Email.</div>
									</form>
								</div>
							</div>
							<div className="col-12 col-md-6">
								<div className="d-flex flex-row align-items-start justify-content-between">
									{/* <div className="footer-nav">
										<h5 className="nav-head">Product</h5>
										<ul className="nav-list">
											<li className="nav-item">
												<Link to="/">Overview</Link>
											</li>
											<li className="nav-item">
												<Link to="/">Features</Link>
											</li>
											<li className="nav-item">
										<Link to="/">Solutions</Link>
									</li>
									<li className="nav-item">
										<Link to="/">Tutorials</Link>
									</li>
									<li className="nav-item">
										<Link to="/">Pricing</Link>
									</li>
										</ul>
									</div> */}
									<div className="footer-nav">
										<h5 className="nav-head">Company</h5>
										<ul className="nav-list">
											{/* <li className="nav-item">
												<Link to="/">About Us</Link>
											</li> */}

											<li className="nav-item">
												<p style={{ cursor: 'pointer' }} id="tidio-chat-iframe">
													Contact
												</p>
											</li>
										</ul>
									</div>
									{/* <div className="footer-nav">
								<h5 className="nav-head">Resources</h5>
								<ul className="nav-list">
									<li className="nav-item">
										<Link to="/">Blog</Link>
									</li>
									<li className="nav-item">
										<Link to="/">Help center</Link>
									</li>
									<li className="nav-item">
										<Link to="/">Tutorials</Link>
									</li>
									<li className="nav-item">
										<Link to="/">Support</Link>
									</li>
								</ul>
							</div> */}
									<div className="footer-nav">
										<h5 className="nav-head">Social</h5>
										<ul className="nav-list">
											<li className="nav-item">
												<a
													href="https://twitter.com/SynccosApp"
													target="blank"
													rel="no-referrer"
												>
													Twitter
												</a>
											</li>
											<li className="nav-item">
												<a
													href="https://www.linkedin.com/company/synccos-inc"
													target="blank"
													rel="no-referrer"
												>
													LinkedIn
												</a>
											</li>
											<li className="nav-item">
												<a
													href="https://www.facebook.com/profile.php?id=100090749470482"
													target="blank"
													rel="no-referrer"
												>
													Facebook
												</a>
											</li>
											<li className="nav-item">
												<a
													href="https://www.instagram.com/synccosapp/"
													target="blank"
													rel="no-referrer"
												>
													Instagram
												</a>
											</li>
										</ul>
									</div>
									<div className="footer-nav">
										<h5 className="nav-head">Legal</h5>
										<ul className="nav-list">
											<li className="nav-item">
												<Link to="/terms">Terms</Link>
											</li>
											<li className="nav-item">
												<Link to="/privacy">Privacy</Link>
											</li>
										</ul>
									</div>
								</div>
							</div>
						</div>
					</div>
				</div>
				<div className="lower-footer py-5">
					<div className="container">
						<div className="row align-items-center">
							<div className="col-12 col-md-6">
								<img src={appLogo} alt="" className="app-logo" />
							</div>
							<div className="col-12 col-md-6">
								<p className="copyright-txt m-0">
									Copyright: 2023 Check software. All Rights Reserved.
								</p>
							</div>
						</div>
					</div>
				</div>
			</div>
		</div>
	)
}

export default Footer
