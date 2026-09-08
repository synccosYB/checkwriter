import { Select, MenuItem } from '@mui/material';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import { styles } from './styles';

export const CustomSelect = ({
  value,
  onChange,
  options,
  size = 'medium',
  color = 'default',
  disabled = false,
  sx = {},
  ...props
}) => {
  const getStyles = () => {
    const selectStyles = [styles.select];
    if (color === 'primary') selectStyles.push(styles.primaryVariant);
    if (size === 'small') selectStyles.push(styles.smallSize);
    return Object.assign({}, ...selectStyles, sx);
  };

  return (
    <Select
      value={value}
      onChange={onChange}
      size={size}
      disabled={disabled}
      IconComponent={KeyboardArrowDownIcon}
      sx={getStyles()}
      MenuProps={{
        PaperProps: {
          sx: {
            '& .MuiMenuItem-root': styles.menuItem
          }
        }
      }}
      {...props}
    >
      {options.map((option) => (
        <MenuItem key={option.value} value={option.value}>
          {option.label}
        </MenuItem>
      ))}
    </Select>
  );
}; 