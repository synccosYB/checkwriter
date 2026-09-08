import { useEffect } from 'react'

const Tidio = () => {
	useEffect(() => {
		window?.tidioChatApi?.show(true)
	}, [])
	return null
}

export default Tidio
