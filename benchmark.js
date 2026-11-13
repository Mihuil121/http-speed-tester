/**
 * Benchmark core module containing pure business logic for sequential HTTP requests
 * and speed/time performance calculations.
 */

import { performance } from 'perf_hooks';

export const DEFAULT_URL = 'https://raw.githubusercontent.com/nodejs/node/main/README.md';
export const DEFAULT_REQUEST_COUNT = 10;

/**
 * Executes a series of sequential HTTP requests and measures timing & transfer metrics.
 *
 * @param {string} targetUrl - The URL to test against.
 * @param {number} requestCount - Number of sequential requests to perform (default: 10).
 * @param {Function} fetchFn - Fetch implementation to use (defaults to global fetch).
 * @returns {Promise<Object>} Benchmark result statistics and individual metrics.
 */
export async function runBenchmark(
  targetUrl = DEFAULT_URL,
  requestCount = DEFAULT_REQUEST_COUNT,
  fetchFn = globalThis.fetch
) {
  let totalBytes = 0;
  let totalDurationMs = 0;
  const requestMetrics = [];

  const wallClockStart = performance.now();

  for (let i = 1; i <= requestCount; i++) {
    const reqStart = performance.now();
    try {
      const response = await fetchFn(targetUrl);

      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status} ${response.statusText}`);
      }

      const arrayBuffer = await response.arrayBuffer();
      const bytes = arrayBuffer.byteLength;

      const reqEnd = performance.now();
      const durationMs = reqEnd - reqStart;

      totalBytes += bytes;
      totalDurationMs += durationMs;

      requestMetrics.push({
        index: i,
        durationMs,
        bytes,
        status: response.status
      });
    } catch (error) {
      const reqEnd = performance.now();
      const durationMs = reqEnd - reqStart;

      requestMetrics.push({
        index: i,
        durationMs,
        bytes: 0,
        error: error.message
      });
    }
  }

  const wallClockEnd = performance.now();
  const totalWallClockMs = wallClockEnd - wallClockStart;

  const successfulRequests = requestMetrics.filter(m => !m.error);
  const successCount = successfulRequests.length;

  if (successCount === 0) {
    throw new Error('All requests failed. Benchmark could not calculate download speed.');
  }

  const avgDurationMs = totalDurationMs / successCount;
  const totalSeconds = totalWallClockMs / 1000;
  const bytesPerSecond = totalSeconds > 0 ? totalBytes / totalSeconds : 0;
  const kbPerSecond = bytesPerSecond / 1024;
  const mbPerSecond = kbPerSecond / 1024;

  const totalKB = totalBytes / 1024;
  const totalMB = totalKB / 1024;

  return {
    targetUrl,
    requestCount,
    successCount,
    totalBytes,
    totalKB,
    totalMB,
    totalDurationMs,
    totalWallClockMs,
    avgDurationMs,
    kbPerSecond,
    mbPerSecond,
    requestMetrics
  };
}
