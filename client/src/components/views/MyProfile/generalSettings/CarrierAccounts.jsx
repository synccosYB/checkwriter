import React, { useEffect, useState } from 'react'
import { Formik, Form } from 'formik'
import * as Yup from 'yup'
import FormComponents from '../../../shared/forms'
import ButtonComponent from '../../../shared/ButtonComponent'
import { useCarrierAccounts, useUpdateCarrierAccounts } from '../../../../API/users/useCarrierAccounts'

const validationSchema = Yup.object({
        upsAccountNumber: Yup.string(),
        fedexAccountNumber: Yup.string(),
})

const CarrierAccounts = () => {
        const { data: carrierData } = useCarrierAccounts()
        const { mutate: updateCarrierAccounts, isPending } = useUpdateCarrierAccounts()
        const [initialValues, setInitialValues] = useState({
                upsAccountNumber: '',
                fedexAccountNumber: '',
        })

        useEffect(() => {
                if (carrierData) {
                        setInitialValues({
                                upsAccountNumber: carrierData.upsAccountNumber || '',
                                fedexAccountNumber: carrierData.fedexAccountNumber || '',
                        })
                }
        }, [carrierData])

        const onSubmit = (values) => {
                updateCarrierAccounts(values)
        }

        return (
                <div className="container-fluid p-0 mt-5">
                        <h4 className="fs-6 fw-semibold text-black mt-4 mb-2">Carrier Account Numbers</h4>
                        <p className="fs-14 mb-4">
                                Enter your UPS or FedEx account numbers to use your own carrier accounts for overnight check delivery. Leave blank to use the platform account.
                        </p>
                        <Formik
                                initialValues={initialValues}
                                validationSchema={validationSchema}
                                onSubmit={onSubmit}
                                enableReinitialize
                        >
                                {({ dirty }) => (
                                        <Form>
                                                <div className="row g-3 mb-3">
                                                        <div className="col-md-6">
                                                                <FormComponents
                                                                        control="input"
                                                                        type="text"
                                                                        label="UPS Account Number"
                                                                        name="upsAccountNumber"
                                                                        placeholder="Enter UPS account number"
                                                                />
                                                        </div>
                                                        <div className="col-md-6">
                                                                <FormComponents
                                                                        control="input"
                                                                        type="text"
                                                                        label="FedEx Account Number"
                                                                        name="fedexAccountNumber"
                                                                        placeholder="Enter FedEx account number"
                                                                />
                                                        </div>
                                                </div>
                                                <ButtonComponent
                                                        text={isPending ? 'Saving...' : 'Save Carrier Accounts'}
                                                        type="submit"
                                                        variant="dark"
                                                        disabled={!dirty || isPending}
                                                />
                                        </Form>
                                )}
                        </Formik>
                </div>
        )
}

export default CarrierAccounts
