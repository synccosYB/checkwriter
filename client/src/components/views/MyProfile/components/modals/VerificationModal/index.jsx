import { useEffect, useState } from 'react';
import {
    Box,
    Typography,
    Button,
    Radio,
    RadioGroup,
    FormControlLabel,
    Divider,
} from '@mui/material';
import { CustomDialog } from '../../../../../components/dialog/CustomDialog';
import { GuardIcon, EmailIcon, MarkIcon } from '../../../../../components/Icons';
import { maskEmail, maskPhone } from '../../../../../common/utils';
import { styles } from './styles';
import PhoneInput from 'react-phone-input-2';

const emails = [
    {
        id: 1,
        email: 'test@example.com',
        default: true
    },
    {
        id: 2,
        email: 'test2@example.com',
        default: false
    },
    {
        id: 3,
        email: 'test3@example.com',
        default: false
    }

];

const phones = [
    {
        id: 1,
        phone: '1234567890',
        default: true
    },
    {
        id: 2,
        phone: '4442342342',
        default: false
    },

    {
        id: 3,
        phone: '1234567894',
        default: false
    }
];

const apps = [
    {
        id: 1,
        app: 'Android App',
    },

    {
        id: 2,
        app: '  Android App',
    },

    {
        id: 3,
        app: 'iphone App',
    },
];


export const VerificationModal = ({ open, onClose }) => {
    const [step, setStep] = useState(1);
    const [selectedMethod, setSelectedMethod] = useState('');
    const [verificationCode, setVerificationCode] = useState(Array(6).fill(''));
    const [deliveryMethod, setDeliveryMethod] = useState('sms');
    const [timer, setTimer] = useState(30);
    const [timerActive, setTimerActive] = useState(false);
    const [error, setError] = useState('');

    const handleContinue = () => {
        setStep(2);
    };

    const handleBack = () => {
        setStep(1);
    };

    const handleResendCode = () => {
        setTimer(30);
        setTimerActive(true);
    };

    const handleVerifyCode = () => {
        onClose();
    };

    const handleVerificationCodeChange = (index, value, code, setCode) => {
        if (!/^\d*$/.test(value)) return;

        const newCode = [...code];
        newCode[index] = value;
        setCode(newCode);

        if (value && index < 5) {
            const nextInput = document.querySelector(`input[data-index="${index + 1}"]`);
            if (nextInput) nextInput.focus();
        }
    };

    const handleVerificationCodeKeyDown = (index, e) => {
        if (e.key === 'Backspace' && !verificationCode[index] && index > 0) {
            const prevInput = document.querySelector(`input[data-index="${index - 1}"]`);
            if (prevInput) prevInput.focus();
        }
    };

    useEffect(() => {
        if (step === 2) {
            setTimerActive(true);
        }
    }, [step]);

    /** this is mock verification code */
    useEffect(() => {
        if (verificationCode.every(code => code !== '')) {
            if (verificationCode[5] !== '$') {
                setError('Invalid code');
            }
        } else {
            setError('');
        }
    }, [verificationCode]);

    const renderMethodSelection = () => (
        <Box sx={styles.content}>
            <RadioGroup
                value={selectedMethod}
                onChange={(e) => setSelectedMethod(e.target.value)}
            >
                <Box sx={styles.section}>
                    <Typography sx={styles.sectionTitle}>
                        Authenticator App Codes
                    </Typography>
                    <Box sx={styles.appListContainer}>
                        {apps.map((app) => (<FormControlLabel
                            key={app.id}
                            value={app.app}
                            control={<Radio sx={styles.radio} />}
                            label={
                                <Box sx={styles.appInfo}>
                                    <GuardIcon />
                                    <Box sx={styles.appTextContainer}>
                                        <MarkIcon />
                                        <Typography sx={styles.appName}>{app.app}</Typography>
                                    </Box>
                                </Box>
                            }
                        />))}
                    </Box>
                </Box>

                <Divider sx={styles.divider} />
                <Box sx={styles.section}>
                    <Typography sx={styles.sectionTitle}>
                        Email Verification
                    </Typography>
                    <Box sx={styles.emailListContainer}>
                        {emails.map((email) => (<FormControlLabel
                            key={email.id}
                            value={email.email}
                            control={<Radio sx={styles.radio} />}

                            label={
                                <Box sx={styles.methodLabel}>
                                    <EmailIcon />
                                    <Typography>{maskEmail(email.email)}</Typography>
                                    {email.default && <Box sx={styles.appTextContainer}>
                                        <MarkIcon />
                                        <Typography sx={styles.appName}>Home Email</Typography>
                                    </Box>}
                                </Box>
                            }
                        />))}
                    </Box>
                </Box>

                <Divider sx={styles.divider} />

                <Box sx={styles.section}>
                    <Typography sx={styles.sectionTitle}>
                        Phone Verification
                    </Typography>
                    <Box sx={styles.phoneListContainer}>
                        {phones.map((phone) => (<FormControlLabel
                            value={phone.phone}
                            key={phone.id}
                            control={<Radio sx={styles.radio} />}
                            label={

                                <Box sx={styles.phoneInfo}>
                                    <Box sx={styles.phoneFlag}>
                                        <PhoneInput
                                            country={'uk'}
                                            value={phone.phone}
                                            disabled
                                            enableSearch={false}
                                            containerStyle={styles.flagContainer}
                                            inputStyle={styles.flagInput}
                                            buttonStyle={styles.flagButton}
                                            disableDropdown
                                            placeholder=""
                                            specialLabel=""
                                            preferredCountries={['us']}
                                        />
                                    </Box>
                                    <Typography sx={styles.phoneNumber}>+{maskPhone(phone.phone)}</Typography>
                                    {phone.default && <Box sx={styles.appTextContainer}>
                                        <MarkIcon />
                                        <Typography sx={styles.appName}>Official Number</Typography>
                                    </Box>}

                                </Box>
                            }

                        />))}
                    </Box>
                </Box>
            </RadioGroup>
            <Box sx={styles.section}>
                <Typography sx={styles.sectionTitle}>
                    Delivery Method
                </Typography>

                <Typography sx={styles.setionDescription}>
                    You'll receive a digit code via SMS or voice call. Make sure your phone is nearby.
                </Typography>

                <RadioGroup
                    value={deliveryMethod}
                    onChange={(e) => setDeliveryMethod(e.target.value)}
                >
                    <Box sx={styles.deliveryGroup}>
                        <FormControlLabel
                            value="sms"
                            control={<Radio sx={styles.radio} />}
                            label="Text Message"
                        />
                        <FormControlLabel
                            value="call"
                            control={<Radio sx={styles.radio} />}
                            label="Phone Call"
                        />
                    </Box>
                </RadioGroup>
            </Box>
        </Box>
    );

    const renderVerification = () => (
        <>
            <Typography sx={styles.description}>
                Your phone number for verification is: {maskPhone('1234567890')}. Please check your messages and enter the verification code to proceed.
            </Typography>

            <Box sx={styles.verificationSection}>
                <Box sx={styles.codeInputContainer}>
                    {verificationCode.map((digit, index) => (
                        <Box
                            key={index}
                            component="input"
                            type="text"
                            maxLength={1}
                            value={digit}
                            data-index={index}
                            onChange={(e) => handleVerificationCodeChange(index, e.target.value, verificationCode, setVerificationCode)}
                            onKeyDown={(e) => handleVerificationCodeKeyDown(index, e)}
                            sx={{ ...styles.codeInput, borderColor: error ? '#B42318 !important' : '#E5E7EB' }}
                        />
                    ))}
                </Box>

                {<Typography sx={styles.error}>{error || ''}</Typography>}
                <Box sx={styles.resendSection}>

                    {timerActive ? (
                        <>
                            <Typography sx={styles.timer}>{timer}s</Typography>
                            <Typography sx={styles.resendText}>
                                Resend Code
                            </Typography>
                        </>
                    ) : (
                        <Typography
                            onClick={handleResendCode}
                            sx={styles.resendActiveText}
                        >
                            Resend Code
                        </Typography>
                    )}
                </Box>
            </Box>
        </>
    );


    return (
        <CustomDialog
            open={open}
            onClose={onClose}
            title={step === 1 ? "Select a Verification Method" : "Verify Your Identity"}
            content={step === 1 ? renderMethodSelection() : renderVerification()}
            actions={
                <>
                    {step === 1 ? (
                        <>
                            <Button onClick={onClose} sx={styles.cancelButton}>
                                Cancel
                            </Button>
                            <Button onClick={handleContinue} sx={styles.continueButton}>
                                Continue
                            </Button>
                        </>
                    ) : (
                        <>
                            <Button onClick={handleBack} sx={styles.cancelButton}>
                                Change Verification Method
                            </Button>
                            <Button onClick={handleVerifyCode} sx={styles.verifyButton}>
                                Verify Code
                            </Button>
                        </>
                    )}
                </>
            }
        />
    );
}; 