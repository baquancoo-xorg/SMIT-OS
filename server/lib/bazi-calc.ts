/**
 * Bát tự (Tứ Trụ) calculator. Wraps lunar-javascript.
 * Output: VN-only labels (Giáp Tý...), zero Hán tự (甲子).
 * Server-only — lunar-javascript ~400KB, never ship to FE.
 */

import { Solar } from 'lunar-javascript';

const GAN_VN: Record<string, string> = {
  '甲': 'Giáp', '乙': 'Ất', '丙': 'Bính', '丁': 'Đinh', '戊': 'Mậu',
  '己': 'Kỷ', '庚': 'Canh', '辛': 'Tân', '壬': 'Nhâm', '癸': 'Quý',
};

const ZHI_VN: Record<string, string> = {
  '子': 'Tý', '丑': 'Sửu', '寅': 'Dần', '卯': 'Mão', '辰': 'Thìn',
  '巳': 'Tỵ', '午': 'Ngọ', '未': 'Mùi', '申': 'Thân', '酉': 'Dậu',
  '戌': 'Tuất', '亥': 'Hợi',
};

const WUXING_VN: Record<string, string> = {
  '金': 'Kim', '木': 'Mộc', '水': 'Thủy', '火': 'Hỏa', '土': 'Thổ',
};

function ganToVn(ch: string): string {
  return GAN_VN[ch] ?? ch;
}

function zhiToVn(ch: string): string {
  return ZHI_VN[ch] ?? ch;
}

function pillarToVn(gan: string, zhi: string): string {
  return `${ganToVn(gan)} ${zhiToVn(zhi)}`;
}

function wuxingStringToVn(s: string | undefined): string[] {
  if (!s) return [];
  return [...s].map((ch) => WUXING_VN[ch]).filter(Boolean);
}

export interface BaziResult {
  yearPillar: string;
  monthPillar: string;
  dayPillar: string;
  hourPillar: string | null;
  element: string; // primary element from day master (Nhật Chủ)
  dayMaster: string; // Mậu Thổ, Canh Kim...
  pillarsWuxing: { year: string[]; month: string[]; day: string[]; hour: string[] };
  hourKnown: boolean;
}

export function computeBazi(birthDate: Date, birthTime?: string | null): BaziResult {
  const y = birthDate.getUTCFullYear();
  const m = birthDate.getUTCMonth() + 1;
  const d = birthDate.getUTCDate();

  let hh = 12;
  let mm = 0;
  const hourKnown = !!birthTime && /^\d{1,2}:\d{2}$/.test(birthTime);
  if (hourKnown) {
    const [hStr, mStr] = birthTime!.split(':');
    hh = Math.min(23, Math.max(0, parseInt(hStr, 10)));
    mm = Math.min(59, Math.max(0, parseInt(mStr, 10)));
  }

  const solar = Solar.fromYmdHms(y, m, d, hh, mm, 0);
  const lunar = solar.getLunar();
  const ec = lunar.getEightChar();

  const dayGanVn = ganToVn(ec.getDayGan());
  const dayWuxingVn = wuxingStringToVn(ec.getDayWuXing());
  const primaryElement = dayWuxingVn[0] ?? '';

  return {
    yearPillar: pillarToVn(ec.getYearGan(), ec.getYearZhi()),
    monthPillar: pillarToVn(ec.getMonthGan(), ec.getMonthZhi()),
    dayPillar: pillarToVn(ec.getDayGan(), ec.getDayZhi()),
    hourPillar: hourKnown ? pillarToVn(ec.getTimeGan(), ec.getTimeZhi()) : null,
    element: primaryElement,
    dayMaster: primaryElement ? `${dayGanVn} ${primaryElement}` : dayGanVn,
    pillarsWuxing: {
      year: wuxingStringToVn(ec.getYearWuXing()),
      month: wuxingStringToVn(ec.getMonthWuXing()),
      day: dayWuxingVn,
      hour: hourKnown ? wuxingStringToVn(ec.getTimeWuXing()) : [],
    },
    hourKnown,
  };
}
