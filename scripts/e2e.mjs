/**
 * Testes de ponta a ponta (sem dependências de navegador baixadas).
 * Usa o Chrome ou Edge instalado na máquina via playwright-core.
 *
 *   npm run build && npm run preview   (em outro terminal)
 *   npm run test:e2e                    (BASE_URL opcional, padrão http://localhost:4173)
 *   SHOTS=1 npm run test:e2e            (salva capturas em ./test-results)
 */
import { chromium } from 'playwright-core'
import fs from 'node:fs'
import path from 'node:path'

const BASE = process.env.BASE_URL ?? 'http://localhost:4173'
const SHOTS = Boolean(process.env.SHOTS)
const outDir = path.resolve('test-results')
if (SHOTS) fs.mkdirSync(outDir, { recursive: true })

const candidates = [
  process.env.BROWSER_PATH,
  'C:/Program Files/Google/Chrome/Application/chrome.exe',
  'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe',
  '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
  '/usr/bin/google-chrome',
  '/usr/bin/chromium',
].filter(Boolean)
const executablePath = candidates.find((p) => fs.existsSync(p))
if (!executablePath) {
  console.error('Nenhum Chrome/Edge encontrado. Defina BROWSER_PATH.')
  process.exit(2)
}

const results = []
const pass = (name) => results.push({ ok: true, name })
const fail = (name, info = '') => results.push({ ok: false, name, info })
const check = (cond, name, info) => (cond ? pass(name) : fail(name, info))

const browser = await chromium.launch({ executablePath, headless: true })

async function newPage(viewport, opts = {}) {
  const ctx = await browser.newContext({ viewport, deviceScaleFactor: 1, ...opts })
  const page = await ctx.newPage()
  const errors = []
  page.on('pageerror', (e) => errors.push(e.message))
  page.on('console', (m) => m.type() === 'error' && errors.push(m.text()))
  await page.goto(BASE, { waitUntil: 'networkidle' })
  return { page, ctx, errors }
}

/** Percorre a página para disparar as revelações por scroll. */
async function scrollThrough(page) {
  await page.evaluate(async () => {
    document.documentElement.style.scrollBehavior = 'auto'
    for (let y = 0; y < document.body.scrollHeight; y += 500) {
      window.scrollTo(0, y)
      await new Promise((r) => setTimeout(r, 90))
    }
    window.scrollTo(0, 0)
  })
  await page.waitForTimeout(1500)
}

/* ------------------------------------------------------------------ */
/* 1. Funcionais — desktop                                             */
/* ------------------------------------------------------------------ */
{
  const { page, ctx, errors } = await newPage({ width: 1440, height: 900 })
  await page.waitForTimeout(2000)

  // Primeiro Tab = skip link
  await page.keyboard.press('Tab')
  check(await page.evaluate(() => document.activeElement?.classList.contains('skip-link')), 'Tab inicial foca o "pular para o conteúdo"')

  // Cardápio
  const tabs = page.getByRole('tab')
  check((await tabs.count()) === 4, 'cardápio tem 4 categorias')
  await page.getByRole('tab', { name: 'Principais' }).click()
  await page.waitForTimeout(800)
  check((await page.locator('.dish-list .dish').count()) === 5, 'Principais lista 5 itens')

  await page.getByRole('tab', { name: 'Entradas' }).click()
  await page.waitForTimeout(800)
  await page.getByRole('button', { name: /Vegano/ }).click()
  await page.waitForTimeout(800)
  check((await page.locator('.dish-list .dish').count()) === 1, 'filtro Vegano em Entradas = 1 item')
  check((await page.getByRole('button', { name: /Vegano/ }).getAttribute('aria-pressed')) === 'true', 'chip de filtro expõe aria-pressed')
  await page.getByRole('tab', { name: 'Principais' }).click()
  await page.waitForTimeout(800)
  check(await page.locator('.menu__empty').isVisible(), 'estado vazio quando nenhum item atende aos filtros')
  await page.locator('.menu__empty').getByRole('button', { name: 'Limpar filtros' }).click()
  await page.waitForTimeout(800)
  check((await page.locator('.dish-list .dish').count()) === 5, 'limpar filtros restaura a lista')

  await page.getByRole('tab', { name: 'Principais' }).focus()
  await page.keyboard.press('ArrowRight')
  await page.waitForTimeout(600)
  check(
    (await page.getByRole('tab', { selected: true }).textContent())?.includes('Sobremesas'),
    'setas do teclado alternam as abas',
  )

  // Diálogo do prato
  const firstDish = page.locator('.dish-list .dish').first()
  const firstName = (await firstDish.locator('.dish__name').textContent())?.trim()
  await firstDish.click()
  await page.waitForTimeout(900)
  const dialog = page.getByRole('dialog')
  check(await dialog.isVisible(), 'diálogo do prato abre')
  check((await page.locator('#dish-dialog-title').textContent())?.trim() === firstName, 'diálogo mostra o prato selecionado')
  check(await page.evaluate(() => !!document.activeElement?.closest('[role=dialog]')), 'foco vai para dentro do diálogo')
  check(/Valor demonstrativo/.test(await dialog.textContent()), 'preço identificado como demonstrativo')
  check(/Ingredientes/.test(await dialog.textContent()) && /Alérgenos/.test(await dialog.textContent()), 'diálogo traz ingredientes e alérgenos')
  // Trap de foco: 12 tabs continuam dentro
  for (let i = 0; i < 12; i++) await page.keyboard.press('Tab')
  check(await page.evaluate(() => !!document.activeElement?.closest('[role=dialog]')), 'foco permanece preso no diálogo')
  await page.getByRole('button', { name: 'Próximo item' }).click()
  await page.waitForTimeout(700)
  check((await page.locator('#dish-dialog-title').textContent())?.trim() !== firstName, 'navegar para o próximo prato')
  if (SHOTS) await page.screenshot({ path: path.join(outDir, 'desktop-dish-dialog.png') })
  await page.keyboard.press('Escape')
  await page.waitForTimeout(900)
  check((await page.getByRole('dialog').count()) === 0, 'Esc fecha o diálogo')
  check(await firstDish.evaluate((el) => el === document.activeElement), 'foco retorna ao item de origem')

  // Lightbox
  await page.locator('.gallery__btn').first().scrollIntoViewIfNeeded()
  await page.locator('.gallery__btn').first().click()
  await page.waitForTimeout(900)
  const counter = page.locator('.lightbox__top .label')
  check(await page.locator('.lightbox').isVisible(), 'lightbox abre')
  const c1 = await counter.textContent()
  await page.keyboard.press('ArrowRight')
  await page.waitForTimeout(900)
  check((await counter.textContent()) !== c1, 'seta → avança no lightbox')
  await page.getByRole('button', { name: /Ir para imagem 9/ }).click()
  await page.waitForTimeout(900)
  check((await counter.textContent())?.startsWith('09'), 'miniatura navega para a imagem escolhida')
  if (SHOTS) await page.screenshot({ path: path.join(outDir, 'desktop-lightbox.png') })
  await page.keyboard.press('Escape')
  await page.waitForTimeout(800)
  check((await page.locator('.lightbox').count()) === 0, 'Esc fecha o lightbox')

  // Menu do site
  await page.evaluate(() => window.scrollTo(0, 0))
  await page.getByRole('button', { name: 'Abrir menu' }).click()
  await page.waitForTimeout(900)
  check(await page.locator('#site-menu').isVisible(), 'menu do site abre')
  check((await page.getByRole('button', { name: 'Abrir menu' }).getAttribute('aria-expanded')) === 'true', 'aria-expanded reflete o menu aberto')
  if (SHOTS) await page.screenshot({ path: path.join(outDir, 'desktop-menu.png') })
  await page.locator('#site-menu').getByRole('link', { name: /Cardápio/ }).click()
  await page.waitForTimeout(1500)
  check((await page.locator('#site-menu').count()) === 0, 'link do menu fecha o overlay')
  check(await page.evaluate(() => location.hash === '#cardapio'), 'âncora leva ao cardápio')

  // Links internos
  const broken = await page.evaluate(() =>
    [...document.querySelectorAll('a[href^="#"]')]
      .map((a) => a.getAttribute('href'))
      .filter((h) => h && h.length > 1 && !document.getElementById(h.slice(1))),
  )
  check(broken.length === 0, 'todas as âncoras internas apontam para seções existentes', broken.join(', '))
  const external = await page.evaluate(() =>
    [...document.querySelectorAll('a[target=_blank]')].filter((a) => !/noopener/.test(a.rel)).map((a) => a.href),
  )
  check(external.length === 0, 'links externos usam rel="noopener"', external.join(', '))
  const emptyLinks = await page.evaluate(() => [...document.querySelectorAll('a')].filter((a) => !a.getAttribute('href')).length)
  check(emptyLinks === 0, 'nenhum link sem destino')

  check(errors.length === 0, 'sem erros no console (desktop)', errors.join(' | '))
  await ctx.close()
}

/* ------------------------------------------------------------------ */
/* 2. Reserva                                                          */
/* ------------------------------------------------------------------ */
{
  const { page, ctx, errors } = await newPage({ width: 1280, height: 900 }, { permissions: ['clipboard-read', 'clipboard-write'] })
  await page.locator('#reservas').scrollIntoViewIfNeeded()
  await page.waitForTimeout(800)
  await page.getByRole('button', { name: 'Gerar solicitação' }).click()
  await page.waitForTimeout(600)
  const alert = page.locator('.form-errors')
  check(await alert.isVisible(), 'envio vazio mostra resumo de erros')
  check((await alert.locator('li').count()) === 4, 'resumo lista 4 campos obrigatórios', String(await alert.locator('li').count()))
  check(await alert.evaluate((el) => el === document.activeElement), 'foco vai para o resumo de erros')
  check((await page.locator('[aria-invalid=true]').count()) === 2, 'campos de texto marcados com aria-invalid')

  const day = page.locator('.datestrip__days .opt:not([disabled])').nth(1)
  await day.click()
  await page.waitForTimeout(400)
  check((await day.getAttribute('aria-checked')) === 'true', 'data selecionada (radio)')
  const closed = await page.locator('.datestrip__days .opt[disabled]').count()
  check(closed > 0, 'dias fechados aparecem desabilitados', String(closed))
  const slot = page.locator('.slots .opt').first()
  await slot.click()
  const time = (await slot.textContent())?.trim()
  await page.getByRole('button', { name: 'Adicionar uma pessoa' }).click()
  await page.getByRole('button', { name: 'Adicionar uma pessoa' }).click()
  check((await page.locator('.stepper__value .display').textContent()) === '4', 'contador de pessoas incrementa')

  await page.getByLabel('Nome').fill('Ana 1')
  await page.getByLabel('Nome').blur()
  check(/apenas letras/.test(await page.locator('.field--text.has-error').first().textContent()), 'nome com número mostra erro claro')
  await page.getByLabel('Nome').fill('Ana Souza')
  await page.getByLabel('Telefone (WhatsApp)').fill('11987654321')
  check((await page.getByLabel('Telefone (WhatsApp)').inputValue()) === '(11) 98765-4321', 'máscara de telefone aplicada')
  await page.getByLabel(/Observações/).fill('<script>alert(1)</script> Mesa perto da janela')

  check((await page.locator('.summary').textContent())?.includes(time ?? '##'), 'resumo reflete horário escolhido')
  await page.getByRole('button', { name: 'Gerar solicitação' }).click()
  await page.waitForTimeout(900)
  const result = page.locator('.result')
  check(await result.isVisible(), 'solicitação gerada em modo demonstrativo')
  const resultText = (await result.textContent()) ?? ''
  check(/nada foi enviado/i.test(resultText) && !/confirmada/i.test(resultText), 'estado demonstrativo honesto (sem "confirmada")')
  const msg = await page.locator('.result__message').inputValue()
  check(msg.includes('Ana Souza') && msg.includes('Pessoas: 4') && msg.includes('(11) 98765-4321'), 'mensagem contém os dados informados')
  check((await page.locator('.result script').count()) === 0, 'observações não injetam HTML')
  await page.getByRole('button', { name: 'Copiar resumo' }).click()
  await page.waitForTimeout(400)
  const copiedLabel = await page.locator('.result__actions .btn').textContent()
  check(/Copiado/.test(copiedLabel ?? ''), 'botão copiar dá feedback', copiedLabel)
  if (SHOTS) {
    await page.locator('#reservas').screenshot({ path: path.join(outDir, 'desktop-reserva-resultado.png') })
  }
  check(errors.length === 0, 'sem erros no console (reserva)', errors.join(' | '))
  await ctx.close()
}

/* ------------------------------------------------------------------ */
/* 3. Responsividade, overflow e capturas                              */
/* ------------------------------------------------------------------ */
const widths = [320, 360, 390, 430, 768, 1024, 1440]
for (const w of widths) {
  const h = w < 768 ? 800 : w < 1024 ? 1024 : 900
  const { page, ctx, errors } = await newPage({ width: w, height: h }, w < 768 ? { isMobile: true, hasTouch: true } : {})
  await page.waitForTimeout(1800)
  if (SHOTS) await page.screenshot({ path: path.join(outDir, `${w}-hero.png`) })
  await scrollThrough(page)
  const overflow = await page.evaluate(() => ({
    sw: document.documentElement.scrollWidth,
    cw: document.documentElement.clientWidth,
  }))
  check(overflow.sw <= overflow.cw, `${w}px: sem overflow horizontal`, JSON.stringify(overflow))

  const smallTargets = await page.evaluate(() =>
    [...document.querySelectorAll('button, a[href], [role=tab], [role=radio]')]
      .filter((el) => {
        const r = el.getBoundingClientRect()
        const cs = getComputedStyle(el)
        if (!r.width || cs.visibility === 'hidden' || el.closest('.visually-hidden, .skip-link')) return false
        if (el.closest('p, li') && el.matches('a.text-link')) return false // links em texto corrido
        return r.width < 44 - 0.5 || r.height < 36
      })
      .map((el) => `${el.className || el.tagName}:${Math.round(el.getBoundingClientRect().width)}x${Math.round(el.getBoundingClientRect().height)}`),
  )
  check(smallTargets.length === 0, `${w}px: alvos de toque confortáveis`, smallTargets.slice(0, 6).join(', '))

  if (SHOTS) {
    for (const id of ['manifesto', 'experiencia', 'cardapio', 'galeria', 'reservas', 'visite']) {
      await page.evaluate((i) => document.getElementById(i)?.scrollIntoView({ block: 'start' }), id)
      await page.waitForTimeout(1300)
      await page.screenshot({ path: path.join(outDir, `${w}-${id}.png`) })
    }
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight))
    await page.waitForTimeout(1300)
    await page.screenshot({ path: path.join(outDir, `${w}-fim.png`) })
  }
  check(errors.length === 0, `${w}px: sem erros no console`, errors.join(' | '))
  await ctx.close()
}

/* ------------------------------------------------------------------ */
/* 4. Mobile: menu por toque e cardápio                                */
/* ------------------------------------------------------------------ */
{
  const { page, ctx } = await newPage({ width: 390, height: 844 }, { isMobile: true, hasTouch: true })
  await page.waitForTimeout(1500)
  await page.getByRole('button', { name: 'Abrir menu' }).tap()
  await page.waitForTimeout(900)
  check(await page.locator('#site-menu').isVisible(), 'mobile: menu abre por toque')
  if (SHOTS) await page.screenshot({ path: path.join(outDir, '390-menu.png') })
  await page.getByRole('button', { name: 'Fechar' }).tap()
  await page.waitForTimeout(900)
  check((await page.locator('#site-menu').count()) === 0, 'mobile: menu fecha')
  await page.locator('#cardapio').scrollIntoViewIfNeeded()
  await page.getByRole('tab', { name: 'Bebidas' }).tap()
  await page.waitForTimeout(800)
  await page.locator('.dish-list .dish').first().tap()
  await page.waitForTimeout(1000)
  check(await page.getByRole('dialog').isVisible(), 'mobile: detalhe do prato abre por toque')
  if (SHOTS) await page.screenshot({ path: path.join(outDir, '390-dish-dialog.png') })
  await page.getByRole('button', { name: 'Fechar detalhes' }).tap()
  await page.waitForTimeout(900)
  // swipe no lightbox
  await page.locator('.gallery__btn').first().scrollIntoViewIfNeeded()
  await page.locator('.gallery__btn').first().tap()
  await page.waitForTimeout(900)
  const counter = page.locator('.lightbox__top .label')
  const before = await counter.textContent()
  const box = await page.locator('.lightbox__figure').boundingBox()
  if (box) {
    await page.mouse.move(box.x + box.width * 0.8, box.y + box.height / 2)
    await page.mouse.down()
    await page.mouse.move(box.x + box.width * 0.15, box.y + box.height / 2, { steps: 8 })
    await page.mouse.up()
  }
  await page.waitForTimeout(900)
  check((await counter.textContent()) !== before, 'mobile: arrastar troca a imagem do lightbox')
  await ctx.close()
}

/* ------------------------------------------------------------------ */
/* 5. Movimento reduzido                                               */
/* ------------------------------------------------------------------ */
{
  const { page, ctx } = await newPage({ width: 1280, height: 800 }, { reducedMotion: 'reduce' })
  await page.waitForTimeout(1200)
  const heroTransform = await page.evaluate(() => {
    const line = document.querySelector('.hero__title .line-reveal__line')
    return line ? getComputedStyle(line).transform : 'none'
  })
  check(heroTransform === 'none' || heroTransform === 'matrix(1, 0, 0, 1, 0, 0)', 'reduced motion: títulos sem deslocamento', heroTransform)
  check(await page.locator('.hero__title').isVisible(), 'reduced motion: conteúdo visível')
  await ctx.close()
}

/* ------------------------------------------------------------------ */
/* 6. Acessibilidade automatizada (axe-core)                           */
/* ------------------------------------------------------------------ */
{
  const { page, ctx } = await newPage({ width: 1440, height: 900 })
  await scrollThrough(page)
  try {
    await page.addScriptTag({ url: 'https://cdnjs.cloudflare.com/ajax/libs/axe-core/4.10.2/axe.min.js' })
    const violations = await page.evaluate(async () => {
      // @ts-expect-error axe global
      const r = await window.axe.run(document, { runOnly: { type: 'tag', values: ['wcag2a', 'wcag2aa', 'wcag21aa', 'best-practice'] } })
      return r.violations.map((v) => `${v.id} (${v.impact}) x${v.nodes.length}: ${v.nodes[0]?.target.join(' ')}`)
    })
    check(violations.length === 0, 'axe-core: sem violações WCAG A/AA', violations.join(' | '))
  } catch (e) {
    fail('axe-core: não foi possível carregar', String(e))
  }
  await ctx.close()
}

await browser.close()

const failed = results.filter((r) => !r.ok)
for (const r of results) console.log(`${r.ok ? '✓' : '✗'} ${r.name}${r.ok ? '' : `  → ${r.info ?? ''}`}`)
console.log(`\n${results.length - failed.length}/${results.length} verificações passaram`)
process.exit(failed.length ? 1 : 0)
