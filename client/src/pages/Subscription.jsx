import React from 'react'
import ButtonComponent from '../components/shared/ButtonComponent'
import { CircularProgress, Typography } from '@mui/material'
import useStartTrial from '../API/stripe/useStartTrial'
import useStartSubscription from '../API/stripe/useStartSubscription'
import useCheckUserScubscriptions from '../API/users/useCheckUserScubscriptions'
import useQueryParams from '../utils/hooks/useQueryParams'

const Subscription = () => {
        const { queryParams } = useQueryParams()

        const userId = queryParams.get('userId')

        const { data: subscription, isError } = useCheckUserScubscriptions(userId)
        const isTrial = subscription?.isTrialPeriod
        const isSubscribed = subscription?.isSubscribed
        const subscriptionId = subscription?.subscriptionId

        const { mutate: startTrial, isPending } = useStartTrial()
        const { mutate: startSubscription } = useStartSubscription()

        const subTitle = isTrial
                ? 'Trial'
                : isSubscribed
                ? 'Subscription Active'
                : 'You are not subscribed'

        return (
                <div
                        className="d-flex align-items-center justify-content-center"
                        style={{ height: '100vh' }}
                >
                        <div className="integration-grid1 d-flex justify-content-center">
                                <div className="row m-0 p-0 mt-5 integration-div1 col-4">
                                        <div className="col-12">
                                                <div
                                                        className=" position-relative d-flex align-items-center justify-content-center flex-column"
                                                >
                                                        <h3 className="logo">Subscription</h3>
                                                        <h3 className="logo">{subTitle}</h3>
                                                        <div className="d-flex justify-content-between mt-2">
                                                                <div
                                                                        className="text-center"
                                                                        style={{
                                                                                marginRight: '25px',
                                                                                display:
                                                                                        isTrial || isSubscribed || !!subscriptionId
                                                                                                ? 'none'
                                                                                                : 'block'
                                                                        }}
                                                                >
                                                                        <ButtonComponent
                                                                                hidden
                                                                                disabled={isError}
                                                                                text="Start Trial"
                                                                                variant="btn btn-success btn-ex-lg"
                                                                                onClick={() => {
                                                                                        if (!isError) startTrial()
                                                                                }}
                                                                                icon={isPending && <CircularProgress size="14px" />}
                                                                        />
                                                                        {/* <Typography
                                                                                variant="caption "
                                                                                className="d-block text-muted mt-1"
                                                                        >
                                                                                No credit card required
                                                                        </Typography> */}
                                                                </div>
                                                                <div style={{ marginLeft: '25px' }}>
                                                                        <ButtonComponent
                                                                                disabled={isSubscribed || isError}
                                                                                text="Subscribe"
                                                                                variant="dark btn-ex-lg"
                                                                                onClick={() => {
                                                                                        if (!isError) startSubscription()
                                                                                }}
                                                                        />
                                                                </div>
                                                        </div>
                                                </div>
                                        </div>
                                </div>
                        </div>
                </div>
        )
}

export default Subscription
