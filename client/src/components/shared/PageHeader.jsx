import { HelpOutlineOutlined } from '@mui/icons-material'
import { Tooltip } from '@mui/material'
import React from 'react'

const PageHeader = (props) => {
        const { text } = props

        return (
                <div className="page-header d-flex align-items-center justify-content-between mb-4 pb-4">
                        <h3
                                className="fs-5 fw-semibold m-0"
                                style={{
                                        color: '#1a1a2e'
                                }}
                        >
                                {text}
                        </h3>
                        <Tooltip
                                title={
                                        <span>
                                                Please contact at{' '}
                                                <a
                                                        href="mailto:support@synccos.com"
                                                        target="blank"
                                                        rel="no-referrer"
                                                        className="fw-semibold text-white"
                                                >
                                                        support@synccos.com
                                                </a>{' '}
                                                for queries and support
                                        </span>
                                }
                        >
                                <HelpOutlineOutlined />
                        </Tooltip>
                </div>
        )
}

export default PageHeader
