/* eslint-disable no-undef, max-len */
const http = require('http');
const { createServer } = require('../src/createServer');

function request(url = '/') {
  return new Promise((resolve, reject) => {
    http.get(`http://localhost:5701${url}`, (res) => {
      let body = '';
      res.on('data', (chunk) => { body += chunk; });
      res.on('end', () => {
        try {
          resolve({
            res,
            body: JSON.parse(body)
          });
        } catch (e) {
          reject(e);
        }
      });
    }).on('error', reject);
  });
}

describe('createServer', () => {
  let server;

  beforeAll(async () => {
    server = createServer();
    await new Promise((resolve) => {
      server.listen(5701, resolve);
    });
  });

  afterAll((done) => {
    server.close(done);
  });

  describe('basic scenarios', () => {
    it('should create a server', () => {
      expect(createServer).toBeInstanceOf(Function);
    });

    it('should create an instance of http.Server', () => {
      expect(createServer()).toBeInstanceOf(http.Server);
    });
  });

  describe('Validation', () => {
    it('should throw error if no text to convert', async () => {
      const { body, res } = await request('/?toCase=SNAKE');
      expect(res.headers['content-type']).toBe('application/json');
      expect(body.errors).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            message: expect.stringContaining('Text to convert is required')
          })
        ])
      );
    });

    it('should throw error if no toCase', async () => {
      const { body, res } = await request('/helloWorld');
      expect(res.headers['content-type']).toBe('application/json');
      expect(body.errors).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            message: expect.stringContaining('"toCase" query param is required')
          })
        ])
      );
    });

    it('should throw error if toCase is invalid', async () => {
      const { body, res } = await request('/helloWorld?toCase=invalid');
      expect(res.headers['content-type']).toBe('application/json');
      expect(body.errors).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            message: expect.stringContaining('This case is not supported')
          })
        ])
      );
    });
  });

  describe('Response', () => {
    const cases = {
      SNAKE: 'hello_world',
      KEBAB: 'hello-world',
      CAMEL: 'helloWorld',
      PASCAL: 'HelloWorld',
      UPPER: 'HELLO_WORLD'
    };

    Object.entries(cases).forEach(([toCase, expected]) => {
      Object.entries(cases).forEach(([originalCase, text]) => {
        it(`should convert ${originalCase} to ${toCase}`, async () => {
          const { body, res } = await request(`/${text}?toCase=${toCase}`);
          expect(res.statusCode).toBe(200);
          expect(res.headers['content-type']).toBe('application/json');
          expect(body).toEqual({
            originalCase,
            targetCase: toCase,
            convertedText: expected,
            originalText: text
          });
        });
      });
    });
  });
});
