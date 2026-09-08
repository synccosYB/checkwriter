import React from 'react'
import { Link, useHistory, useLocation } from 'react-router-dom'
import { useSelector } from 'react-redux'

import appLogo from '../../../assets/images/app-logo.png'
import appLogoDark from '../../../assets/images/app-logo-dark.png'

const Header = () => {
	const history = useHistory()
	const isLoggedIn = useSelector((state) => state.loginLogout.isLoggedIn)
	const location = useLocation()

	return (
		<div className="app-header bg-transparent" style={{ display: 'none' }}>
			<div className="app-header-inner d-flex flex-row justify-content-between align-items-center bg-transparent">
				<div className="app-logo">
					<Link to="/">
						<img
							src={location.pathname === '/' ? appLogo : appLogoDark}
							alt="App Logo"
						/>
					</Link>
				</div>
				{isLoggedIn ? (
					<button
						onClick={() => {
							history.push('/dashboard/main')
							localStorage.setItem('isFirstTimeSignUp', false)
						}}
						className={`common-btn fs-14 ${
							location.pathname === '/' ? 'border-0 ' : 'light'
						}`}
					>
						Dashboard
					</button>
				) : (
					<div className="d-flex align-items-center justify-content-center">
						<button
							onClick={() => {
								history.push('/auth/login')
							}}
							className="common-btn fs-14 border-0 me-5 bg-transparent p-0"
							style={
								location.pathname === '/'
									? { color: '#ffffff', minWidth: 'auto' }
									: { color: '#000', minWidth: 'auto' }
							}
						>
							Sign in
						</button>
						<button
							onClick={() => {
								history.push('/auth/sign-up')
							}}
							className={`common-btn fs-14 ${
								location.pathname === '/' ? 'border-0 ' : 'light'
							}`}
						>
							Get started
						</button>
					</div>
				)}
			</div>
		</div>
	)
}

export default Header
