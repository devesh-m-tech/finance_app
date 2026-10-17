export type FormFieldType =
  | 'text'
  | 'number'
  | 'currency'
  | 'date'
  | 'dropdown'
  | 'radio'
  | 'checkbox'
  | 'textarea'
  | 'file'
  | 'photo'
  | 'signature'
  | 'fingerprint'
  | 'geo'
  | 'calculated';

export interface DropdownOption {
  label: string;
  value: string | number;
}

export interface ValidationRule {
  required?: boolean;
  min?: number;
  max?: number;
  minLength?: number;
  maxLength?: number;
  pattern?: string;
  isAadhaar?: boolean;
  isPan?: boolean;
  customValidator?: string;
  message?: string;
}

export interface ConditionalRule {
  field: string;
  operator: 'equals' | 'notEquals' | 'contains' | 'greaterThan' | 'lessThan';
  value: any;
}

export interface FormFieldDefinition {
  name: string;
  label: string;
  labelTamil?: string;
  type: FormFieldType;
  placeholder?: string;
  defaultValue?: any;
  options?: DropdownOption[];
  validation?: ValidationRule;
  visibility?: ConditionalRule;
  visibleToRoles?: Array<'SUPER_ADMIN' | 'MANAGER' | 'SALESPERSON'>;
  editableByRoles?: Array<'SUPER_ADMIN' | 'MANAGER' | 'SALESPERSON'>;
  gridSpan?: number; // 1 to 12
  isSystemField?: boolean; // Cannot be deleted by form builder
}

export interface FormStepDefinition {
  id: string;
  title: string;
  titleTamil?: string;
  description?: string;
  fields: FormFieldDefinition[];
}

export interface DynamicFormSchema {
  formKey: string;
  version: number;
  title: string;
  steps: FormStepDefinition[];
}
