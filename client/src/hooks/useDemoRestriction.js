import { useState, useCallback } from 'react'
import useUserInfo from '../API/users/useUserInfo'

export function useDemoRestriction() {
	const [isModalOpen, setIsModalOpen] = useState(false)
	const { data: userData } = useUserInfo()

	const isDemoUser = userData?.isDemo === true

	const showDemoPopup = useCallback(() => {
		setIsModalOpen(true)
	}, [])

	const closeDemoPopup = useCallback(() => {
		setIsModalOpen(false)
	}, [])

	const guardAction = useCallback(
		(action) => {
			if (isDemoUser) {
				setIsModalOpen(true)
				return false
			}
			if (action) action()
			return true
		},
		[isDemoUser]
	)

	return {
		isDemoUser,
		isModalOpen,
		showDemoPopup,
		closeDemoPopup,
		guardAction
	}
}
