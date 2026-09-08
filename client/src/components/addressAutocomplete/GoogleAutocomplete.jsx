import React, { useRef } from 'react'
import { Autocomplete } from '@react-google-maps/api'
import { extractAddressFromResponse } from './helper'

function GoogleAutocomplete({ onChange }) {
	const autocompleteRef = useRef(null)

	const onPlaceChanged = () => {
		if (autocompleteRef.current) {
			const place = autocompleteRef.current.getPlace()
			const vals = extractAddressFromResponse(place)
			onChange(vals)
		}
	}

	return (
		<Autocomplete
			onLoad={(autocomplete) => {
				autocompleteRef.current = autocomplete
				autocomplete.setFields([
					'address_components',
					'geometry',
					'name',
					'formatted_address'
				])
			}}
			onPlaceChanged={onPlaceChanged}
		>
			<input
				type="text"
				placeholder="Type to search..."
				className="autocomplete-input"
			/>
		</Autocomplete>
	)
}

export default GoogleAutocomplete
