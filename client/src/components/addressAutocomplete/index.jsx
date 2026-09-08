import React, { Suspense, lazy } from 'react'
import './AddressAutocomplete.css'

const GoogleAutocomplete = lazy(() => import('./GoogleAutocomplete'))

function AddressAutocomplete({ onChange }) {
        const isGoogleMapsAvailable =
                typeof window !== 'undefined' &&
                window.google &&
                window.google.maps &&
                window.google.maps.places &&
                window.google.maps.event &&
                typeof window.google.maps.places.Autocomplete === 'function' &&
                typeof window.google.maps.event.addListener === 'function' &&
                !window.google.maps.__stub

        if (!isGoogleMapsAvailable) {
                return (
                        <div className="address-autocomplete-container">
                                <input
                                        type="text"
                                        placeholder="Type to search..."
                                        className="autocomplete-input"
                                        onChange={(e) => onChange({ addressLine1: e.target.value })}
                                />
                        </div>
                )
        }

        return (
                <div className="address-autocomplete-container">
                        <Suspense
                                fallback={
                                        <input
                                                type="text"
                                                placeholder="Type to search..."
                                                className="autocomplete-input"
                                                disabled
                                        />
                                }
                        >
                                <GoogleAutocomplete onChange={onChange} />
                        </Suspense>
                </div>
        )
}

export default AddressAutocomplete
