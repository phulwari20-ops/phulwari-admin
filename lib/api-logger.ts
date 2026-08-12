/**
 * Global Centralized API / Network Logger System
 * Intercepts all client-side fetch requests to capture Supabase & API interactions.
 */

const API_LOGGER_ENABLED = true;
const MAX_RESPONSE_SIZE = 50 * 1024; // 50 KB

let requestCounter = 0;

// Keep track of recent requests in memory to detect duplicates
const recentRequestsMap = new Map<string, { requestId: string; timestamp: number }>();
const DUPLICATE_THRESHOLD_MS = 2000;

// Helper to mask sensitive keys in headers or JSON objects
function sanitizeData(data: any): any {
  if (!data) return data;
  
  const sensitiveKeys = [
    'authorization',
    'apikey',
    'cookie',
    'set-cookie',
    'x-api-key',
    'password',
    'token',
    'access_token',
    'refresh_token',
    'secret'
  ];

  if (typeof data === 'string') {
    let sanitized = data;
    // Check if string contains any sensitive keys and redact the value
    sensitiveKeys.forEach(key => {
      // Handles JSON-like key/values or query parameters
      const regex = new RegExp(`(${key})[=:\\s"']+\\s*([^&"';\\s]+)`, 'gi');
      sanitized = sanitized.replace(regex, '$1: "REDACTED"');
    });
    return sanitized;
  }

  if (typeof data === 'object') {
    if (Array.isArray(data)) {
      return data.map(item => sanitizeData(item));
    }
    const sanitizedObj: any = {};
    for (const key in data) {
      if (Object.prototype.hasOwnProperty.call(data, key)) {
        const lowerKey = key.toLowerCase();
        if (sensitiveKeys.some(sk => lowerKey.includes(sk))) {
          sanitizedObj[key] = '[REDACTED]';
        } else if (typeof data[key] === 'object' && data[key] !== null) {
          sanitizedObj[key] = sanitizeData(data[key]);
        } else {
          sanitizedObj[key] = data[key];
        }
      }
    }
    return sanitizedObj;
  }

  return data;
}

// Maps PostgREST/PostgreSQL error codes to human-readable explanations
function getErrorAnalysis(err: any) {
  if (!err || typeof err !== 'object') return null;
  const code = String(err.code || '');
  const message = String(err.message || '');
  const details = String(err.details || '');
  const hint = String(err.hint || '');

  let problem = 'Unknown / not provided by server';
  let field = 'Unknown / not provided by server';

  // Analyze constraint violations
  if (code === '23505') {
    problem = 'Unique violation (Record already exists)';
    const match = details.match(/\((.*?)\)=\((.*?)\)/);
    if (match && match[1]) field = match[1];
  } else if (code === '23503') {
    problem = 'Foreign key violation (Referenced record not found)';
    const match = details.match(/key \((.*?)\)/);
    if (match && match[1]) field = match[1];
  } else if (code === '23502') {
    problem = 'NOT NULL constraint violation';
    const match = message.match(/"(.*?)"/);
    if (match && match[1]) field = match[1];
  } else if (code.startsWith('23')) {
    problem = 'Integrity constraint violation';
  } else if (code.startsWith('42')) {
    problem = 'Syntax error or access rule violation';
  } else if (code === 'P0001') {
    problem = 'Raise exception from database trigger';
  }

  return {
    code,
    field,
    problem,
    message,
    details,
    hint
  };
}

export function initApiLogger() {
  if (typeof window === 'undefined') return;
  if ((window as any).__api_logger_initialized__) return;
  (window as any).__api_logger_initialized__ = true;

  const originalFetch = window.fetch;

  window.fetch = async function (
    input: RequestInfo | URL,
    init?: RequestInit
  ): Promise<Response> {
    if (!API_LOGGER_ENABLED) {
      return originalFetch.apply(this, arguments as any);
    }

    requestCounter++;
    const requestId = `API-${String(requestCounter).padStart(5, '0')}`;
    const startTime = performance.now();
    const timestampStr = new Date().toLocaleTimeString(undefined, { hour12: false }) + 
      '.' + String(new Date().getMilliseconds()).padStart(3, '0');

    // Extract URL and Path info
    let fullUrl = '';
    if (typeof input === 'string') {
      fullUrl = input;
    } else if (input instanceof URL) {
      fullUrl = input.toString();
    } else if (input && typeof input === 'object' && 'url' in input) {
      fullUrl = (input as Request).url;
    }

    let parsedUrl: URL | null = null;
    try {
      parsedUrl = new URL(fullUrl, window.location.href);
    } catch (_) {}

    const apiPath = parsedUrl ? parsedUrl.pathname : fullUrl;
    const queryParams = parsedUrl ? Object.fromEntries(parsedUrl.searchParams.entries()) : {};
    const method = (init?.method || (input && (input as Request).method) || 'GET').toUpperCase();

    // Redact sensitive credentials in URL query parameters
    const sanitizedQueryParams = sanitizeData(queryParams);

    // Classify Request Category
    let category: 'APPLICATION' | 'THIRD_PARTY' | 'NEXT_INTERNAL' = 'APPLICATION';
    const host = parsedUrl ? parsedUrl.host : '';

    if (
      apiPath.includes('/_next/') || 
      apiPath.includes('webpack') || 
      apiPath.includes('__nextjs') ||
      apiPath.includes('/hot-update')
    ) {
      category = 'NEXT_INTERNAL';
    } else if (
      fullUrl.includes('google-analytics') ||
      fullUrl.includes('googletagmanager') ||
      fullUrl.includes('doubleclick') ||
      fullUrl.includes('facebook.net') ||
      fullUrl.includes('connect.facebook')
    ) {
      category = 'THIRD_PARTY';
    } else if (
      parsedUrl && 
      !host.includes(window.location.host) && 
      !fullUrl.includes('supabase.co')
    ) {
      category = 'THIRD_PARTY';
    }

    // Headers Extraction & Redaction
    const requestHeaders: Record<string, string> = {};
    if (init?.headers) {
      const headersObj = new Headers(init.headers);
      headersObj.forEach((value, key) => {
        requestHeaders[key] = value;
      });
    } else if (input && typeof input === 'object' && 'headers' in input) {
      const headersObj = new Headers((input as Request).headers);
      headersObj.forEach((value, key) => {
        requestHeaders[key] = value;
      });
    }
    const safeRequestHeaders = sanitizeData(requestHeaders);

    // Request Body Extraction
    let requestBody: any = 'none';
    let rawBodyStr = '';
    if (init?.body) {
      const body = init.body;
      if (typeof body === 'string') {
        rawBodyStr = body;
        try {
          requestBody = sanitizeData(JSON.parse(body));
        } catch (_) {
          requestBody = sanitizeData(body);
        }
      } else if (body instanceof FormData) {
        const formDataObj: Record<string, any> = {};
        body.forEach((value, key) => {
          if (value instanceof File) {
            formDataObj[key] = {
              name: value.name,
              type: value.type,
              size: `${(value.size / 1024).toFixed(1)} KB`
            };
          } else {
            formDataObj[key] = value;
          }
        });
        requestBody = { '[FormData]': formDataObj };
        rawBodyStr = JSON.stringify(formDataObj);
      } else {
        requestBody = '[Binary/Stream Body]';
        rawBodyStr = '[Binary]';
      }
    }

    // Duplicate request check
    const requestHashKey = `${method}:${fullUrl}:${rawBodyStr}`;
    const now = Date.now();
    const prevRequest = recentRequestsMap.get(requestHashKey);
    let isDuplicate = false;
    let duplicateInfo = null;

    if (prevRequest && (now - prevRequest.timestamp) < DUPLICATE_THRESHOLD_MS) {
      isDuplicate = true;
      duplicateInfo = {
        prevId: prevRequest.requestId,
        timeDiff: now - prevRequest.timestamp
      };
    }
    // Update map with latest request
    recentRequestsMap.set(requestHashKey, { requestId, timestamp: now });

    const logRequestHeaderLine = (statusText: string, color: string) => {
      const categoryLabel = category === 'NEXT_INTERNAL' ? '⚙️ NEXT INTERNAL' : category === 'THIRD_PARTY' ? '🟡 THIRD-PARTY REQUEST' : '🟢 APPLICATION API';
      const finalLabel = statusText === 'FAILED' ? `🔴 ${category} ERROR` : categoryLabel;
      console.groupCollapsed(
        `%c━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n${finalLabel}: ${method} ${apiPath} [${statusText}]\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`,
        `color: ${color}; font-weight: bold;`
      );
    };

    const logDetails = (status: number, statusText: string, duration: number, responseBody: any, networkError?: string) => {
      const speedLabel = duration < 500 ? '⚡ FAST' : duration <= 2000 ? '🟡 SLOW' : '🔴 VERY SLOW';
      console.log(`Request ID : ${requestId}`);
      console.log(`Time       : ${timestampStr}`);
      console.log(`Method     : ${method}`);
      console.log(`URL        : ${fullUrl}`);
      console.log(`Category   : ${category}`);
      console.log(`Duration   : ${duration}ms (${speedLabel})`);
      
      if (isDuplicate && duplicateInfo) {
        console.log(`%c⚠️ DUPLICATE REQUEST DETECTED\nPrevious request: ${duplicateInfo.prevId}\nTime difference: ${duplicateInfo.timeDiff}ms`, 'color: #F59E0B; font-weight: bold;');
      }

      console.log(`📤 REQUEST`);
      if (Object.keys(sanitizedQueryParams).length > 0) {
        console.log('Query Params:', sanitizedQueryParams);
      }
      console.log('Headers:', safeRequestHeaders);
      console.log('Body:', requestBody);

      console.log(`📥 RESPONSE`);
      console.log(`HTTP Status: ${status}`);
      if (status === 0) {
        console.log(`HTTP Response: No normal HTTP response received`);
        if (networkError) {
          console.log(`Browser/Network Error: ${networkError}`);
        }
      } else {
        console.log(`HTTP Response: ${status} ${statusText}`);
        console.log(responseBody);
      }
    };

    try {
      const response = await originalFetch.apply(this, arguments as any);
      const duration = Math.round(performance.now() - startTime);
      const clonedResponse = response.clone();
      const status = response.status;
      const statusText = response.statusText;
      const isSuccess = response.ok;

      let responseBody: any = 'empty';
      let rawText = '';
      const contentType = response.headers.get('content-type') || '';

      if (contentType.includes('application/json')) {
        try {
          rawText = await clonedResponse.text();
          if (rawText) {
            responseBody = sanitizeData(JSON.parse(rawText));
          }
        } catch (_) {
          responseBody = '[Invalid JSON]';
        }
      } else if (contentType.includes('text/')) {
        try {
          rawText = await clonedResponse.text();
          responseBody = rawText;
        } catch (_) {}
      } else if (contentType) {
        responseBody = `[Binary Content: ${contentType}]`;
      }

      // Truncate response if it exceeds max size limit
      if (rawText && rawText.length > MAX_RESPONSE_SIZE) {
        if (typeof responseBody === 'object') {
          if (Array.isArray(responseBody)) {
            responseBody = {
              '[Warning]': `Response array truncated. Original count: ${responseBody.length}`,
              data: responseBody.slice(0, 5)
            };
          } else {
            responseBody = {
              '[Warning]': `Response body size is large: ${(rawText.length / 1024).toFixed(1)} KB`,
              data: responseBody
            };
          }
        } else {
          responseBody = rawText.slice(0, MAX_RESPONSE_SIZE) + '... [TRUNCATED]';
        }
      }

      if (category !== 'NEXT_INTERNAL') {
        if (isSuccess) {
          logRequestHeaderLine('SUCCESS', '#10B981');
          logDetails(status, statusText, duration, responseBody);
          console.groupEnd();
        } else {
          logRequestHeaderLine('FAILED', '#EF4444');
          logDetails(status, statusText, duration, responseBody);
          
          const errorObj = responseBody && typeof responseBody === 'object' ? responseBody : {};
          const isDbError = errorObj.code || errorObj.message || errorObj.details || errorObj.hint;
          const errorAnalysis = isDbError ? getErrorAnalysis(errorObj) : null;

          if (errorAnalysis) {
            console.log(`%c❌ DATABASE ERROR ANALYSIS`, 'color: #EF4444; font-weight: bold;');
            console.log(`Code    : ${errorAnalysis.code}`);
            console.log(`Field   : ${errorAnalysis.field}`);
            console.log(`Problem : ${errorAnalysis.problem}`);
            if (errorAnalysis.details) console.log(`Details : ${errorAnalysis.details}`);
            if (errorAnalysis.hint) console.log(`Hint    : ${errorAnalysis.hint}`);
          }
          console.groupEnd();
        }
      }

      return response;
    } catch (err: any) {
      const duration = Math.round(performance.now() - startTime);
      
      if (category !== 'NEXT_INTERNAL') {
        logRequestHeaderLine('FAILED', '#EF4444');
        logDetails(0, '', duration, 'empty', err.message || String(err));
        console.groupEnd();
      }

      throw err;
    }
  };
}
