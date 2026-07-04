import type { CulturePlate } from '../models/types';

export interface CultureValidationError {
  mediaLot?: string;
  mediaExpiry?: string;
  inoculationMethod?: string;
  tempCelsius?: string;
  co2Percentage?: string;
  humidityPercentage?: string;
}

export class CultureValidator {
  /**
   * Validate culture plate inoculation and incubation parameters.
   */
  static validatePlate(plate: Partial<CulturePlate>): { isValid: boolean; errors: CultureValidationError } {
    const errors: CultureValidationError = {};

    if (!plate.mediaLot || plate.mediaLot.trim().length < 3) {
      errors.mediaLot = 'Media Lot number is required for QC tracing.';
    }

    if (plate.mediaExpiry) {
      const exp = new Date(plate.mediaExpiry).getTime();
      if (exp < Date.now()) {
        errors.mediaExpiry = 'Selected media batch has expired.';
      }
    }

    const inoc = plate.inoculation;
    if (!inoc || !inoc.method || inoc.method.trim().length < 3) {
      errors.inoculationMethod = 'Inoculation method is required.';
    }

    const incub = plate.incubation;
    if (incub) {
      if (incub.tempCelsius < 20 || incub.tempCelsius > 45) {
        errors.tempCelsius = 'Incubation temperature must be between 20°C and 45°C.';
      }
      if (incub.co2Percentage < 0 || incub.co2Percentage > 20) {
        errors.co2Percentage = 'CO₂ percentage must be between 0% and 20%.';
      }
      if (incub.humidityPercentage < 20 || incub.humidityPercentage > 100) {
        errors.humidityPercentage = 'Incubator relative humidity must be between 20% and 100%.';
      }
    }

    return {
      isValid: Object.keys(errors).length === 0,
      errors,
    };
  }
}
export default CultureValidator;
