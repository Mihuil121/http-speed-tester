#!/usr/bin/env node

/**
 * CLI wrapper for running the Node.js download speed benchmark tool.
 */

import { runBenchmark, DEFAULT_URL, DEFAULT_REQUEST_COUNT } from './benchmark.js';

async function main() {
  const args = process.argv.slice(2);
  const targetUrl = args[0] || DEFAULT_URL;

  console.log(`\n🚀 Starting benchmark for URL: ${targetUrl}`);
  console.log(`📊 Executing ${DEFAULT_REQUEST_COUNT} sequential requests...\n`);

  try {
    const results = await runBenchmark(targetUrl, DEFAULT_REQUEST_COUNT);

    results.requestMetrics.forEach(metric => {
      if (metric.error) {
        console.error(`[Request ${metric.index}/${results.requestCount}] Failed: ${metric.error} (${metric.durationMs.toFixed(2)} ms)`);
      } else {
        console.log(`[Request ${metric.index}/${results.requestCount}] Success: ${metric.bytes} bytes in ${metric.durationMs.toFixed(2)} ms`);
      }
    });

    console.log('\n========================================');
    console.log('📈 BENCHMARK RESULTS');
    console.log('========================================');
    console.log(`Successful Requests  : ${results.successCount} / ${results.requestCount}`);
    console.log(`Total Downloaded     : ${results.totalBytes} bytes (${results.totalKB.toFixed(2)} KB / ${results.totalMB.toFixed(2)} MB)`);
    console.log(`Sum Request Time     : ${results.totalDurationMs.toFixed(2)} ms`);
    console.log(`Total Wall-Clock Time: ${results.totalWallClockMs.toFixed(2)} ms (${(results.totalWallClockMs / 1000).toFixed(3)} s)`);
    console.log(`Average Request Time : ${results.avgDurationMs.toFixed(2)} ms`);
    console.log('----------------------------------------');
    console.log(`🔥 Average Speed      : ${results.kbPerSecond.toFixed(2)} KB/s (${results.mbPerSecond.toFixed(4)} MB/s)`);
    console.log('========================================\n');
  } catch (error) {
    console.error(`\n❌ Error: ${error.message}`);
    process.exit(1);
  }
}

main();
