export const SHIPPING_PLATFORM_MARGIN = 0.2;

export const UPS_EXPRESS_SERVICE_LEVELS = [
  'ups_next_day_air',
  'ups_next_day_air_early_am',
  'ups_next_day_air_saver',
  'ups_2nd_day_air',
  'ups_2nd_day_air_am',
];

export const FEDEX_EXPRESS_SERVICE_LEVELS = [
  'fedex_priority_overnight',
  'fedex_standard_overnight',
  'fedex_first_overnight',
  'fedex_2_day',
  'fedex_2_day_am',
];

export const OVERNIGHT_SERVICE_LEVELS = [
  ...UPS_EXPRESS_SERVICE_LEVELS,
  ...FEDEX_EXPRESS_SERVICE_LEVELS,
];

export const SERVICE_LEVEL_DISPLAY_NAMES = {
  ups_next_day_air: 'UPS Next Day Air',
  ups_next_day_air_early_am: 'UPS Next Day Air Early A.M.',
  ups_next_day_air_saver: 'UPS Next Day Air Saver',
  ups_2nd_day_air: 'UPS 2nd Day Air',
  ups_2nd_day_air_am: 'UPS 2nd Day Air A.M.',
  fedex_priority_overnight: 'FedEx Priority Overnight',
  fedex_standard_overnight: 'FedEx Standard Overnight',
  fedex_first_overnight: 'FedEx First Overnight',
  fedex_2_day: 'FedEx 2Day',
  fedex_2_day_am: 'FedEx 2Day A.M.',
};
