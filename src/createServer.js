// Write code here
// Also, you can create additional files in the src folder
// and import (require) them here
/* const { URL } = require('url'); */
const http = require('http');
const url = require('url');
const { convertToCase } = require('./convertToCase/convertToCase');

const SUPPORTED_CASES = ['SNAKE', 'KEBAB', 'CAMEL', 'PASCAL', 'UPPER'];

function createServer() {
  const server = http.createServer((req, res) => {
    const parsedUrl = url.parse(req.url, true);
    const pathParts = parsedUrl.pathname.split('/').filter(Boolean);
    const textToConvert = pathParts.join('/');
    const toCase = parsedUrl.query.toCase;

    const errors = validateRequest(textToConvert, toCase);

    if (errors.length > 0) {
      sendErrorResponse(res, errors);
      return;
    }

    const result = convertToCase(toCase, textToConvert);

    sendSuccessResponse(res, {
      originalCase: result.originalCase,
      targetCase: toCase,
      originalText: textToConvert,
      convertedText: result.convertedText
    });
  });

  return server;
}

function validateRequest(text, toCase) {
  const errors = [];

  if (!text) {
    errors.push({
      message: 'Text to convert is required. Correct request is: "/<TEXT_TO_CONVERT>?toCase=<CASE_NAME>"'
    });
  }

  if (!toCase) {
    errors.push({
      message: '"toCase" query param is required. Correct request is: "/<TEXT_TO_CONVERT>?toCase=<CASE_NAME>"'
    });
  } else if (!SUPPORTED_CASES.includes(toCase)) {
    errors.push({
      message: 'This case is not supported. Available cases: SNAKE, KEBAB, CAMEL, PASCAL, UPPER.'
    });
  }

  return errors;
}

function sendErrorResponse(res, errors) {
  res.writeHead(400, {
    'Content-Type': 'application/json',
    'Status-Text': 'Bad request'
  });
  res.end(JSON.stringify({ errors }));
}

function sendSuccessResponse(res, data) {
  res.writeHead(200, {
    'Content-Type': 'application/json',
    'Status-Text': 'OK'
  });
  res.end(JSON.stringify(data));
}

module.exports = { createServer };
