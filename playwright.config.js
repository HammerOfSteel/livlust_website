// @ts-check
const { defineConfig, devices } = require('@playwright/test');

module.exports = defineConfig({
  testDir: './tests',
  timeout: 15_000,
  use: {
    // Serve the POC from the already-running python server
    baseURL: 'http://localhost:8765',
    // WebGL is needed for MapLibre
    launchOptions: { args: ['--enable-webgl', '--use-gl=swiftshader'] },
  },
  projects: [
    { name: 'chromium', use: { ...devices['Desktop Chrome'] } },
  ],
  // Don't start a server — user runs python3 -m http.server 8765 separately
  webServer: {
    command: 'python3 -m http.server 8765',
    url: 'http://localhost:8765',
    reuseExistingServer: true,
    timeout: 5_000,
  },
});
