// Mede LCP/CLS no build de produção com rede Slow 4G (~1.6 Mbps, 150 ms) e CPU 4x mais lenta.
// Uso: npm run preview  →  BASE_URL=http://localhost:4173 node scripts/perf.mjs
import { chromium } from 'playwright-core'
import fs from 'node:fs'
const BASE = process.env.BASE_URL ?? 'http://localhost:4173'
const executablePath = [process.env.BROWSER_PATH, 'C:/Program Files/Google/Chrome/Application/chrome.exe', 'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe', '/usr/bin/google-chrome'].filter(Boolean).find((p) => fs.existsSync(p))
const b = await chromium.launch({ executablePath })
for (const [vp, mob] of [[{ width: 1440, height: 900 }, false], [{ width: 390, height: 844 }, true]]) {
  const runs = []
  for (let i = 0; i < 3; i++) {
    const c = await b.newContext({ viewport: vp, isMobile: mob })
    const p = await c.newPage()
    const cdp = await c.newCDPSession(p)
    await cdp.send('Network.emulateNetworkConditions', { offline: false, latency: 150, downloadThroughput: (1.6 * 1024 * 1024) / 8, uploadThroughput: (750 * 1024) / 8 })
    await cdp.send('Emulation.setCPUThrottlingRate', { rate: 4 })
    await p.addInitScript(() => {
      window.__lcp = { t: 0, el: '' }
      window.__cls = 0
      new PerformanceObserver((l) => { for (const e of l.getEntries()) window.__lcp = { t: e.startTime, el: e.element ? e.element.tagName + '.' + (e.element.className || '') : '' } }).observe({ type: 'largest-contentful-paint', buffered: true })
      new PerformanceObserver((l) => { for (const e of l.getEntries()) if (!e.hadRecentInput) window.__cls += e.value }).observe({ type: 'layout-shift', buffered: true })
    })
    await p.goto(BASE, { waitUntil: 'load' })
    await p.waitForTimeout(4000)
    await p.mouse.wheel(0, 1500)
    await p.waitForTimeout(1200)
    runs.push(await p.evaluate(() => ({ lcp: Math.round(window.__lcp.t), el: window.__lcp.el, cls: +window.__cls.toFixed(3) })))
    await c.close()
  }
  console.log(`${vp.width}px`, JSON.stringify(runs))
}
await b.close()
