import { createSlice } from '@reduxjs/toolkit'

const appData = createSlice({
	name: 'appData',
	initialState: {
		bankData: { data: {}, isUpdate: false },
		payeeData: { data: {}, isUpdate: false }
	},
	reducers: {
		setUpdateData: (state, action) => {
			const { payload } = action

			const { key, data } = payload
			return {
				...state,
				[key]: { data: { ...data }, isUpdate: true }
			}
		},
		unSetUpdateData: (state, action) => {
			const { payload } = action

			const { key } = payload
			return {
				...state,
				[key]: { data: {}, isUpdate: false }
			}
		}
	}
})

export const { setUpdateData, unSetUpdateData } = appData.actions

export default appData.reducer
