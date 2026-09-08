import React, { useEffect, useState } from 'react'
import {
        Box,
        Checkbox,
        FormControl,
        InputLabel,
        ListSubheader,
        ListSubheaderProps,
        MenuItem,
        OutlinedInput,
        Select,
        styled,
        Typography
} from '@mui/material'
import { CheckboxUncheckedIcon, CheckboxCheckedIcon } from '../../../Icons'
import useUserInfo from '../../../../API/users/useUserInfo'
import useOrganizations from '../../../../API/users/organizations/useOrganizations'
import { CustomButton } from '../../../buttons/CustomButton'

interface ProfileSelectorProps {
        value: string[]
        onApply: (value: string[]) => void
}

interface Profile {
        id: string
        name: string
        type: 'Personal Account' | 'Organizations'
}

const StyledFormControl = styled(FormControl)(({ theme }) => ({
        width: '220px'
}))

const StyledSelect = styled(Select)(({ theme }) => ({
        height: '40px',
        borderRadius: '8px',
        marginRight: theme.spacing(1.5)
}))

const StyledMenuItem = styled(MenuItem)({})

const StyledTypographyLabel = styled(Typography)({
        fontSize: '14px',
        fontWeight: 600,
        color: '#00000099'
})

const StyledTypographyMenuItem = styled(Typography)({
        fontSize: '14px',
        fontWeight: 500,
        color: '#000000DE',
        textWrap: 'wrap'
})

const StyledListSubheader = styled(ListSubheader)({
        lineHeight: '40px',
        height: '40px',
        display: 'flex',
        alignItems: 'center',
        paddingLeft: '26px',
        fontSize: '14px',
        fontWeight: 600,
        color: '#00000099'
})

const ApplyButtonContainer = styled(Box)(({ theme }) => ({
        padding: theme.spacing(2, 2, 1, 2),
        display: 'flex',
        justifyContent: 'flex-end'
}))

function MyListSubheader(
        props: ListSubheaderProps & { muiSkipListHighlight: boolean }
) {
        const { muiSkipListHighlight, ...other } = props
        return <StyledListSubheader {...other} />
}

const ProfileSelector: React.FC<ProfileSelectorProps> = ({
        value,
        onApply
}) => {
        const { data: userData } = useUserInfo()
        const { data: organizationData } = useOrganizations()
        const userFirstName = userData?.firstName
        const userLastName = userData?.lastName

        const [open, setOpen] = useState(false)

        const [selectedProfiles, setSelectedProfiles] = useState<string[]>(value)

        useEffect(() => {
                setSelectedProfiles(value)
        }, [value])

        const userProfile: Profile = {
                id: userData?._id ?? 'user-account',
                name: `${userData?.firstName ?? ''} ${userData?.lastName ?? ''}`.trim(),
                type: 'Personal Account'
        }

        const orgProfiles: Profile[] =
                organizationData?.map((org) => ({
                        id: org._id,
                        name: org.organizationName,
                        type: 'Organizations'
                })) ?? []

        const profiles: Profile[] = [userProfile, ...orgProfiles]
        const isAllSelected =
                selectedProfiles.length === profiles.length && profiles.length > 0

        const handleChange = (event) => {
                const { value } = event.target
                if (value.includes('SELECT_ALL')) {
                        handleSelectAll()
                } else {
                        setSelectedProfiles(typeof value === 'string' ? value.split(',') : value)
                }
        }

        const handleSelectAll = () => {
                setSelectedProfiles(isAllSelected ? [] : profiles.map((p) => p.id))
        }

        const handleApply = () => {
                if (onApply) onApply(selectedProfiles)
                setOpen(false)
        }

        if (!organizationData) return

        const organizationsExist = organizationData.length > 0

        return (
                <StyledFormControl
                        sx={{
                                width: { xs: 'auto', md: 200 },
                                maxWidth: { xs: '110px', sm: '100%' }
                        }}
                >
                        <InputLabel>Select Profile</InputLabel>
                        <StyledSelect
                                multiple
                                open={open}
                                onOpen={() => setOpen(true)}
                                value={selectedProfiles}
                                onChange={handleChange}
                                input={<OutlinedInput label="Select Profile" />}
                                sx={{ height: '40px', borderRadius: '8px', marginRight: '0px' }}
                                onClose={() => {
                                        setOpen(false)
                                        setSelectedProfiles(value)
                                }}
                                renderValue={(selected: string[]) =>
                                        profiles
                                                .filter((p) => selected.includes(p.id))
                                                .map((p) => p.name)
                                                .join(', ')
                                }
                                MenuProps={{
                                        PaperProps: {
                                                sx: {
                                                        maxWidth: '220px',
                                                        maxHeight: '400px'
                                                }
                                        }
                                }}
                        >
                                <StyledMenuItem
                                        value="SELECT_ALL"
                                        sx={{ borderBottom: '1px solid #E2E6E9' }}
                                >
                                        <Checkbox
                                                checked={isAllSelected}
                                                icon={<CheckboxUncheckedIcon />}
                                                checkedIcon={<CheckboxCheckedIcon />}
                                        />
                                        <StyledTypographyLabel>Select All</StyledTypographyLabel>
                                </StyledMenuItem>

                                <MyListSubheader muiSkipListHighlight>Personal Account</MyListSubheader>
                                <StyledMenuItem
                                        value={userProfile.id}
                                        sx={{ borderBottom: '1px solid #E2E6E9' }}
                                >
                                        <Checkbox
                                                checked={selectedProfiles.includes(userProfile.id)}
                                                icon={<CheckboxUncheckedIcon />}
                                                checkedIcon={<CheckboxCheckedIcon />}
                                        />
                                        <StyledTypographyMenuItem>
                                                {`${userFirstName} ${userLastName}`}
                                        </StyledTypographyMenuItem>
                                </StyledMenuItem>

                                {organizationsExist && (
                                        <MyListSubheader muiSkipListHighlight>Organizations</MyListSubheader>
                                )}
                                {organizationData?.map((org, index) => (
                                        <StyledMenuItem
                                                key={org._id}
                                                value={org._id}
                                                sx={
                                                        index === organizationData.length - 1
                                                                ? { borderBottom: '1px solid #E2E6E9' }
                                                                : {}
                                                }
                                        >
                                                <Checkbox
                                                        checked={selectedProfiles.includes(org._id)}
                                                        icon={<CheckboxUncheckedIcon />}
                                                        checkedIcon={<CheckboxCheckedIcon />}
                                                />
                                                <StyledTypographyMenuItem>
                                                        {org.organizationName}
                                                </StyledTypographyMenuItem>
                                        </StyledMenuItem>
                                ))}
                                <ApplyButtonContainer>
                                        <CustomButton
                                                variant="outlined"
                                                color="primary"
                                                onClick={handleApply}
                                                startIcon={null}
                                                endIcon={null}
                                        >
                                                Apply
                                        </CustomButton>
                                </ApplyButtonContainer>
                        </StyledSelect>
                </StyledFormControl>
        )
}

export default ProfileSelector
