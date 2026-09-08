export const extractAddressFromResponse = (place) => {
	const newAddressDetails = {
		addressLine1: '',
		addressLine2: '',
		neighborhood: '',
		city: '',
		county: '',
		state: '',
		zipCode: '',
		zip: '',
		country: '',
		coordinates: '',
		name: ''
	}

	if (place.address_components) {
		let streetNumber = ''
		let street = ''

		place.address_components.forEach((component) => {
			const types = component.types

			if (types.includes('street_number')) {
				streetNumber = component.long_name
			}
			if (types.includes('route')) {
				street = component.long_name
			}
			if (types.includes('neighborhood')) {
				newAddressDetails.neighborhood = component.long_name
			}
			if (types.includes('locality') || types.includes('sublocality_level_1')) {
				newAddressDetails.city = component.long_name
			}
			if (types.includes('administrative_area_level_2')) {
				newAddressDetails.county = component.long_name
			}
			if (types.includes('administrative_area_level_1')) {
				newAddressDetails.state = component.short_name
			}
			if (types.includes('postal_code')) {
				newAddressDetails.zipCode = component.long_name
				newAddressDetails.zip = component.long_name
			}
			if (types.includes('country')) {
				newAddressDetails.country = component.long_name
			}
			if (types.includes('subpremise')) {
				newAddressDetails.addressLine2 = component.long_name
			}
		})

		newAddressDetails.addressLine1 = `${streetNumber} ${street}`.trim()

		if (place.geometry && place.geometry.location) {
			const lat = place.geometry.location.lat()
			const lng = place.geometry.location.lng()
			newAddressDetails.coordinates = `${lat.toFixed(6)}, ${lng.toFixed(6)}`
		}

		if (place.name) {
			const isJustAddress =
				place.name === place.formatted_address ||
				(place.address_components &&
					place.address_components.some(
						(comp) =>
							comp.types.includes('street_number') &&
							place.name.startsWith(comp.long_name)
					))

			newAddressDetails.name = isJustAddress ? '' : place.name
		}

		return newAddressDetails
	}
	return null
}
