import { CountryOption } from '../types/auth';

export function sanitizePhoneNumber(value: string) {
  return value.replace(/[^\d]/g, '');
}

export function getDisplayPhoneNumber(value: string) {
  const digits = sanitizePhoneNumber(value);

  if (digits.length <= 3) {
    return digits;
  }

  if (digits.length <= 6) {
    return `${digits.slice(0, 3)} ${digits.slice(3)}`;
  }

  return `${digits.slice(0, 3)} ${digits.slice(3, 6)} ${digits.slice(6, 10)}`;
}

export function toApiPhoneNumber(country: CountryOption, value: string) {
  const digits = sanitizePhoneNumber(value);
  return `${country.dialCode}${digits}`;
}
