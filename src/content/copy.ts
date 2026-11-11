import type { ImageName } from './images'

/**
 * TEXTOS DO SITE
 * Conteúdo demonstrativo. Ajuste a voz para cada cliente.
 */

export const navItems = [
  { id: 'manifesto', label: 'A casa' },
  { id: 'experiencia', label: 'Experiência' },
  { id: 'cardapio', label: 'Cardápio' },
  { id: 'galeria', label: 'Galeria' },
  { id: 'reservas', label: 'Reservas' },
  { id: 'visite', label: 'Visite' },
] as const

export const hero = {
  eyebrow: 'Cozinha de brasa & estação',
  titleLines: ['Fogo lento,', 'sabor que', 'permanece'],
  intro:
    'Uma cozinha guiada pela brasa e pelo que a estação oferece. Poucos ingredientes, muito tempo e uma mesa onde ninguém tem pressa.',
  ctaMenu: 'Ver o cardápio',
  ctaReserve: 'Reservar mesa',
  tiles: [
    { id: 'cardapio', label: 'Cardápio', image: 'd-beef' as ImageName },
    { id: 'reservas', label: 'Reservas', image: 'wine-table' as ImageName },
  ],
}

export const manifesto = {
  index: '01',
  label: 'A casa',
  statement:
    'Cozinhamos com o que chega na semana, no ritmo da brasa. Sem atalhos, sem excesso: cada prato tem poucos elementos, e cada elemento tem um motivo para estar ali.',
  pillars: [
    {
      title: 'Brasa',
      text: 'Lenha, carvão e cinzas definem textura e aroma. O fogo é o primeiro ingrediente.',
    },
    {
      title: 'Estação',
      text: 'O cardápio muda com a colheita. O que não está no auge, espera a próxima.',
    },
    {
      title: 'Tempo',
      text: 'Maturação, fermentação e cocção lenta. A cozinha trabalha muito antes do serviço.',
    },
  ],
}

export const experience = {
  index: '02',
  label: 'Experiência',
  title: 'Uma noite em quatro tempos',
  chapters: [
    {
      id: 'ambiente',
      title: 'Ambiente',
      text: 'Luz baixa, madeira, linho. Um salão pensado para conversas longas e mesas bem espaçadas.',
      image: 'room' as ImageName,
    },
    {
      id: 'gastronomia',
      title: 'Gastronomia',
      text: 'Pratos finalizados no passe, à vista do salão. Técnica precisa a serviço de ingredientes simples.',
      image: 'chef-hands' as ImageName,
    },
    {
      id: 'hospitalidade',
      title: 'Hospitalidade',
      text: 'Uma equipe que conhece cada prato e cada rótulo, e sabe a hora certa de se aproximar.',
      image: 'wine-table' as ImageName,
    },
    {
      id: 'atmosfera',
      title: 'Atmosfera',
      text: 'Velas acesas, música baixa e o som da cozinha ao fundo. O jantar como um pequeno ritual.',
      image: 'long-table' as ImageName,
    },
  ],
}

export const menuSection = {
  index: '03',
  label: 'Cardápio',
  priceNote: 'Valores demonstrativos',
}

export interface GalleryItem {
  image: ImageName
  caption: string
  /** Classe de composição no grid editorial. */
  shape: 'tall' | 'wide' | 'square' | 'hero'
}

export const gallery = {
  index: '04',
  label: 'Galeria',
  title: 'Do fogo à mesa',
  items: [
    { image: 'hero', caption: 'Finalização no passe', shape: 'hero' },
    { image: 'citrus', caption: 'Cítricos da estação', shape: 'tall' },
    { image: 'pendants', caption: 'O salão ao anoitecer', shape: 'wide' },
    { image: 'plating', caption: 'Montagem', shape: 'square' },
    { image: 'd-ribeye', caption: 'Corte alto, fatiado à mesa', shape: 'tall' },
    { image: 'spoons', caption: 'Sais e especiarias', shape: 'wide' },
    { image: 'pass', caption: 'Silêncio antes do serviço', shape: 'tall' },
    { image: 'plums', caption: 'Ameixas para fermentar', shape: 'square' },
    { image: 'candle-room', caption: 'Mesas à luz de velas', shape: 'wide' },
  ] satisfies GalleryItem[],
}

/**
 * DEPOIMENTOS
 * Deixe vazio até receber avaliações reais e autorizadas.
 * Enquanto vazio, a seção mostra espaços reservados identificados.
 */
export interface Testimonial {
  quote: string
  author: string
  source: string
}

export const testimonials: Testimonial[] = []

export const testimonialPlaceholders = [
  {
    quote:
      'Aqui entra um depoimento real de cliente, com duas ou três linhas, mantendo as palavras originais de quem escreveu.',
    author: 'Nome do cliente',
    source: 'Origem da avaliação',
  },
  {
    quote: 'Espaço para uma segunda avaliação verificada, de preferência sobre outro aspecto da experiência.',
    author: 'Nome do cliente',
    source: 'Origem da avaliação',
  },
  {
    quote: 'Espaço para uma menção de imprensa ou guia gastronômico, com autorização de uso.',
    author: 'Veículo ou guia',
    source: 'Data da publicação',
  },
]

export const credibility = {
  index: '05',
  label: 'Quem já esteve aqui',
  title: 'Palavras de quem sentou à mesa',
}

export const reservation = {
  index: '06',
  label: 'Reservas',
  title: 'Reserve sua mesa',
  intro:
    'Escolha data, horário e número de pessoas. A solicitação segue para a equipe da casa, que responde confirmando a disponibilidade.',
}

export const visit = {
  index: '07',
  label: 'Visite',
  title: 'Onde nos encontrar',
}

export const finalCta = {
  title: ['Uma mesa', 'à sua espera'],
  text: 'Reservas para a semana abrem com antecedência. Grupos e eventos privados sob consulta.',
  cta: 'Reservar mesa',
}
