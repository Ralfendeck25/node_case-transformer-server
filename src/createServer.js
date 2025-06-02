const http = require('http');
const { validateUrl } = require('./validateUrl'); // Fixed typo in function name
const { respondPositively } = require('./validatedResponse');

function createServer() {
  return http.createServer((req, res) => {
    try {
      const fullUrl = `http://${req.headers.host}${req.url}`;
      const validationResult = validateUrl(fullUrl); // Consistent naming

      if (!validationResult.valid) {
        res.writeHead(400, { 'Content-Type': 'application/json' });

        return res.end(
          JSON.stringify({
            error: 'Invalid URL',
            details: validationResult.errors,
          }),
        );
      }

      const response = respondPositively(fullUrl);

      res.writeHead(200, { 'Content-Type': 'application/json' });

      return res.end(JSON.stringify(response));
    } catch (error) {
      res.writeHead(500, { 'Content-Type': 'application/json' });

      return res.end(
        JSON.stringify({
          error: 'Internal server error',
          details: error.message,
        }),
      );
    }
  });
}

module.exports = {
  createServer,
};
