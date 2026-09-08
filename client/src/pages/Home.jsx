import React, { useEffect, useState } from 'react'
import { CircularProgress } from '@mui/material'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

import signCheckImg from '../assets/images/signCheck.png'
import coFinanceLogo from '../assets/images/cofinance.png'
import printEmailImg from '../assets/images/printEmail.png'
import checksImg from '../assets/images/checks.png'
import userImg from '../assets/images/user.png'
import tabImg1 from '../assets/images/check-printing.png'
import tabImg2 from '../assets/images/cloud-sync.png'
import tabImg3 from '../assets/images/checque-cancellation.png'
import bankLogo1 from '../assets/images/bankLogo1.png'
import bankLogo2 from '../assets/images/bankLogo2.png'
import bankLogo3 from '../assets/images/bankLogo3.png'
import bankLogo4 from '../assets/images/bankLogo4.png'
import {
	cancelIcon,
	cloudIcon,
	comingSoonIcon,
	layoutIcon,
	moneyIcon,
	printerIcon
} from '../assets/svg'
import { useHistory } from 'react-router'

gsap.registerPlugin(ScrollTrigger)

const Home = () => {
	useEffect(() => {
		const animations = {
			'slide-in-fwd-bottom':
				'slide-in-fwd-bottom 0.5s cubic-bezier(0.25, 0.46, 0.45, 0.94) 0.5s both',

			'slide-in-fwd-left':
				'slide-in-fwd-left 0.5s cubic-bezier(0.25, 0.46, 0.45, 0.94) 0.5s both',
			'slide-in-fwd-top':
				'slide-in-fwd-top 0.5s cubic-bezier(0.25, 0.46, 0.45, 0.94) 0.5s both',

			'slide-in-fwd-right':
				'slide-in-fwd-right 0.5s cubic-bezier(0.25, 0.46, 0.45, 0.94) 0.5s both'
		}

		let topElm = document.getElementsByClassName('slide-in-fwd-top')
		let bottomElm = document.getElementsByClassName('slide-in-fwd-bottom')
		let leftElm = document.getElementsByClassName('slide-in-fwd-left')
		let rightElm = document.getElementsByClassName('slide-in-fwd-right')

		let elms = [...topElm, ...bottomElm, ...leftElm, ...rightElm]

		const observer = new IntersectionObserver(
			(entries, observer) => {
				entries.forEach((entry) => {
					if (entry.isIntersecting) {
						// Do something when the element is visible in the viewport

						const animationType =
							entry.target.dataset.animation || 'slide-in-fwd-bottom'

						entry.target.style.webkitAnimation = animations[animationType]
						entry.target.style.animation = animations[animationType]

						// Unobserve the target element so that the callback is not called again
						observer.unobserve(entry.target)
					}
				})
			},
			{
				root: null, // Use the viewport as the root element
				threshold: 0.5, // Call the callback when at least 50% of the element is visible
				rootMargin: '0px' // No margin around the root element
			}
		)

		elms.forEach((elem) => {
			observer.observe(elem)
		})
	}, [])

	useEffect(() => {
		let elems = document.getElementsByClassName('fade-animation')

		const observer = new IntersectionObserver(
			(entries, observer) => {
				entries.forEach((entry) => {
					if (entry.isIntersecting) {
						// Do something when the element is visible in the viewport
						entry.target.style.opacity = 1

						// Unobserve the target element so that the callback is not called again
						observer.unobserve(entry.target)
					}
				})
			},
			{
				root: null, // Use the viewport as the root element
				threshold: 0.5, // Call the callback when at least 50% of the element is visible
				rootMargin: '0px' // No margin around the root element
			}
		)

		elems.length !== 0 &&
			elems.forEach((elem) => {
				observer.observe(elem)
			})
	}, [])

	const history = useHistory()

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

			const result = await res.json()
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
		<div className="app-container" id="MyComponent">
			<div className="home-banner">
				<div className="inner-div">
					<div className="absolute-cont text-center">
						<p
							className="headline-txt yellow-green-txt mt-5 mb-0 slide-in-fwd-left"
							data-animation="slide-in-fwd-left"
						>
							All-in-one check writer for everyone
						</p>
						<h1
							className="primary-header text-white my-2 slide-in-fwd-left"
							data-animation="slide-in-fwd-left"
						>
							Smart and simple <br /> check writer
						</h1>
						<p
							className="subheadline-txt slide-in-fwd-right"
							data-animation="slide-in-fwd-right"
						>
							Create and print checks with ease using our check writer
							application.
						</p>
						{/* <div
							className="input-group slide-in-fwd-right"
							data-animation="slide-in-fwd-right"
						>
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
													<linearGradient id="my-cool-gradient" x2="1" y2="1">
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
						</div> */}
						<div className="checks-img">
							<img src={checksImg} alt="checks-img" />
						</div>
					</div>
				</div>
			</div>
			<div className="intro-section text-center py-5">
				<div className="container mx-auto pt-5">
					<p className="headline-txt yellow-green-txt">Why Synccheck ?</p>
					<h2
						className="section-head text-white fw-bold slide-in-fwd-bottom"
						data-animation="slide-in-fwd-bottom"
					>
						The only check writer app <br />
						you’ll ever need
					</h2>
					<p
						className="subheadline-txt slide-in-fwd-right"
						data-animation="slide-in-fwd-right"
					>
						Our check writer is user-friendly and easy to use.
					</p>
					<div className="features d-flex flex-row align-items-center justify-content-center mt-5 pt-5">
						<div
							className="writer-feature text-center d-flex align-items-center justify-content-center flex-column my-3 slide-in-fwd-top"
							data-animation="slide-in-fwd-top"
						>
							<div className="icon light-bg d-flex align-items-center justify-content-center my-3">
								{comingSoonIcon}
							</div>
							<h3 className="feature-head text-white my-3">Address Book</h3>
							<p className="feature-desc fs-6">
								Stores contact information of frequently used payees, making it
								easy to write and print checks quickly.
							</p>
						</div>
						<div
							className="writer-feature text-center d-flex align-items-center justify-content-center flex-column my-3 slide-in-fwd-bottom"
							data-animation="slide-in-fwd-bottom"
						>
							<div className="icon light-bg d-flex align-items-center justify-content-center my-3">
								{cloudIcon}
							</div>
							<h3 className="feature-head text-white my-3">Cloud Sync</h3>
							<p className="feature-desc fs-6">
								Allows users to access their check writing data from multiple
								devices and locations.
							</p>
						</div>
						<div
							className="writer-feature text-center d-flex align-items-center justify-content-center flex-column my-3 slide-in-fwd-top"
							data-animation="slide-in-fwd-top"
						>
							<div className="icon light-bg d-flex align-items-center justify-content-center my-3">
								{printerIcon}
							</div>
							<h3 className="feature-head text-white my-3">Check Printing</h3>
							<p className="feature-desc fs-6">
								Ability to print multiple checks at once, saving time and
								improving efficiency.
							</p>
						</div>
						<div
							className="writer-feature text-center d-flex align-items-center justify-content-center flex-column my-3 slide-in-fwd-bottom"
							data-animation="slide-in-fwd-bottom"
						>
							<div className="icon light-bg d-flex align-items-center justify-content-center my-3">
								{layoutIcon}
							</div>
							<h3 className="feature-head text-white my-3">
								Customizable Layout
							</h3>
							<p className="feature-desc fs-6">
								Custom layout to make check writing process more personalised
								and user-friendly.
							</p>
						</div>
					</div>
				</div>
			</div>
			<div className="advantage-section position-relative">
				<div className="container pt-5">
					<div className="row">
						<div className="col-12 col-md-8 col-lg-7">
							<h2
								className="section-head text-black text-start slide-in-fwd-bottom"
								data-animation="slide-in-fwd-bottom"
							>
								Super convenient check writer
							</h2>
							<p
								className="headline-txt text-left slide-in-fwd-bottom"
								data-animation="slide-in-fwd-bottom"
							>
								The ultimate solution for hassle-free transactions. With its
								intuitive interface and seamless integration, it simplifies
								check-writing tasks, saving you time and effort. Say goodbye to
								manual calculations and enjoy a smooth and efficient payment
								experience.
							</p>
						</div>
						<div className="col-12 col-md-4 col-lg-5"></div>
					</div>

					<div className="row mt-5">
						<div
							className="col-12 col-md-6 slide-in-fwd-left"
							data-animation="slide-in-fwd-left"
						>
							<ul
								className="nav nav-tabs features-tabs d-flex flex-column justify-content-start"
								id="myTab"
								role="tablist"
							>
								<li className="feature-tab-item" role="presentation">
									<div
										className="active feature-tab-nav"
										id="home-tab"
										data-bs-toggle="tab"
										data-bs-target="#home-tab-pane"
										role="tab"
										aria-controls="home-tab-pane"
										aria-selected="true"
									>
										<h4 className="d-flex align-items-center justify-content-start">
											<span className="icon d-flex justify-content-center align-items-center">
												{moneyIcon}
											</span>
											Check Printing
										</h4>
										<p>
											Check printing feature allows users to print multiple
											checks at once, saving time and improving efficiency.
										</p>
									</div>
								</li>
								<li className="feature-tab-item" role="presentation">
									<div
										className="feature-tab-nav"
										id="profile-tab"
										data-bs-toggle="tab"
										data-bs-target="#profile-tab-pane"
										role="tab"
										aria-controls="profile-tab-pane"
										aria-selected="false"
									>
										<h4 className="d-flex align-items-center justify-content-start">
											<span className="icon d-flex justify-content-center align-items-center">
												{cloudIcon}
											</span>
											Cloud Sync
										</h4>
										<p>
											Cloud Sync feature that allows users to access their check
											writing data from multiple devices and locations.
										</p>
									</div>
								</li>
								<li className="feature-tab-item" role="presentation">
									<div
										className="feature-tab-nav"
										id="contact-tab"
										data-bs-toggle="tab"
										data-bs-target="#contact-tab-pane"
										role="tab"
										aria-controls="contact-tab-pane"
										aria-selected="false"
									>
										<h4 className="d-flex align-items-center justify-content-start">
											<span className="icon d-flex justify-content-center align-items-center">
												{cancelIcon}
											</span>
											Instant Check Cancellation
										</h4>
										<p>
											Instant check cancellation feature allows users to cancel
											checks that have not been processed yet, helping to
											prevent fraud or other financial risks.
										</p>
									</div>
								</li>
							</ul>
						</div>
						<div
							className="col-12 col-md-6 d-flex align-items-center justify-content-center slide-in-fwd-right"
							data-animation="slide-in-fwd-right"
						>
							<div
								className="tab-content features-tabs-content"
								id="myTabContent"
							>
								<div
									className="tab-pane fade show active"
									id="home-tab-pane"
									role="tabpanel"
									aria-labelledby="home-tab"
									tabIndex="0"
								>
									<img src={tabImg1} alt="" />
								</div>
								<div
									className="tab-pane fade"
									id="profile-tab-pane"
									role="tabpanel"
									aria-labelledby="profile-tab"
									tabIndex="0"
								>
									<img src={tabImg2} alt="" />
								</div>
								<div
									className="tab-pane fade"
									id="contact-tab-pane"
									role="tabpanel"
									aria-labelledby="contact-tab"
									tabIndex="0"
								>
									<img src={tabImg3} alt="" />
								</div>
							</div>
						</div>
					</div>
					<div
						className="row mt-5 slide-in-fwd-bottom"
						data-animation="slide-in-fwd-bottom"
					>
						<div className="col-12 col-md-6 d-flex align-items-center justify-content-center">
							<div className="img-div">
								<img src={signCheckImg} alt="" />
							</div>
						</div>
						<div className="col-12 col-md-6 py-5">
							<div className="section-content">
								<h2 className="section-head text-black text-start">
									Save signatures and be in complete control over your checks
								</h2>
								<p className="headline-txt">
									Allow users to sign checks electronically using a mouse, touch
									screen, or stylus, and save their signatures for future use.
								</p>
							</div>
						</div>
					</div>
					<div
						className="row mt-5 slide-in-fwd-bottom"
						data-animation="slide-in-fwd-bottom"
					>
						<div className="col-12 col-md-6 py-5">
							<div className="section-content">
								<h2 className="section-head text-black text-start">
									Email or print - it’s your choice
								</h2>
								<p className="headline-txt">
									Whether you’re at home, at work, or on the go, our Sync check
									platform is accessible from your computer, tablet, or mobile
									device. With Sync check you can print or email your checks on
									the go.
								</p>
							</div>
						</div>

						<div className="col-12 col-md-6 d-flex align-items-center justify-content-center">
							<div className="img-div">
								<img src={printEmailImg} alt="" />
							</div>
						</div>
					</div>
				</div>
			</div>
			<div className="message-section position-relative">
				<div
					className="container slide-in-fwd-bottom"
					data-animation="slide-in-fwd-bottom"
				>
					<div className="quote-div d-flex align-items-center justify-content-between position-relative">
						<div
							className="user-img slide-in-fwd-left"
							data-animation="slide-in-fwd-left"
						>
							<img src={userImg} alt="user-img" className=" rounded-4" />
						</div>
						<div
							className="feedback slide-in-fwd-right"
							data-animation="slide-in-fwd-right"
						>
							<div className="logo mb-4">
								<h2 className="logo-replace-txt text-white fs-2 fw-bold">
									CoFinance
									{/* <img src={coFinanceLogo} alt="" /> */}
								</h2>
							</div>
							<p className="qoute-txt fs-4 fw-semibold text-white">
								“I’ve recently tried out check writer software and I was
								pleasantly surprised by its user-friendly interface and
								customizable features. It allowed me to easily write and print
								checks, store payee information, and track expenses.”
							</p>
							<p className="headline-txt">Moe B., CEO CoFinance</p>
						</div>
					</div>
				</div>
			</div>
			<div className="integration-section">
				<div className="container">
					<div className="row">
						<div className="col-12 col-md-6 col-lg-5">
							<div
								className="integration-info slide-in-fwd-bottom"
								data-animation="slide-in-fwd-bottom"
							>
								<div className="icon light-bg-2 d-flex align-items-center justify-content-center">
									{moneyIcon}
								</div>
								<h2 className="section-head text-black text-start mt-4 mb-3">
									Some of banks who accept us
								</h2>
								<p className="subheadline-txt">
									Our checks are accepted by the world's leading banks, giving
									you the peace of mind that your transactions will be processed
									smoothly and reliably.
								</p>
								{/* <button className="common-btn dark-btn border-0">
									Learn More
								</button> */}
							</div>
						</div>
						<div className="col-12 col-md-6 col-lg-7">
							<div className="companies row">
								<div className="col-12 col-md-6 py-4 border-end border-bottom border-dark">
									<div
										className="company slide-in-fwd-right"
										data-animation="slide-in-fwd-right"
									>
										<div className="logo d-flex align-items-center justify-content-center">
											{/* <h2 className="logo-replace-txt fs-2 fw-bold">LOGO</h2> */}
											<img src={bankLogo1} alt="" className="bank-logo" />
										</div>
										{/* <p className="headline-txt mb-5">
											Lorem ipsum dolor sit amet, consectetur adipiscing elit.
											Fusce vitae vestibulum orci, sit amet.
										</p> */}
									</div>
								</div>
								<div className="col-12 col-md-6 py-4 border-bottom border-dark">
									<div
										className="company slide-in-fwd-left"
										data-animation="slide-in-fwd-left"
									>
										<div className="logo d-flex align-items-center justify-content-center">
											{/* <h2 className="logo-replace-txt fs-2 fw-bold">LOGO</h2> */}
											<img src={bankLogo2} alt="" className="bank-logo" />
										</div>
										{/* <p className="headline-txt mb-5">
											Lorem ipsum dolor sit amet, consectetur adipiscing elit.
											Fusce vitae vestibulum orci, sit amet.
										</p> */}
									</div>
								</div>
								<div className="col-12 col-md-6 py-4 border-end border-dark">
									<div
										className="company slide-in-fwd-right"
										data-animation="slide-in-fwd-right"
										style={{
											height: '100%'
										}}
									>
										<div
											className="logo d-flex align-items-center justify-content-center"
											style={{
												height: '100%'
											}}
										>
											{/* <h2 className="logo-replace-txt fs-2 fw-bold">LOGO</h2> */}
											<img src={bankLogo3} alt="" className="bank-logo" />
										</div>
										{/* <p className="headline-txt mb-5">
											Lorem ipsum dolor sit amet, consectetur adipiscing elit.
											Fusce vitae vestibulum orci, sit amet.
										</p> */}
									</div>
								</div>
								<div className="col-12 col-md-6 py-4">
									<div
										className="company slide-in-fwd-left"
										data-animation="slide-in-fwd-left"
									>
										<div className="logo d-flex align-items-center justify-content-center">
											{/* <h2 className="logo-replace-txt fs-2 fw-bold">LOGO</h2> */}
											<img src={bankLogo4} alt="" className="bank-logo" />
										</div>
										{/* <p className="headline-txt mb-5">
											Lorem ipsum dolor sit amet, consectetur adipiscing elit.
											Fusce vitae vestibulum orci, sit amet.
										</p> */}
									</div>
								</div>
							</div>
						</div>
					</div>
				</div>
			</div>
		</div>
	)
}

export default Home
