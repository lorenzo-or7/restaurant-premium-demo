# Or7.dev · 01.01 — Restaurante Premium

Protótipo comercial de site para restaurante autoral. Marca demonstrativa: **Lume — Cozinha de brasa & estação** (fictícia).

React 19 · TypeScript · Vite · Motion · CSS moderno (sem framework de UI).

## Executar

```bash
npm install
npm run dev            # desenvolvimento
npm run build          # typecheck + build de produção (dist/)
npm run preview        # serve o build em http://localhost:4173
```

## Verificações

```bash
npm run typecheck      # tsc -b
npm run lint           # oxlint
npm run test:e2e       # 73 verificações em Chrome/Edge local (precisa do preview rodando)
SHOTS=1 npm run test:e2e   # também salva capturas em ./test-results
node scripts/perf.mjs  # LCP/CLS com Slow 4G + CPU 4x
```

`BASE_URL` muda o endereço testado; `BROWSER_PATH` aponta outro executável do Chrome/Edge.
A auditoria axe-core carrega o script de `cdnjs.cloudflare.com` durante o teste.

## Personalizar para um cliente

| O quê | Onde |
|---|---|
| Nome, descritor, SEO, WhatsApp, telefone, e-mail, endereço, mapa, horários, regras de reserva, redes, crédito/portfólio | `src/config/site.ts` |
| Cardápio (categorias, pratos, preços, ingredientes, restrições, alérgenos) | `src/content/menu.ts` |
| Textos das seções, galeria, depoimentos | `src/content/copy.ts` |
| Fotografias e textos alternativos | `scripts/images.json` + `npm run images`, alt em `src/content/images.ts` |
| Paleta, tipografia, espaçamentos, curvas de movimento | `src/styles/tokens.css` |
| Título/meta estáticos e preload da hero | `index.html` |

- **WhatsApp:** defina `whatsappNumber` (ex.: `"5511900000000"`). Sem número, a reserva fica em modo demonstrativo: nada é enviado e o resumo é copiável.
- **Endereço/mapa:** preencha `address.lines`, `mapsQuery` (ativa "Como chegar") e `mapEmbedUrl` (troca o mapa ilustrativo por um iframe).
- **Depoimentos:** preencha `testimonials` em `copy.ts` só com avaliações reais e autorizadas; vazio mostra espaços reservados identificados.
- **Modo demo:** `demoMode: false` remove os avisos de conteúdo demonstrativo.
- **Imagens próprias:** gere arquivos `nome-480.webp`, `nome-960.webp`, `nome-1600.webp` em `public/images` e atualize `src/content/image-meta.json` (largura/altura evitam CLS).

## Estrutura

```
src/
  config/site.ts        configuração comercial
  content/              cardápio, textos, imagens
  components/           ui (Img, botões, ícones, magnetic), motion (reveals, parallax), easing
  hooks/                seção ativa, trava de scroll, diálogo acessível
  lib/                  formatação/horários, reserva (validação, máscara, mensagem)
  sections/             Navbar, Hero, Manifesto, Experience, Menu, DishDialog, Gallery, Testimonials, Reservation, Location, Closing
  styles/               tokens, componentes, seções
scripts/                fetch-images, e2e, perf
```

Fotografias de demonstração: [Unsplash](https://unsplash.com/license). As URLs de origem estão em `src/content/image-meta.json`.


## Publicar no GitHub Pages

Repositório: `lorenzo-or7/restaurant-premium-demo`

1. Envie estes arquivos para a branch `main`.
2. Em **Settings → Pages → Build and deployment**, escolha **GitHub Actions**.
3. Em **Actions**, acompanhe o workflow **Deploy GitHub Pages**.
4. Abra https://lorenzo-or7.github.io/restaurant-premium-demo/

O `vite.config.ts` já usa o `base` correto e o workflow publica `dist` automaticamente.

**Nota:** este projeto é uma demonstração, sem reservas reais.
