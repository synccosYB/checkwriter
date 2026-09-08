import { useEffect, useState, useRef, useCallback } from 'react'
import { MyCookies } from '../cookies/Cookies'

const INACTIVITY_TIMEOUT = 15 * 60 * 1000 // 20 seconds for testing, revert to 15 * 60 * 1000
const WARNING_THRESHOLD = 60 * 1000 // 10 seconds for testing, revert to 60 * 1000
const CHECK_INTERVAL = 5 * 1000
const ACTIVITY_THROTTLE_INTERVAL = 1000

function useInactivityLogout() {
	const [showWarning, setShowWarning] = useState(false)
	const [warningTimer, setWarningTimer] = useState(null)

	const lastUpdateRef = useRef(0)
	const isInWarningPhaseRef = useRef(false)
	const hasTimedOutRef = useRef(false)
	const isTrackingRef = useRef(true) // New: Tracks if inactivity is being tracked

	const throttledUpdateLastActivity = useCallback(() => {
		const now = Date.now()

		if (hasTimedOutRef.current || !isTrackingRef.current) return // Respect tracking state

		if (now - lastUpdateRef.current >= ACTIVITY_THROTTLE_INTERVAL) {
			MyCookies.set(MyCookies.KEYS.LAST_ACTIVITY, now.toString(), {
				sameSite: 'Strict'
			})
			lastUpdateRef.current = now
		}
	}, [])

	useEffect(() => {
		const handleActivity = () => {
			if (hasTimedOutRef.current || !isTrackingRef.current) return // Respect tracking state
			if (isInWarningPhaseRef.current) return

			throttledUpdateLastActivity()

			if (!isInWarningPhaseRef.current) {
				setShowWarning(false)
				setWarningTimer(null)
			}
		}

		if (isTrackingRef.current) {
			throttledUpdateLastActivity()

			window.addEventListener('mousemove', handleActivity)
			window.addEventListener('keydown', handleActivity)
			window.addEventListener('mousedown', handleActivity)
			window.addEventListener('touchstart', handleActivity)

			return () => {
				window.removeEventListener('mousemove', handleActivity)
				window.removeEventListener('keydown', handleActivity)
				window.removeEventListener('mousedown', handleActivity)
				window.removeEventListener('touchstart', handleActivity)
			}
		}
	}, [throttledUpdateLastActivity])

	useEffect(() => {
		const intervalId = setInterval(() => {
			if (!isTrackingRef.current) return // Respect tracking state

			const lastActivity = MyCookies.get(MyCookies.KEYS.LAST_ACTIVITY)

			if (lastActivity) {
				const lastActiveTime = parseInt(lastActivity, 10)
				const currentTime = Date.now()
				const timeDifference = currentTime - lastActiveTime
				const remainingTime = INACTIVITY_TIMEOUT - timeDifference

				if (timeDifference > INACTIVITY_TIMEOUT && !hasTimedOutRef.current) {
					hasTimedOutRef.current = true
					setWarningTimer(null)
					return
				}

				if (remainingTime <= WARNING_THRESHOLD && remainingTime > 0) {
					if (!showWarning) {
						setShowWarning(true)
						setWarningTimer(Math.round(WARNING_THRESHOLD / 1000))
					}
					isInWarningPhaseRef.current = true
				} else {
					isInWarningPhaseRef.current = false
					setWarningTimer(null)
				}
			}
		}, CHECK_INTERVAL)

		return () => clearInterval(intervalId)
	}, [showWarning])

	useEffect(() => {
		if (showWarning && warningTimer !== null) {
			const timer = setInterval(() => {
				setWarningTimer((prev) => prev - 1)
			}, 1000)

			return () => clearInterval(timer)
		}
	}, [showWarning, warningTimer])

	useEffect(() => {
		if (warningTimer === 0 && showWarning) {
			hasTimedOutRef.current = true
			setShowWarning(false)
			setWarningTimer(null)
		}
	}, [warningTimer, showWarning])

	const handleSetShowWarning = useCallback((value) => {
		setShowWarning(value)
		if (!value) {
			// Restart tracking when showWarning is set to false
			isTrackingRef.current = true
			hasTimedOutRef.current = false // Reset timeout flag
			MyCookies.set(MyCookies.KEYS.LAST_ACTIVITY, Date.now().toString(), {
				sameSite: 'Strict'
			}) //reset the last activity time.
		} else {
			isTrackingRef.current = false // Stop tracking during warning
		}
	}, [])

	return { showWarning, warningTimer, setShowWarning: handleSetShowWarning }
}

export default useInactivityLogout
