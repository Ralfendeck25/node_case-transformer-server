const { convertToCase } = require('./convertToCase/convertToCase');
const SUPPORTED_CASES = ['SNAKE', 'KEBAB', 'CAMEL', 'PASCAL', 'UPPER'];

function validateRequest(url) {
  const errors = [];

  try {
    const parsedUrl = new URL(url);
    const textToConvert = parsedUrl.pathname.slice(1);
    const targetCase = parsedUrl.searchParams.get('toCase');

    if (!textToConvert) {
      errors.push({
        message:
          'Text to convert is required. Correct request is: "/<TEXT_TO_CONVERT>?toCase=<CASE_NAME>"',
      });
    }

    if (!targetCase) {
      errors.push({
        message:
          '"toCase" query param is required. Correct request is: "/<TEXT_TO_CONVERT>?toCase=<CASE_NAME>"',
      });
    } else if (!SUPPORTED_CASES.includes(targetCase)) {
      errors.push({
        message:
          'This case is not supported. Available cases: SNAKE, KEBAB, CAMEL, PASCAL, UPPER.',
      });
    }

    return {
      valid: errors.length === 0,
      errors,
      textToConvert,
      targetCase,
    };
  } catch (e) {
    return {
      valid: false,
      errors: [{ message: 'Invalid URL format' }],
    };
  }
}

function respondPositively(url) {
  const validation = validateRequest(url);

  if (!validation.valid) {
    return {
      status: 'error',
      errors: validation.errors,
      processedAt: new Date().toISOString(),
    };
  }

  const { originalCase, convertedText } = convertToCase(
    validation.textToConvert,
    validation.targetCase,
  );

  return {
    status: 'success',
    originalCase,
    targetCase: validation.targetCase,
    originalText: validation.textToConvert,
    convertedText,
    processedAt: new Date().toISOString(),
  };
}

module.exports = {
  validateRequest,
  respondPositively,
};
