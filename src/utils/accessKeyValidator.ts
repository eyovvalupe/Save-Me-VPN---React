/**
 * Utility functions for validating access keys
 */

export const validateAccessKey = (accessKey: string): { isValid: boolean; error?: string } => {
  if (!accessKey) {
    return { isValid: false, error: 'Access key is required' };
  }

  const trimmedKey = accessKey.trim();
  
  if (!trimmedKey.startsWith('ak-')) {
    return { isValid: false, error: 'Access key must start with "ak-"' };
  }

  if (trimmedKey.length < 4) {
    return { isValid: false, error: 'Access key is too short' };
  }

  const keyPart = trimmedKey.substring(3); // Remove "ak-" prefix
  
  if (keyPart.length === 0) {
    return { isValid: false, error: 'Access key must have content after "ak-"' };
  }

  // Check if the key part contains only alphanumeric characters
  const alphanumericPattern = /^[a-zA-Z0-9]+$/;
  if (!alphanumericPattern.test(keyPart)) {
    return { 
      isValid: false, 
      error: 'Access key must contain only letters and numbers after "ak-"' 
    };
  }

  return { isValid: true };
};

/**
 * Test function to debug access key validation
 */
export const debugAccessKey = (accessKey: string) => {
  console.log('=== Access Key Debug ===');
  console.log('Original:', JSON.stringify(accessKey));
  console.log('Length:', accessKey.length);
  console.log('Trimmed:', JSON.stringify(accessKey.trim()));
  console.log('Trimmed Length:', accessKey.trim().length);
  
  const validation = validateAccessKey(accessKey);
  console.log('Validation Result:', validation);
  
  // Character by character analysis
  const chars = accessKey.split('');
  console.log('Characters:', chars.map((char, index) => ({
    index,
    char,
    charCode: char.charCodeAt(0),
    isAlphanumeric: /[a-zA-Z0-9]/.test(char)
  })));
  
  return validation;
};
