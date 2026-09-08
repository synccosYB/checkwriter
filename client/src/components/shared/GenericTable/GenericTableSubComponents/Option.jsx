import { TextField } from '@mui/material'
import React from 'react'

const Option = ({ data, _key, sendFilter, filterMap, columnData, clear }) => {
        let column_type = columnData.find((item) => item.value === _key).type

        let uniqueKey = null

        const safeData = Array.isArray(data) ? data : []
        if (column_type !== 'html') {
                uniqueKey = [...new Set(safeData.map((item) => item[_key]))]
        } else {
                uniqueKey = [...new Set(safeData.map((item) => item[_key]['value']))]
        }

        const [selectedFilteredData, setSelectedFilteredData] = React.useState(
                filterMap.has(_key) ? filterMap.get(_key)?.filter : []
        )

        const [renderUniqueKey, setRenderUniqueKey] = React.useState([...uniqueKey])

        const handleChange = (event) => {
                const {
                        target: { value }
                } = event

                let temp = selectedFilteredData
                const index = temp.indexOf(value)

                if (index === -1) {
                        temp.push(value)
                } else {
                        temp.splice(index, 1)
                }

                setSelectedFilteredData(
                        temp
                )
                if (temp.length > 0) {
                        sendFilter(temp, _key, 'option')
                } else {
                        clearFilter()
                }
        }

        const clearFilter = () => {
                setSelectedFilteredData([])
                clear(_key)
        }

        const handleInputChange = (event) => {
                let match = event.target.value
                let temp = null
                if (event.target.value === '') {
                        temp = uniqueKey
                } else {
                        temp = uniqueKey.filter((item) =>
                                item.toLowerCase().startsWith(match.toLowerCase())
                        )
                }
                setRenderUniqueKey(temp)
        }

        return (
                <div className="OptionMenu pb-2">
                        <div
                                className="list-group"
                                style={{ width: 200, padding: '10px', paddingBottom: '0' }}
                        >
                                <TextField
                                        type="text"
                                        name="search"
                                        label="Search"
                                        control="input"
                                        className="mb-2"
                                        onChange={handleInputChange}
                                        // as={MyTextField}
                                        // autoFocus={true}
                                        sx={{
                                                '& .MuiOutlinedInput-root': {
                                                        '.MuiInputBase-input': {
                                                                padding: '9px 15px'
                                                        },

                                                        '& fieldset': {
                                                                borderColor: '#C8CBCB',
                                                                borderRadius: '4px',
                                                                '& legend': {
                                                                        fontSize: '0.65em',
                                                                        '& span': {
                                                                                paddingRight: '1px',
                                                                                paddingLeft: '1px'
                                                                        }
                                                                }
                                                        },
                                                        '&:hover fieldset': {
                                                                borderColor: '#C8CBCB'
                                                        },
                                                        '&.Mui-focused fieldset': {
                                                                borderColor: 'green'
                                                        },
                                                        '&.Mui-focused': {
                                                                //color: '#1e3a5f' // set your custom color here
                                                        }
                                                },
                                                '& .MuiInputLabel-root': {
                                                        color: '#969696',
                                                        fontSize: '12px',
                                                        fontWeight: '500',
                                                        transform: 'translate(14px, 13px) scale(1)',

                                                        '&.MuiFormLabel-filled': {
                                                                transform: 'translate(14px, -7px) scale(0.75)'
                                                        },

                                                        '&.Mui-focused': {
                                                                color: '#1e3a5f',
                                                                transform: 'translate(14px, -7px) scale(0.75)'
                                                        }
                                                }
                                        }}
                                />
                                {renderUniqueKey?.map((item) => (
                                        <label
                                                className="list-group-item d-flex align-items-center justify-content-start px-2 py-2"
                                                style={{ border: 0, fontSize: '12px' }}
                                        >
                                                <input
                                                        className="form-check-input m-0"
                                                        value={item}
                                                        type="checkbox"
                                                        onChange={handleChange}
                                                        checked={selectedFilteredData.indexOf(item) !== -1}
                                                />
                                                <p
                                                        style={{
                                                                marginLeft: '10px',
                                                                marginBottom: '0',
                                                                textTransform: 'capitalize'
                                                        }}
                                                >
                                                        {item === 'DRAFT'
                                                                ? 'Draft'
                                                                : item === 'UNCLEARED'
                                                                ? 'Uncleared'
                                                                : item === 'CLEARED'
                                                                ? 'Cleared'
                                                                : item === 'VOID'
                                                                ? 'Void'
                                                                : item === 'PRINTED'
                                                                ? 'Printed'
                                                                : item === 'EMAILED'
                                                                ? 'Emailed'
                                                                : item}
                                                </p>
                                        </label>
                                ))}
                        </div>
                        <div className="row">
                                <div className="row d-flex justify-content-start">
                                        {filterMap.get(_key) && (
                                                <div className="col-auto">
                                                        <p
                                                                className="text-danger btn clearFilter"
                                                                style={{
                                                                        marginTop: '0px',
                                                                        marginLeft: '8px',
                                                                        fontSize: '12px',
                                                                        marginBottom: '0px'
                                                                }}
                                                                onClick={clearFilter}
                                                        >
                                                                Clear Filter
                                                        </p>
                                                </div>
                                        )}
                                </div>
                        </div>
                </div>
        )
}

export default Option
