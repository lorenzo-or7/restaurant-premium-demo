/**
 * CONFIGURAÇÃO COMERCIAL CENTRAL
 * ---------------------------------------------------------------
 * Tudo que muda de um restaurante para outro está aqui (ou em
 * src/content/*). Para personalizar o protótipo para um cliente,
 * comece por este arquivo.
 *
 * Valores marcados como `null` ou com o prefixo "demo" indicam que
 * não existe dado real configurado — a interface mostra um estado
 * demonstrativo explícito nesses casos.
 */

export type Weekday = 0 | 1 | 2 | 3 | 4 | 5 | 6 // 0 = domingo

export interface OpeningWindow {
  /** "19:00" */
  open: string
  /** "23:30" — pode passar da meia-noite, ex.: "00:30" */
  close: string
}

export interface SiteConfig {
  brand: {
    name: string
    /** Linha curta usada abaixo do wordmark e em metadados. */
    descriptor: string
    /** Título da aba e descrição para buscadores. */
    seoTitle: string
    seoDescription: string
  }
  /** Indica que o site é um protótipo. Mostra avisos discretos de conteúdo demonstrativo. */
  demoMode: boolean
  contact: {
    /** Telefone exibido. null = mostra placeholder demonstrativo. */
    phoneDisplay: string | null
    /** Formato E.164 sem "+", usado em links tel:. */
    phoneE164: string | null
    email: string | null
  }
  /**
   * Destino das pré-reservas via WhatsApp.
   * Formato: código do país + DDD + número, só dígitos. Ex.: "5511900000000".
   * null = modo demonstrativo (nada é enviado; o resumo fica copiável).
   */
  whatsappNumber: string | null
  address: {
    /** Linhas do endereço. null = placeholder demonstrativo. */
    lines: string[] | null
    /** Consulta usada para gerar o link "Como chegar". null = sem link. */
    mapsQuery: string | null
    /** URL de incorporação do mapa (iframe). null = mapa ilustrativo. */
    mapEmbedUrl: string | null
    /** Notas de acesso: estacionamento, transporte etc. */
    directions: string[]
  }
  /** Horários por dia da semana. Lista vazia = fechado. */
  hours: Record<Weekday, OpeningWindow[]>
  reservation: {
    /** Quantos dias à frente o seletor de data mostra. */
    daysAhead: number
    /** Intervalo entre horários disponíveis, em minutos. */
    slotIntervalMinutes: number
    /** Último horário de chegada antes do fechamento, em minutos. */
    lastSeatingBeforeCloseMinutes: number
    minGuests: number
    maxGuests: number
    /** A partir deste número, mostra orientação para grupos. */
    largeGroupThreshold: number
    notesMaxLength: number
  }
  socials: { label: string; href: string }[]
  credits: {
    studio: string
    /** URL do portfólio. null = assinatura sem link. */
    portfolioUrl: string | null
  }
  currency: { locale: string; code: string }
}

export const site: SiteConfig = {
  brand: {
    name: 'Lume',
    descriptor: 'Cozinha de brasa & estação',
    seoTitle: 'Lume — Cozinha de brasa & estação',
    seoDescription:
      'Protótipo demonstrativo Or7.dev de restaurante autoral: cardápio interativo, galeria e pré-reserva por WhatsApp.',
  },
  demoMode: true,
  contact: {
    phoneDisplay: null,
    phoneE164: null,
    email: null,
  },
  whatsappNumber: null,
  address: {
    lines: null,
    mapsQuery: null,
    mapEmbedUrl: null,
    directions: [
      'Indicação de estacionamento ou manobrista',
      'Estação de transporte mais próxima',
      'Acesso para pessoas com mobilidade reduzida',
    ],
  },
  hours: {
    0: [{ open: '12:00', close: '16:00' }],
    1: [],
    2: [{ open: '19:00', close: '23:30' }],
    3: [{ open: '19:00', close: '23:30' }],
    4: [{ open: '19:00', close: '23:30' }],
    5: [{ open: '19:00', close: '00:30' }],
    6: [
      { open: '12:30', close: '16:00' },
      { open: '19:00', close: '00:30' },
    ],
  },
  reservation: {
    daysAhead: 21,
    slotIntervalMinutes: 30,
    lastSeatingBeforeCloseMinutes: 90,
    minGuests: 1,
    maxGuests: 12,
    largeGroupThreshold: 9,
    notesMaxLength: 240,
  },
  socials: [
    { label: 'Instagram', href: '' },
    { label: 'TikTok', href: '' },
    { label: 'Google', href: '' },
  ],
  credits: {
    studio: 'Or7.dev',
    portfolioUrl: null,
  },
  currency: { locale: 'pt-BR', code: 'BRL' },
}
