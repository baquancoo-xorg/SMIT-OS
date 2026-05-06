import { parsePhoneNumberFromString, getCountries, getCountryCallingCode } from 'libphonenumber-js';

// Country code to name mapping
const COUNTRY_NAMES: Record<string, string> = {
  VN: 'Vietnam',
  TH: 'Thailand',
  ID: 'Indonesia',
  MY: 'Malaysia',
  SG: 'Singapore',
  PH: 'Philippines',
  IN: 'India',
  CN: 'China',
  JP: 'Japan',
  KR: 'South Korea',
  TW: 'Taiwan',
  HK: 'Hong Kong',
  US: 'United States',
  GB: 'United Kingdom',
  AU: 'Australia',
  CA: 'Canada',
  DE: 'Germany',
  FR: 'France',
  IT: 'Italy',
  ES: 'Spain',
  BR: 'Brazil',
  MX: 'Mexico',
  AR: 'Argentina',
  CL: 'Chile',
  CO: 'Colombia',
  RU: 'Russia',
  AE: 'UAE',
  SA: 'Saudi Arabia',
  NZ: 'New Zealand',
};

/**
 * Derive lead type (country name) from phone number.
 * Returns country name or 'Unknown' if cannot detect.
 */
export function deriveLeadType(phone: string | null | undefined): string {
  if (!phone || phone.trim() === '') return 'Unknown';

  try {
    // Try parsing with libphonenumber-js
    const phoneNumber = parsePhoneNumberFromString(phone);

    if (phoneNumber?.country) {
      return COUNTRY_NAMES[phoneNumber.country] ?? phoneNumber.country;
    }

    // Fallback: detect from country calling code prefix
    const cleaned = phone.replace(/[^0-9+]/g, '');

    if (cleaned.startsWith('+84') || cleaned.startsWith('84')) return 'Vietnam';
    if (cleaned.startsWith('+66') || cleaned.startsWith('66')) return 'Thailand';
    if (cleaned.startsWith('+62') || cleaned.startsWith('62')) return 'Indonesia';
    if (cleaned.startsWith('+60') || cleaned.startsWith('60')) return 'Malaysia';
    if (cleaned.startsWith('+65') || cleaned.startsWith('65')) return 'Singapore';
    if (cleaned.startsWith('+63') || cleaned.startsWith('63')) return 'Philippines';
    if (cleaned.startsWith('+91') || cleaned.startsWith('91')) return 'India';
    if (cleaned.startsWith('+86') || cleaned.startsWith('86')) return 'China';
    if (cleaned.startsWith('+81') || cleaned.startsWith('81')) return 'Japan';
    if (cleaned.startsWith('+82') || cleaned.startsWith('82')) return 'South Korea';
    if (cleaned.startsWith('+1')) return 'United States';
    if (cleaned.startsWith('+44')) return 'United Kingdom';
    if (cleaned.startsWith('+61')) return 'Australia';
    if (cleaned.startsWith('+55')) return 'Brazil';
    if (cleaned.startsWith('+54')) return 'Argentina';

    return 'Unknown';
  } catch {
    return 'Unknown';
  }
}

/**
 * Load lead type map for batch of subscriber IDs.
 * Queries CRM for phone numbers and derives country.
 */
export async function loadLeadTypeMap(
  crmSubIds: bigint[],
  phoneBySubId: Map<bigint, string | null>
): Promise<Map<bigint, string>> {
  const result = new Map<bigint, string>();

  for (const subId of crmSubIds) {
    const phone = phoneBySubId.get(subId);
    result.set(subId, deriveLeadType(phone));
  }

  return result;
}
