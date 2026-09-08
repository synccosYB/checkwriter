import config from 'config';

const { constants } = config;

export const weekDay = {
  0: 'Sun',
  1: 'Mon',
  2: 'Tue',
  3: 'Wed',
  4: 'Thu',
  5: 'Fri',
  6: 'Sat',
};

export const monthDay = {
  0: 'Jan',
  1: 'Feb',
  2: 'Mar',
  3: 'Apr',
  4: 'May',
  5: 'Jun',
  6: 'Jul',
  7: 'Aug',
  8: 'Sep',
  9: 'Oct',
  10: 'Nov',
  11: 'Dec',
};

export const checkLockIcon = `
  <svg
    width='24'
    height='22'
    viewBox='0 0 24 22'
    fill='none'
    xmlns='http://www.w3.org/2000/svg'
  >
    <path
      d='M18.3281 8.40114H18.2702V4.33977C18.2702 2.22386 15.3701 0.5 11.8108 0.5C8.25041 0.5 5.35148 2.22386 5.35148 4.33977V8.40114H5.29358C2.5376 8.40114 0.269531 9.73181 0.269531 11.3875V18.3841C0.269531 20.0227 2.50924 21.3705 5.29358 21.3705H18.3281C21.0841 21.3705 23.3521 20.0398 23.3521 18.3841V11.3875C23.3226 9.73181 21.0841 8.40114 18.3281 8.40114ZM8.8824 4.33977C8.8824 3.38409 10.2031 2.59886 11.8108 2.59886C13.4186 2.59886 14.7393 3.38409 14.7393 4.33977V8.40114H8.8824V4.33977ZM19.8212 18.3841C19.8212 18.8796 19.1598 19.2716 18.3281 19.2716H5.29358C4.46078 19.2716 3.80045 18.8796 3.80045 18.3841V11.3875C3.80045 10.8932 4.46078 10.5 5.29358 10.5H7.10215H16.49H18.2986C19.1314 10.5 19.7917 10.8932 19.7917 11.3875V18.3841H19.8212Z'
      fill='#5EA479'
    />
  </svg>
`;
export const USER_ROLES = {
  USER: 'user',
  SUPERADMIN: 'superadmin',
};

export const SYSTEMNAME = constants?.systemName || 'Synccos Check Writer';

export const ROUTING_API = 'https://www.routingnumbers.info/api/data.json';
