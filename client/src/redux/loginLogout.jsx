import { createSlice } from '@reduxjs/toolkit'
import { MyCookies } from '../utils/cookies/Cookies'

export const loginLogout = createSlice({
	name: 'loginLogout',
	initialState: {
		token: '',
		isLoggedIn: false,
		isRemember: false
	},
	reducers: {
		login: (state, action) => {
			return {
				...state,
				...action.payload,
				isLoggedIn: true
			}
		},
		logOut: (state) => {
			return {
				...state,
				token: '',
				isLoggedIn: false
			}
		},
		setIsRemember: (state) => {
			return {
				...state,
				isRemember: true
			}
		},
		checkData: (state, action) => {
			let token = MyCookies.get(MyCookies.KEYS.ACCESS_TOKEN) || ''
			let loggedStatus = MyCookies.get(MyCookies.KEYS.USER_STATUS)
				? true
				: false

			return {
				...state,
				token,
				isLoggedIn: loggedStatus
			}
		}
	}
})

export const { login, logOut, checkData, setIsRemember } = loginLogout.actions

export default loginLogout.reducer
