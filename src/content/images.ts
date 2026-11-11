import meta from './image-meta.json'

/**
 * BIBLIOTECA DE FOTOGRAFIAS
 * Arquivos gerados por `node scripts/fetch-images.mjs` em /public/images
 * nas larguras 480, 960 e 1600 (WebP). Para trocar uma foto, edite
 * scripts/images.json (ou coloque arquivos com o mesmo padrão de nome)
 * e atualize o texto alternativo aqui.
 *
 * Fonte das fotografias de demonstração: Unsplash (Unsplash License).
 */

export const imageWidths = [480, 960, 1600] as const

const alts = {
  hero: 'Molho sendo despejado com uma colher sobre um prato branco, em uma cozinha com pouca luz',
  citrus: 'Frutas cítricas sob luz baixa, sobre fundo escuro',
  plums: 'Ameixas escuras em uma tigela, sob luz lateral',
  room: 'Salão de restaurante com luminárias pendentes e mesas postas',
  pendants: 'Luminárias pendentes acesas sobre um salão de jantar',
  'chef-hands': 'Mãos de cozinheiro finalizando um prato com uma pinça',
  'wine-table': 'Taça de vinho branco sobre mesa posta, com luz lateral',
  'long-table': 'Mesa longa posta para um jantar, com velas e flores',
  'candle-room': 'Salão à noite com luz de velas sobre as mesas',
  interior: 'Detalhe de um salão com taças e vasos sob luz quente',
  pass: 'Cozinheiro concentrado finalizando pratos no passe',
  plating: 'Mãos montando um prato sobre uma bancada de madeira',
  salt: 'Pequenas tigelas de sal e especiarias sobre pedra escura',
  spoons: 'Colheres com sais e pimentas sobre mármore',
  'wine-glow': 'Contorno de uma taça de vinho tinto iluminada no escuro',
  'd-burrata': 'Prato com burrata, beterraba e pontos de emulsão verde',
  'd-greens': 'Salada morna de folhas em prato fundo claro',
  'd-mussels': 'Mexilhões abertos sobre superfície escura',
  'd-crudo': 'Peixe curado com ervas em prato rosado',
  'd-beef': 'Filé fatiado com aspargos e purê em prato de pedra',
  'd-fish': 'Peixe com cogumelos e molho em prato escuro texturizado',
  'd-lamb': 'Paleta de cordeiro com legumes em prato fundo, sob luz baixa',
  'd-pasta': 'Massa ao molho de tomate enrolada em um garfo',
  'd-ribeye': 'Corte alto de carne fatiado, rosado ao centro',
  'd-chocolate': 'Bolo de chocolate com frutas vermelhas sobre fundo escuro',
  'd-raspberry': 'Sobremesa de framboesa coberta de açúcar, cercada por framboesas',
  'd-pavlova': 'Pavlova com amoras e calda escura',
  'd-cake': 'Fatia de bolo com sorvete em prato escuro',
  'd-coupe': 'Coquetel âmbar em taça com casca de laranja',
  'd-oldfashioned': 'Coquetel em copo baixo lapidado com casca de laranja',
  'd-sour': 'Coquetel vermelho com espuma e framboesa em taça',
  'd-highball': 'Coquetel gelado com ervas em copo, sobre tábua de madeira',
  'd-wine': 'Taças de vinho tinto alinhadas em um balcão',
} as const

export type ImageName = keyof typeof alts

interface ImageMeta {
  w: number
  h: number
  source: string
}

export interface ImageAsset {
  name: ImageName
  alt: string
  width: number
  height: number
  src: string
  srcSet: string
  source: string
}

export function getImage(name: ImageName): ImageAsset {
  const m = (meta as Record<string, ImageMeta>)[name]
  const base = import.meta.env.BASE_URL
  return {
    name,
    alt: alts[name],
    width: m?.w ?? 1600,
    height: m?.h ?? 1067,
    src: `${base}images/${name}-960.webp`,
    srcSet: imageWidths.map((w) => `${base}images/${name}-${w}.webp ${w}w`).join(', '),
    source: m?.source ?? '',
  }
}
