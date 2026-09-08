import React, { useState } from 'react'
import useCheck from '../../../../../API/checks/useCheck'
import { DetailModal } from '../DetailModal'
import useTags from '../../../../../API/tags/useTags'
import { EmailCheckModal } from '../EmailCheckModal'
import { SendMailModal } from '../SendMailModal'
import { getCheckIdsForPrint } from '../../..'
import usePrintMultipleChecksDownload from '../../../../../API/checks/usePrintMultipleChecksDownload'
import { GeneratingCheckModal } from '../GeneratingCheckModal'
import { AlertModal } from '../AlertModal'
import { downloadFromUrl } from '../../../../../utils/helpers/downloadFromUrl'
import useUpdateCheck from '../../../../../API/checks/useUpdateCheck'
import { CHECK_STATUS } from '../../../../../types/check.types'

interface Props {
        checkId: string
        open: boolean
        onClose: () => void
}

function CheckDetailContainerModal({ checkId, open, onClose }: Props) {
        const { data, isLoading } = useCheck({ checkId })
        const checkData: Record<string, any> = data || {}

        const { data: tagsRaw } = useTags()
        const tags = Array.isArray(tagsRaw) ? tagsRaw : []

        const { mutate: printCheckMultiple, isPending: isPrintingCheckMultiple } =
                usePrintMultipleChecksDownload()
        const { mutate: updateCheck, isPending: isUpdatingCheck } = useUpdateCheck()

        const [openEmailCheckDialog, setOpenEmailCheckDialog] = useState(false)
        const [openDialog, setOpenDialog] = useState(false)
        const [openGeneratingCheckDialog, setOpenGeneratingCheckDialog] =
                useState(false)
        const [alertDialogValue, setAlertDialogValue] = useState('')
        const [openAlertDialog, setOpenAlertDialog] = useState(false)
        const [alertType, setAlertType] = useState(null)

        const handleOpenDownloadCheckAlert = () => {
                setOpenGeneratingCheckDialog(false)
                setOpenAlertDialog(true)
                setAlertType('downloadCheck')
        }

        if (isLoading) return ''

        const handlePrint = () => {
                const checks = getCheckIdsForPrint([checkData], checkData)

                if (checks.checkIds.length === 0) return
                printChecks(checks.checkIds, checks.isBlankCheck)
        }

        const printChecks = (checkIds = [], isBlankChecks) => {
                setOpenGeneratingCheckDialog(true)

                if (!isBlankChecks) {
                        printCheckMultiple({ checkIds } as any, {
                                onSuccess: (response) => {
                                        const url = response?.url
                                        setAlertDialogValue(url)
                                        setOpenGeneratingCheckDialog(false)

                                        handleOpenDownloadCheckAlert()
                                },
                                onError: () => {
                                        setOpenGeneratingCheckDialog(false)
                                }
                        })
                }
        }

        const handleDownloadCheck = async () => {
                await downloadFromUrl(alertDialogValue)
                setOpenAlertDialog(false)
        }

        const handleVoid = () => {
                updateCheck(
                        {
                                body: { status: CHECK_STATUS.VOID, amount: 0 },
                                id: checkData?._id
                        } as any,
                        { onSuccess: () => {} }
                )
        }

        const handleCleared = () => {
                updateCheck(
                        { body: { status: CHECK_STATUS.CLEARED }, id: checkData?._id } as any,
                        { onSuccess: () => {} }
                )
        }

        if (!data || Object.keys(data).length === 0) return null

        return (
                <>
                        {open && (
                                <DetailModal
                                        open={open}
                                        onClose={onClose}
                                        checkData={checkData}
                                        handleEmailClick={() => setOpenEmailCheckDialog(true)}
                                        handleVoid={handleVoid}
                                        onCleared={handleCleared}
                                        onDelete={() => {}}
                                        onMail={() => setOpenDialog(true)}
                                        onPrint={handlePrint}
                                        tags={tags}
                                        isPrinting={isPrintingCheckMultiple}
                                        triggerOnCloseOnActions={false}
                                />
                        )}

                        {openEmailCheckDialog && (
                                <EmailCheckModal
                                        open={openEmailCheckDialog}
                                        onClose={() => {
                                                setOpenEmailCheckDialog(false)
                                        }}
                                        selectedChecks={[checkData]}
                                        onConfirm={() => {}}
                                />
                        )}
                        {openDialog && (
                                <SendMailModal
                                        open={openDialog}
                                        onClose={() => setOpenDialog(false)}
                                        checks={[checkData]}
                                />
                        )}

                        {openGeneratingCheckDialog && (
                                <GeneratingCheckModal open={openGeneratingCheckDialog} />
                        )}

                        {openAlertDialog && (
                                <AlertModal
                                        open={openAlertDialog}
                                        onClose={() => setOpenAlertDialog(false)}
                                        checkData={checkData}
                                        onConfirm={() => handleDownloadCheck()}
                                        type={alertType}
                                />
                        )}
                </>
        )
}

export default CheckDetailContainerModal
