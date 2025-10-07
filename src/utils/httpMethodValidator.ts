/**
 * Utility functions for validating and debugging HTTP methods in API requests
 */

import axios, { AxiosRequestConfig } from 'axios';

export interface HttpMethodTest {
  method: string;
  url: string;
  success: boolean;
  actualMethod?: string;
  error?: string;
}

/**
 * Test if HTTP methods are properly configured in Axios requests
 */
export const testHttpMethods = async (baseURL: string = ''): Promise<HttpMethodTest[]> => {
  const tests: HttpMethodTest[] = [];
  
  // Create a test axios instance
  const testClient = axios.create({
    baseURL,
    timeout: 5000,
  });

  // Add request interceptor to capture actual HTTP methods
  testClient.interceptors.request.use(
    (config) => {
      console.log('🔍 HTTP Method Test - Request Config:', {
        method: config.method,
        url: config.url,
        headers: Object.keys(config.headers || {}),
        data: config.data ? 'Present' : 'None'
      });
      return config;
    },
    (error) => Promise.reject(error)
  );

  const testCases = [
    { method: 'GET', url: '/api/plans' },
    { method: 'POST', url: '/api/invite/my-codes' },
    { method: 'PUT', url: '/api/invite/my-codes/test/remark' },
    { method: 'DELETE', url: '/api/test' }
  ];

  for (const testCase of testCases) {
    try {
      const config: AxiosRequestConfig = {
        method: testCase.method.toLowerCase() as any,
        url: testCase.url,
        validateStatus: () => true, // Accept any status code for testing
      };

      if (testCase.method === 'POST' || testCase.method === 'PUT') {
        config.data = { test: true };
      }

      console.log(`🧪 Testing ${testCase.method} ${testCase.url}`);
      
      const response = await testClient.request(config);
      
      tests.push({
        method: testCase.method,
        url: testCase.url,
        success: true,
        actualMethod: config.method?.toUpperCase()
      });

      console.log(`✅ ${testCase.method} test completed`);
    } catch (error: any) {
      tests.push({
        method: testCase.method,
        url: testCase.url,
        success: false,
        error: error.message,
        actualMethod: 'UNKNOWN'
      });

      console.error(`❌ ${testCase.method} test failed:`, error.message);
    }
  }

  return tests;
};

/**
 * Validate that an Axios config has the correct HTTP method
 */
export const validateHttpMethod = (config: AxiosRequestConfig, expectedMethod: string): boolean => {
  const actualMethod = config.method?.toUpperCase();
  const expected = expectedMethod.toUpperCase();
  
  console.log('🔍 HTTP Method Validation:', {
    expected,
    actual: actualMethod,
    isValid: actualMethod === expected
  });

  return actualMethod === expected;
};

/**
 * Debug HTTP method configuration
 */
export const debugHttpMethodConfig = (config: AxiosRequestConfig) => {
  console.log('🔧 HTTP Method Debug:', {
    method: config.method,
    methodType: typeof config.method,
    url: config.url,
    hasData: !!config.data,
    hasParams: !!config.params,
    headers: config.headers ? Object.keys(config.headers) : [],
    timeout: config.timeout
  });
};

/**
 * Create a properly configured request config with explicit HTTP method
 */
export const createRequestConfig = (
  method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH',
  url: string,
  options: {
    data?: any;
    params?: any;
    headers?: Record<string, string>;
  } = {}
): AxiosRequestConfig => {
  const config: AxiosRequestConfig = {
    method: method.toLowerCase() as any,
    url,
    ...options
  };

  // Ensure Content-Type for data-sending methods
  if (['POST', 'PUT', 'PATCH'].includes(method) && options.data) {
    config.headers = {
      'Content-Type': 'application/json',
      ...config.headers
    };
  }

  debugHttpMethodConfig(config);
  return config;
};
