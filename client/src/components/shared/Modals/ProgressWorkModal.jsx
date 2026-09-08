import { useState } from 'react'
import { CircularProgress } from '@mui/material'

import appLogoDark from '../../../assets/images/app-logo-dark.png'
import modalImg from '../../../assets/images/modal-img.png'
import './Modal.css'

const ProgressWorkModal = () => {
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
		<div
			className="modal app-warn-modal fade"
			id="app-download-modal"
			tabIndex="-1"
			aria-labelledby="app-download-modal"
			aria-hidden="true"
		>
			<div className="modal-dialog">
				<div className="modal-content">
					<div className="modal-header justify-content-center">
						<img src={appLogoDark} alt="" />
						<button
							type="button"
							className="btn-close"
							data-bs-dismiss="modal"
							aria-label="Close"
						></button>
					</div>
					<div className="modal-body d-flex justify-content-center align-items-center flex-column py-4">
						<img className="work-img" src={modalImg} alt="" />
						<h2>Coders at Work!</h2>
					</div>
					<div className="modal-footer d-flex flex-column justify-content-center align-items-center">
						<div className="footer-inner">
							<p>
								In the meantime, Submit your email for our monthly newsletter to
								stay up to date.
							</p>
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
							</div>
							<div className="social row">
								<div className="social-icons d-flex flex-row align-items-center justify-content-center">
									<a
										href="https://www.facebook.com/profile.php?id=100090749470482"
										target="_blank"
										rel="noreferrer"
										className="icon social-anchor"
									>
										<svg
											width="24"
											height="53"
											viewBox="0 0 24 53"
											fill="none"
											xmlns="http://www.w3.org/2000/svg"
										>
											<path
												d="M5.60547 52.0203H15.8724V26.3018H23.0449L23.8031 17.6948H15.8724V12.797C15.8724 10.7683 16.2822 9.96903 18.2495 9.96903H23.8031V0.993164H16.6921C9.04827 0.993164 5.60547 4.35399 5.60547 10.8092V17.6743H0.256836V26.4043H5.60547V52.0203Z"
												fill="black"
											/>
										</svg>
									</a>
									<a
										href="https://twitter.com/synccos"
										target="_blank"
										rel="noreferrer"
										className="icon social-anchor"
									>
										<svg
											width="46"
											height="37"
											viewBox="0 0 46 37"
											fill="none"
											xmlns="http://www.w3.org/2000/svg"
										>
											<path
												d="M0.37207 32.6472C4.45015 35.2703 9.30695 36.7868 14.5121 36.7868C31.6441 36.7868 41.3168 22.3188 40.743 9.32636C42.5463 8.03531 44.1038 6.39588 45.3539 4.55153C43.6939 5.28927 41.9111 5.7811 40.0462 6.00652C41.952 4.85892 43.407 3.05555 44.1038 0.903803C42.3209 1.96943 40.3536 2.72767 38.2428 3.13752C36.5624 1.33415 34.1648 0.227539 31.5007 0.227539C25.5373 0.227539 21.1723 5.7811 22.5043 11.5601C14.8605 11.1707 8.05689 7.5025 3.50748 1.90795C1.08932 6.068 2.25741 11.4986 6.35598 14.2446C4.83951 14.2037 3.4255 13.7733 2.17544 13.097C2.07298 17.38 5.1469 21.3762 9.57336 22.2573C8.28231 22.6057 6.84781 22.6877 5.41331 22.4213C6.5814 26.0895 10.0037 28.7536 14.0408 28.8355C10.1676 31.8685 5.26986 33.2415 0.37207 32.6472Z"
												fill="black"
											/>
										</svg>
									</a>
									<a
										href="https://www.instagram.com/synccosapp/"
										target="_blank"
										rel="noreferrer"
										className="icon social-anchor"
									>
										<svg
											width="21"
											height="20"
											viewBox="0 0 21 20"
											fill="none"
											xmlns="http://www.w3.org/2000/svg"
										>
											<g clipPath="url(#clip0_735_2523)">
												<path
													d="M10.3569 1.78516C12.589 1.78516 12.8675 1.79337 13.7432 1.83445C14.6181 1.87552 15.2138 2.01272 15.7379 2.21646C16.2801 2.42513 16.7369 2.70773 17.1936 3.16368C17.6114 3.57436 17.9346 4.07113 18.1409 4.61943C18.3438 5.14274 18.4818 5.73917 18.5229 6.6141C18.5615 7.48984 18.5722 7.76834 18.5722 10.0004C18.5722 12.2325 18.5639 12.511 18.5229 13.3868C18.4818 14.2617 18.3438 14.8573 18.1409 15.3814C17.9352 15.93 17.6119 16.4269 17.1936 16.8372C16.7828 17.2548 16.2861 17.578 15.7379 17.7844C15.2146 17.9873 14.6181 18.1253 13.7432 18.1664C12.8675 18.205 12.589 18.2157 10.3569 18.2157C8.12479 18.2157 7.84629 18.2075 6.97054 18.1664C6.09561 18.1253 5.50001 17.9873 4.97587 17.7844C4.42736 17.5786 3.9305 17.2553 3.52013 16.8372C3.1023 16.4266 2.77905 15.9298 2.5729 15.3814C2.36916 14.8581 2.23197 14.2617 2.19089 13.3868C2.15228 12.511 2.1416 12.2325 2.1416 10.0004C2.1416 7.76834 2.14982 7.48984 2.19089 6.6141C2.23197 5.73835 2.36916 5.14356 2.5729 4.61943C2.77848 4.07079 3.10181 3.57389 3.52013 3.16368C3.93062 2.74571 4.42744 2.42244 4.97587 2.21646C5.50001 2.01272 6.09479 1.87552 6.97054 1.83445C7.84629 1.79584 8.12479 1.78516 10.3569 1.78516ZM10.3569 5.8928C9.26747 5.8928 8.22267 6.32556 7.45234 7.09589C6.68201 7.86623 6.24924 8.91102 6.24924 10.0004C6.24924 11.0898 6.68201 12.1346 7.45234 12.905C8.22267 13.6753 9.26747 14.1081 10.3569 14.1081C11.4463 14.1081 12.4911 13.6753 13.2614 12.905C14.0318 12.1346 14.4645 11.0898 14.4645 10.0004C14.4645 8.91102 14.0318 7.86623 13.2614 7.09589C12.4911 6.32556 11.4463 5.8928 10.3569 5.8928V5.8928ZM15.6968 5.68741C15.6968 5.41506 15.5886 5.15386 15.396 4.96128C15.2035 4.7687 14.9423 4.6605 14.6699 4.6605C14.3975 4.6605 14.1363 4.7687 13.9438 4.96128C13.7512 5.15386 13.643 5.41506 13.643 5.68741C13.643 5.95977 13.7512 6.22097 13.9438 6.41355C14.1363 6.60613 14.3975 6.71432 14.6699 6.71432C14.9423 6.71432 15.2035 6.60613 15.396 6.41355C15.5886 6.22097 15.6968 5.95977 15.6968 5.68741ZM10.3569 7.53585C11.0105 7.53585 11.6374 7.79551 12.0996 8.25771C12.5618 8.71991 12.8215 9.34679 12.8215 10.0004C12.8215 10.6541 12.5618 11.281 12.0996 11.7432C11.6374 12.2054 11.0105 12.465 10.3569 12.465C9.70323 12.465 9.07635 12.2054 8.61416 11.7432C8.15196 11.281 7.8923 10.6541 7.8923 10.0004C7.8923 9.34679 8.15196 8.71991 8.61416 8.25771C9.07635 7.79551 9.70323 7.53585 10.3569 7.53585V7.53585Z"
													fill="black"
												/>
											</g>
											<defs>
												<clipPath id="clip0_735_2523">
													<rect
														width="19.7167"
														height="19.7167"
														fill="white"
														transform="translate(0.499023 0.140625)"
													/>
												</clipPath>
											</defs>
										</svg>
									</a>
									<a
										href="https://www.linkedin.com/company/synccos-inc"
										target="_blank"
										rel="noreferrer"
										className="icon social-anchor"
									>
										<svg
											width="21"
											height="20"
											viewBox="0 0 21 20"
											fill="none"
											xmlns="http://www.w3.org/2000/svg"
										>
											<g clipPath="url(#clip0_735_2524)">
												<path
													d="M15.9956 15.2069H13.8062V11.7754C13.8062 10.9571 13.7898 9.90392 12.6643 9.90392C11.5232 9.90392 11.349 10.7945 11.349 11.7154V15.2069H9.15883V8.15078H11.2619V9.11197H11.2907C11.5848 8.55826 12.2995 7.97251 13.3675 7.97251C15.5856 7.97251 15.9964 9.43319 15.9964 11.3334V15.2069H15.9956ZM6.68604 7.18549C6.5189 7.1857 6.35337 7.15293 6.19892 7.08904C6.04448 7.02516 5.90416 6.93142 5.78602 6.8132C5.66787 6.69498 5.57422 6.5546 5.51044 6.40012C5.44665 6.24563 5.41399 6.08007 5.41431 5.91294C5.41447 5.66142 5.48922 5.41559 5.62909 5.20655C5.76897 4.9975 5.96769 4.83463 6.20013 4.73853C6.43257 4.64242 6.68828 4.6174 6.93494 4.66663C7.1816 4.71586 7.40812 4.83713 7.58586 5.0151C7.7636 5.19307 7.88458 5.41974 7.93349 5.66647C7.9824 5.91319 7.95705 6.16887 7.86064 6.40119C7.76424 6.6335 7.60111 6.83201 7.39189 6.97162C7.18266 7.11122 6.93674 7.18565 6.68521 7.18549H6.68604ZM7.7836 15.2069H5.58765V8.15078H7.78442V15.2069H7.7836ZM17.0923 2.60547H4.48927C3.88463 2.60547 3.39746 3.08195 3.39746 3.67099V16.3274C3.39746 16.9165 3.88545 17.393 4.48845 17.393H17.089C17.692 17.393 18.185 16.9165 18.185 16.3274V3.67099C18.185 3.08195 17.692 2.60547 17.089 2.60547H17.0915H17.0923Z"
													fill="black"
												/>
											</g>
											<defs>
												<clipPath id="clip0_735_2524">
													<rect
														width="19.7167"
														height="19.7167"
														fill="white"
														transform="translate(0.932617 0.140625)"
													/>
												</clipPath>
											</defs>
										</svg>
									</a>
									<a href="#" className="icon social-anchor">
										<svg
											width="53"
											height="39"
											viewBox="0 0 53 39"
											fill="none"
											xmlns="http://www.w3.org/2000/svg"
										>
											<path
												d="M51.807 6.70865C51.1922 4.41346 49.4093 2.63058 47.1346 2.01579C43.0155 0.90918 26.4983 0.90918 26.4983 0.90918C26.4983 0.90918 10.0016 0.90918 5.8825 2.01579C3.60779 2.63058 1.82491 4.41346 1.21013 6.70865C0.103516 10.8482 0.103516 19.4962 0.103516 19.4962C0.103516 19.4962 0.103516 28.1442 1.21013 32.2837C1.82491 34.5789 3.60779 36.3823 5.8825 36.9971C10.0016 38.1037 26.4983 38.1037 26.4983 38.1037C26.4983 38.1037 43.0155 38.1037 47.1346 36.9971C49.4093 36.3823 51.1922 34.5789 51.807 32.2837C52.9136 28.1442 52.9136 19.4962 52.9136 19.4962C52.9136 19.4962 52.9136 10.8482 51.807 6.70865ZM21.1087 27.3449V11.6474L34.9004 19.4962L21.1087 27.3449Z"
												fill="black"
											/>
										</svg>
									</a>
								</div>
							</div>
						</div>
					</div>
				</div>
			</div>
		</div>
	)
}

export default ProgressWorkModal
