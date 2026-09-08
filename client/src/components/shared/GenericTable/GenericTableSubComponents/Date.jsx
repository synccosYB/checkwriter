import 'react-date-range/dist/styles.css' // main css file
import 'react-date-range/dist/theme/default.css' // theme css file
import { useState } from 'react'
import { DateRange } from 'react-date-range'
import { DefinedRange } from 'react-date-range'
import ButtonComponent from '../../ButtonComponent'

const Date = ({ data, _key, sendFilter, filterMap, clear }) => {
	const apply = () => {
		let value = {}
		value.startDate = state[0].startDate
		value.endDate = state[0].endDate
		sendFilter(value, _key, 'date')
	}

	const clearFilter = () => {
		clear(_key)
	}

	const [state, setState] = useState([
		{
			startDate: new window.Date(),
			endDate: new window.Date(),
			key: 'selection'
		}
	])

	return (
		<div className="container p-2">
			<div className="row">
				<div className="col-auto">
					<DefinedRange
						onChange={(item) => setState([item.selection])}
						ranges={state}
						rangeColors={['#1e3a5f', '#e8a838', '#1e3a5f']}
					/>
				</div>
				<div className="col-auto">
					<DateRange
						editableDateInputs={true}
						onChange={(item) => setState([item.selection])}
						showSelectionPreview={true}
						moveRangeOnFirstSelection={false}
						ranges={state}
						rangeColors={['#1e3a5f', '#e8a838', '#1e3a5f']}
					/>
				</div>
			</div>
			<div className="row">
				<div className="row d-flex flex-row-reverse justify-content-between">
					<div className="col-auto">
						<ButtonComponent
							type="button"
							onClick={apply}
							text="Apply"
							variant="dark"
						>
							Apply
						</ButtonComponent>
					</div>
					{filterMap.get(_key) && (
						<div className="col-auto">
							<p
								className="text-danger btn clearFilter"
								style={{ marginTop: '8px', fontSize: '14px' }}
								onClick={clearFilter}
							>
								Clear Filter
							</p>
						</div>
					)}
				</div>
			</div>
		</div>
		// <div className='container p-2' style={{ opacity: 1 }}>
		//     <div className='row mb-3'>
		//         <LocalizationProvider dateAdapter={AdapterDayjs} adapterLocale={enUS}>
		//             <DatePicker
		//                 selected={selectedStartDate}
		//                 onChange={handleStartDateChange}
		//                 dateFormat="MM-DD-YYYY"
		//                 placeholderText="Select start date"
		//             />
		//         </LocalizationProvider>
		//     </div>
		//     <div className='row mb-3'>
		//         <LocalizationProvider dateAdapter={AdapterDayjs} adapterLocale={enUS}>
		//             <DatePicker
		//                 selected={selectedEndDate}
		//                 onChange={handleEndDateChange}
		//                 dateFormat="MM-DD-YYYY"
		//                 placeholderText="Select end date"
		//             />
		//         </LocalizationProvider>
		//     </div>

		//     <StaticDateRangePicker
		//         defaultValue={[dayjs('2022-04-17'), dayjs('2022-04-21')]}
		//     />

		//     {
		//         error ?
		//             <div className='row mb-1'>
		//                 <p className='text-danger'>Start date must be lesser than End date.</p>
		//             </div> : null
		//     }

		//     <div className='row justify-content-center'>
		//         <div className="col-auto">
		//             <ButtonComponent
		//                 type="button"
		//                 onClick={apply}
		//                 text="Apply"
		//                 variant="dark"
		//                 disabled={error}
		//             >Submit</ButtonComponent>
		//         </div>
		//     </div>
		// </div>
	)
}

export default Date
