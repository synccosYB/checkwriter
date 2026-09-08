import { Button, Box } from '@mui/material'
import { styles } from './styles'

export const CustomButton = ({
        children,
        variant = 'outlined',
        color = 'primary',
        size = 'medium',
        startIcon = null,
        endIcon = null,
        onClick = null,
        sx = {},
        extraClass = undefined,
        className = undefined,
        ...props
}) => {
        const getStyles = () => {
                const buttonStyles = [styles.button]
                if (color === 'primary') buttonStyles.push(styles.primaryVariant)
                if (color === 'secondary') buttonStyles.push(styles.secondaryVariant)
                if (color === 'error') buttonStyles.push(styles.errorVariant)
                if (size === 'small') buttonStyles.push(styles.smallSize)
                return Object.assign({}, ...buttonStyles, sx)
        }

        return (
                <Button
                        variant={variant}
                        onClick={onClick}
                        size={size}
                        color={color}
                        className={[className, extraClass].filter(Boolean).join(' ') || undefined}
                        sx={getStyles()}
                        {...props}
                >
                        {startIcon}
                        <Box sx={startIcon || endIcon ? styles.buttonIconText : null}>
                                {children}
                        </Box>
                        {endIcon}
                </Button>
        )
}
