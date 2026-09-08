import React from 'react'
import DatePickerInput from './DatePickerInput'
import Input from './Input'
import RadioButtons from './RadioButtons'
import TextArea from './TextArea'
import SelectComponent from './Select'
//mport UploadInput from './UploadInput'
//import TimePickerInput from './TimePickerInput'

import './forms.css'
import PhoneNumberInput from './PhoneNumberInput'
import AutocompleteComponent from './Autocomplete'
import MultipleSelectCheckmarks from './MultiSelectCheckmarks'
import NestedSelect from './NestedSelect'

const FormComponents = (props) => {
        const { control, ...rest } = props

        switch (control) {
                case 'input':
                        return <Input {...rest} />
                case 'textarea':
                        return <TextArea {...rest} />
                case 'radio':
                        return <RadioButtons {...rest} />
                case 'select':
                        return <SelectComponent {...rest} />
                case 'multi-select-checkmarks':
                        return <MultipleSelectCheckmarks {...rest} />
                case 'phone-input':
                        return <PhoneNumberInput {...rest} />
                case 'date':
                        return <DatePickerInput {...rest} />
                case 'autocomplete':
                        return <AutocompleteComponent {...rest} />
                case 'nestedSelect':
                        return <NestedSelect {...rest} />
                default:
                        return null
        }
}

export default FormComponents
