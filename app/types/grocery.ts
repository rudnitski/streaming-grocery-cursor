/**
 * Measurement types supported by the application
 */
export enum MeasurementType {
  WEIGHT = 'weight',
  VOLUME = 'volume',
  COUNT = 'count'
}

/**
 * Weight units supported by the application
 */
export enum WeightUnit {
  GRAM = 'g',
  KILOGRAM = 'kg',
  POUND = 'lb',
  OUNCE = 'oz'
}

/**
 * Volume units supported by the application
 */
export enum VolumeUnit {
  MILLILITER = 'mL',
  LITER = 'L',
  FLUID_OUNCE = 'fl oz',
  CUP = 'cup'
}

/**
 * Count units (default when no measurement is specified)
 */
export enum CountUnit {
  PIECE = 'piece',
  UNIT = 'unit'
}

/**
 * All supported measurement units
 */
export type MeasurementUnit = WeightUnit | VolumeUnit | CountUnit;

/**
 * Measurement information for a grocery item
 */
export interface Measurement {
  value: number;
  unit: MeasurementUnit;
  type?: MeasurementType; // Can be inferred from the unit
}

/**
 * Grocery item with action and optional measurement
 */
export interface GroceryItemWithMeasurement {
  item: string;
  quantity: number;
  action?: 'add' | 'remove' | 'modify';
  measurement?: Measurement;
}

/**
 * Response format for grocery extraction API
 */
export interface GroceryExtractionResponse {
  items: GroceryItemWithMeasurement[];
}
