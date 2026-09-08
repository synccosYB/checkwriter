import React, { useEffect } from 'react'
import { Box, Button, CircularProgress, Typography } from '@mui/material'
import { useSelector, useDispatch } from 'react-redux'
import { styles } from './styles'
import { setShowAlert, hideAlert } from '../../redux/alertSlice'
import useUserInfo from '../../API/users/useUserInfo'
import useStopActingAsUser from '../../API/admin/useStopActingAsUser'
import { MyCookies } from '../../utils/cookies/Cookies'

const ActAsUserAlert = () => {
        const { data: userData } = useUserInfo()
        const dispatch = useDispatch()
        const { mutate: stopActingAsUser, isPending } = useStopActingAsUser()
        const { showAlert } = useSelector((state) => state.alert)

        useEffect(() => {
                const actingAsUser = MyCookies.get(MyCookies.KEYS.ACT_AS_USER)
                if (actingAsUser === 'true') {
                        dispatch(
                                setShowAlert(
                                        `You are now acting as user  ${userData?.firstName} ${userData?.lastName}`
                                )
                        )
                } else {
                        dispatch(hideAlert())
                }
        }, [dispatch, userData])
        return (
                <>
                        {showAlert && (
                                <Box sx={styles.container}>
                                        <Typography
                                                sx={styles.message}
                                                color="white"
                                        >{`You are now acting as user  ${userData?.firstName || ''} ${
                                                userData?.lastName || ''
                                        }`}</Typography>
                                        <Button
                                                onClick={() => stopActingAsUser()}
                                                sx={styles.exitButton}
                                                disabled={isPending}
                                                endIcon={isPending && <CircularProgress size={'14px'} />}
                                        >
                                                Exit
                                        </Button>
                                </Box>
                        )}
                </>
        )
}

export default ActAsUserAlert
