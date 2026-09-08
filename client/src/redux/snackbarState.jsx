import { createSlice } from '@reduxjs/toolkit'

const snackbarState = createSlice({
	name: 'loginLogout',
	initialState: {
		open: false,
		message: '',
		severity: 'info'
	},
	reducers: {
		updateSnackbar: (state, action) => {
			return {
				...state,
				...action.payload
			}
		},
		closeSnackbar: (state) => {
			return {
				...state,
				open: false
			}
		}
	}
})

export const { updateSnackbar, closeSnackbar } = snackbarState.actions

export default snackbarState.reducer
