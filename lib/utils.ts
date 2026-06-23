/**
 * Concatenates list of classes, filtering out falsy values
 */
export function cn(...inputs: (string | undefined | null | boolean | Record<string, boolean>)[]) {
  const classes: string[] = [];
  for (const input of inputs) {
    if (!input) continue;
    if (typeof input === 'string') {
      classes.push(input);
    } else if (typeof input === 'object') {
      for (const [key, value] of Object.entries(input)) {
        if (value) {
          classes.push(key);
        }
      }
    }
  }
  return classes.join(' ');
}

/**
 * Format pricing to INR (₹)
 */
export function formatINR(price: number): string {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0
  }).format(price);
}

/**
 * Validates Indian GSTIN (Goods and Services Tax Identification Number)
 * Format: 2 digits (state code), 10 alphanumeric (PAN), 1 digit (entity code), Z (default), 1 alphanumeric (check digit)
 */
export function validateGSTIN(gstin: string): boolean {
  const gstRegex = /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/;
  return gstRegex.test(gstin.toUpperCase());
}

/**
 * Simulates pincode verification and returns City & State
 * Standard pin codes in India are 6 digits.
 */
export interface PincodeDetails {
  city: string;
  state: string;
  valid: boolean;
}

export function lookupPincode(pincode: string): PincodeDetails {
  if (!/^\d{6}$/.test(pincode)) {
    return { city: '', state: '', valid: false };
  }

  // Pre-configured typical Indian zones for realistic checkout
  const firstDigit = pincode[0];
  const secondDigit = pincode[1];
  
  let state = 'Maharashtra';
  let city = 'Mumbai';

  switch (firstDigit) {
    case '1':
      if (secondDigit === '1' || secondDigit === '2' || secondDigit === '3') {
        state = 'Delhi';
        city = 'New Delhi';
      } else {
        state = 'Haryana / Punjab';
        city = 'Gurugram';
      }
      break;
    case '2':
      state = 'Uttar Pradesh';
      city = 'Noida';
      break;
    case '3':
      state = 'Gujarat';
      city = 'Ahmedabad';
      break;
    case '4':
      if (secondDigit === '0' || secondDigit === '1' || secondDigit === '2' || secondDigit === '3' || secondDigit === '4') {
        state = 'Maharashtra';
        city = 'Mumbai';
      } else {
        state = 'Madhya Pradesh';
        city = 'Bhopal';
      }
      break;
    case '5':
      if (secondDigit === '0' || secondDigit === '1' || secondDigit === '2' || secondDigit === '3') {
        state = 'Telangana';
        city = 'Hyderabad';
      } else {
        state = 'Andhra Pradesh / Karnataka';
        city = 'Bengaluru';
      }
      break;
    case '6':
      if (secondDigit === '0' || secondDigit === '1' || secondDigit === '2' || secondDigit === '3' || secondDigit === '4') {
        state = 'Tamil Nadu';
        city = 'Chennai';
      } else {
        state = 'Kerala';
        city = 'Kochi';
      }
      break;
    case '7':
      state = 'West Bengal';
      city = 'Kolkata';
      break;
    case '8':
      state = 'Bihar / Jharkhand';
      city = 'Patna';
      break;
    default:
      state = 'Karnataka';
      city = 'Bengaluru';
  }

  return { city, state, valid: true };
}

/**
 * Formats time difference to Next Drop countdown format (DD:HH:MM:SS)
 */
export function getCountdownTime(targetDate: Date): { days: string, hours: string, minutes: string, seconds: string, hasEnded: boolean } {
  const total = Date.parse(targetDate.toString()) - Date.parse(new Date().toString());
  const seconds = Math.floor((total / 1000) % 60);
  const minutes = Math.floor((total / 1000 / 60) % 60);
  const hours = Math.floor((total / (1000 * 60 * 60)) % 24);
  const days = Math.floor(total / (1000 * 60 * 60 * 24));

  return {
    days: days > 0 ? days.toString().padStart(2, '0') : '00',
    hours: hours > 0 ? hours.toString().padStart(2, '0') : '00',
    minutes: minutes > 0 ? minutes.toString().padStart(2, '0') : '00',
    seconds: seconds > 0 ? seconds.toString().padStart(2, '0') : '00',
    hasEnded: total <= 0
  };
}
