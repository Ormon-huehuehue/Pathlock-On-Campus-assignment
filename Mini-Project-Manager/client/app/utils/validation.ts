export interface PasswordRequirement {
  id: string;
  label: string;
  test: (password: string) => boolean;
}

export interface ValidationResult {
  isValid: boolean;
  errors: string[];
}

export interface PasswordValidationResult extends ValidationResult {
  strength: 'weak' | 'medium' | 'strong';
  requirements: Array<PasswordRequirement & { met: boolean }>;
}

// Password requirements configuration
export const PASSWORD_REQUIREMENTS: PasswordRequirement[] = [
  {
    id: 'length',
    label: 'At least 8 characters long',
    test: (password: string) => password.length >= 8,
  },
  {
    id: 'uppercase',
    label: 'Contains at least one uppercase letter',
    test: (password: string) => /[A-Z]/.test(password),
  },
  {
    id: 'lowercase',
    label: 'Contains at least one lowercase letter',
    test: (password: string) => /[a-z]/.test(password),
  },
  {
    id: 'number',
    label: 'Contains at least one number',
    test: (password: string) => /\d/.test(password),
  },
  {
    id: 'special',
    label: 'Contains at least one special character (!@#$%^&*)',
    test: (password: string) => /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password),
  },
];

/**
 * Validates password strength and returns detailed requirements status
 */
export function validatePassword(password: string): PasswordValidationResult {
  if (!password) {
    return {
      isValid: false,
      errors: ['Password is required'],
      strength: 'weak',
      requirements: PASSWORD_REQUIREMENTS.map(req => ({ ...req, met: false })),
    };
  }

  const requirements = PASSWORD_REQUIREMENTS.map(req => ({
    ...req,
    met: req.test(password),
  }));

  const metRequirements = requirements.filter(req => req.met).length;
  const errors: string[] = [];

  // Determine strength based on met requirements
  let strength: 'weak' | 'medium' | 'strong' = 'weak';
  if (metRequirements >= 5) {
    strength = 'strong';
  } else if (metRequirements >= 3) {
    strength = 'medium';
  }

  // Add errors for unmet requirements
  requirements.forEach(req => {
    if (!req.met) {
      errors.push(req.label);
    }
  });

  return {
    isValid: metRequirements === PASSWORD_REQUIREMENTS.length,
    errors,
    strength,
    requirements,
  };
}

/**
 * Validates username format
 */
export function validateUsername(username: string): ValidationResult {
  const errors: string[] = [];

  if (!username) {
    errors.push('Username is required');
  } else {
    // Username should be 3-20 characters, alphanumeric and underscores only
    if (username.length < 3) {
      errors.push('Username must be at least 3 characters long');
    }
    
    if (username.length > 20) {
      errors.push('Username must be no more than 20 characters long');
    }
    
    if (!/^[a-zA-Z0-9_]+$/.test(username)) {
      errors.push('Username can only contain letters, numbers, and underscores');
    }
    
    if (/^[0-9]/.test(username)) {
      errors.push('Username cannot start with a number');
    }
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
}

/**
 * Validates email format
 */
export function validateEmail(email: string): ValidationResult {
  const errors: string[] = [];

  if (!email) {
    errors.push('Email is required');
  } else {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      errors.push('Please enter a valid email address');
    }
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
}

/**
 * Validates password confirmation
 */
export function validatePasswordConfirmation(
  password: string,
  confirmPassword: string
): ValidationResult {
  const errors: string[] = [];

  if (!confirmPassword) {
    errors.push('Password confirmation is required');
  } else if (password !== confirmPassword) {
    errors.push('Passwords do not match');
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
}

/**
 * Real-time field validation function
 */
export function validateField(
  fieldName: string,
  value: string,
  additionalValue?: string
): ValidationResult {
  switch (fieldName) {
    case 'username':
      return validateUsername(value);
    case 'email':
      return validateEmail(value);
    case 'password':
      return validatePassword(value);
    case 'confirmPassword':
      return validatePasswordConfirmation(additionalValue || '', value);
    default:
      return { isValid: true, errors: [] };
  }
}

/**
 * Validates entire form data
 */
export interface FormData {
  [key: string]: string;
}

export function validateForm(formData: FormData, fields: string[]): Record<string, ValidationResult> {
  const results: Record<string, ValidationResult> = {};

  fields.forEach(field => {
    if (field === 'confirmPassword') {
      results[field] = validatePasswordConfirmation(
        formData.password || '',
        formData[field] || ''
      );
    } else {
      results[field] = validateField(field, formData[field] || '');
    }
  });

  return results;
}

/**
 * Checks if form is valid based on validation results
 */
export function isFormValid(validationResults: Record<string, ValidationResult>): boolean {
  return Object.values(validationResults).every(result => result.isValid);
}