import test from 'node:test';
import assert from 'node:assert/strict';
import { runBenchmark } from '../benchmark.js';

test('runBenchmark - calculates metrics correctly with mocked fetch', async () => {
  const mockPayload = 'Hello, Node.js Benchmark Test!';
  const mockBuffer = new TextEncoder().encode(mockPayload).buffer;

  const mockFetch = async () => ({
    ok: true,
    status: 200,
    statusText: 'OK',
    arrayBuffer: async () => mockBuffer
  });

  const results = await runBenchmark('https://example.com/file', 10, mockFetch);

  assert.equal(results.successCount, 10);
  assert.equal(results.requestCount, 10);
  assert.equal(results.totalBytes, mockBuffer.byteLength * 10);
  assert.ok(results.avgDurationMs >= 0);
  assert.ok(results.kbPerSecond >= 0);
  assert.ok(results.mbPerSecond >= 0);
  assert.equal(results.requestMetrics.length, 10);
});

test('runBenchmark - tracks partial HTTP request failures', async () => {
  let calls = 0;
  const mockBuffer = new TextEncoder().encode('Test Payload').buffer;

  const mockFetch = async () => {
    calls++;
    if (calls % 2 === 0) {
      return {
        ok: false,
        status: 500,
        statusText: 'Internal Server Error',
        arrayBuffer: async () => new ArrayBuffer(0)
      };
    }
    return {
      ok: true,
      status: 200,
      statusText: 'OK',
      arrayBuffer: async () => mockBuffer
    };
  };

  const results = await runBenchmark('https://example.com/test', 4, mockFetch);

  assert.equal(results.successCount, 2);
  assert.equal(results.requestCount, 4);
  assert.equal(results.requestMetrics[1].error.includes('500'), true);
  assert.equal(results.requestMetrics[0].bytes, mockBuffer.byteLength);
});

test('runBenchmark - throws error if all requests fail', async () => {
  const mockFetch = async () => ({
    ok: false,
    status: 404,
    statusText: 'Not Found',
    arrayBuffer: async () => new ArrayBuffer(0)
  });

  await assert.rejects(
    async () => {
      await runBenchmark('https://example.com/404', 3, mockFetch);
    },
    {
      name: 'Error',
      message: 'All requests failed. Benchmark could not calculate download speed.'
    }
  );
});
