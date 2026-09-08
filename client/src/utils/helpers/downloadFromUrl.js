export const downloadFromUrl = async (url, fallbackFilename) => {
	try {
		const urlParts = url.split('?')[0].split('/')
		const filename = fallbackFilename || urlParts[urlParts.length - 1]

		const link = document.createElement('a')
		link.href = url
		link.setAttribute('download', filename)
		link.setAttribute('target', '_blank')
		link.rel = 'noopener noreferrer'
		document.body.appendChild(link)
		link.click()
		link.remove()
	} catch (err) {
		console.error('Download failed:', err)
		window.open(url, '_blank')
	}
}
