import type { ImageName } from './images'

/**
 * CARDÁPIO DEMONSTRATIVO
 * Pratos, descrições e preços são fictícios e servem apenas para
 * demonstrar a estrutura. Substitua pelo cardápio do cliente.
 */

export type DietTag = 'vegetariano' | 'vegano' | 'sem-gluten' | 'sem-lactose'

export const dietLabels: Record<DietTag, { short: string; label: string }> = {
  vegetariano: { short: 'V', label: 'Vegetariano' },
  vegano: { short: 'VG', label: 'Vegano' },
  'sem-gluten': { short: 'SG', label: 'Sem glúten' },
  'sem-lactose': { short: 'SL', label: 'Sem lactose' },
}

export interface Dish {
  id: string
  name: string
  /** Frase curta exibida na lista. */
  summary: string
  /** Texto maior exibido na visualização detalhada. */
  description: string
  ingredients: string[]
  diet: DietTag[]
  /** Alérgenos declarados. */
  allergens: string[]
  /** Valor em reais (demonstrativo). */
  price: number
  image: ImageName
  /** Destaque do chef. */
  signature?: boolean
}

export interface MenuCategory {
  id: string
  label: string
  /** Título editorial exibido no painel de imagem. */
  title: string
  note: string
  image: ImageName
  dishes: Dish[]
}

export const menu: MenuCategory[] = [
  {
    id: 'entradas',
    label: 'Entradas',
    title: 'Para abrir a mesa',
    note: 'Pequenas porções pensadas para dividir.',
    image: 'd-burrata',
    dishes: [
      {
        id: 'burrata-beterraba',
        name: 'Burrata & beterraba',
        summary: 'Beterraba assada na brasa, burrata fresca e emulsão de ervas.',
        description:
          'Beterrabas assadas lentamente nas cinzas, servidas mornas com burrata cremosa, pontos de emulsão de ervas e flores comestíveis da estação.',
        ingredients: ['Burrata', 'Beterraba', 'Emulsão de ervas', 'Flores comestíveis', 'Azeite extravirgem'],
        diet: ['vegetariano', 'sem-gluten'],
        allergens: ['Lactose'],
        price: 64,
        image: 'd-burrata',
        signature: true,
      },
      {
        id: 'folhas-tostadas',
        name: 'Folhas tostadas',
        summary: 'Folhas da horta, castanhas tostadas e vinagrete de ameixa.',
        description:
          'Uma salada morna de folhas rapidamente tostadas na grelha, castanhas, cebola em conserva e vinagrete de ameixa fermentada.',
        ingredients: ['Folhas da estação', 'Castanhas', 'Cebola em conserva', 'Vinagrete de ameixa'],
        diet: ['vegano', 'vegetariano', 'sem-gluten', 'sem-lactose'],
        allergens: ['Castanhas'],
        price: 48,
        image: 'd-greens',
      },
      {
        id: 'mexilhoes-defumados',
        name: 'Mexilhões defumados',
        summary: 'Mexilhões abertos na brasa, manteiga de alga e limão.',
        description:
          'Mexilhões abertos diretamente sobre a brasa e finalizados com manteiga de alga, limão tostado e pão de fermentação natural para acompanhar.',
        ingredients: ['Mexilhões', 'Manteiga de alga', 'Limão', 'Pão de fermentação natural'],
        diet: [],
        allergens: ['Moluscos', 'Lactose', 'Glúten'],
        price: 72,
        image: 'd-mussels',
      },
      {
        id: 'peixe-curado',
        name: 'Peixe curado',
        summary: 'Peixe do dia curado em sal cítrico, ervas e leite de coco.',
        description:
          'Fatias de peixe do dia curadas em sal cítrico, servidas com caldo frio de leite de coco, pimenta suave e ervas frescas.',
        ingredients: ['Peixe do dia', 'Sal cítrico', 'Leite de coco', 'Pimenta suave', 'Ervas'],
        diet: ['sem-gluten', 'sem-lactose'],
        allergens: ['Peixe'],
        price: 68,
        image: 'd-crudo',
      },
    ],
  },
  {
    id: 'principais',
    label: 'Principais',
    title: 'O centro do fogo',
    note: 'Carnes, peixes e massas preparados na brasa ou no forno a lenha.',
    image: 'd-beef',
    dishes: [
      {
        id: 'file-brasa',
        name: 'Filé na brasa',
        summary: 'Filé maturado, purê de raízes e aspargos grelhados.',
        description:
          'Filé maturado selado na brasa e finalizado com sal em flocos, acompanhado de purê sedoso de raízes e aspargos grelhados.',
        ingredients: ['Filé maturado', 'Purê de raízes', 'Aspargos', 'Sal em flocos'],
        diet: ['sem-gluten'],
        allergens: ['Lactose'],
        price: 148,
        image: 'd-beef',
        signature: true,
      },
      {
        id: 'peixe-cogumelos',
        name: 'Peixe & cogumelos',
        summary: 'Peixe na manteiga noisette, cogumelos e molho de vinho.',
        description:
          'Posta de peixe dourada na manteiga noisette, cogumelos salteados e redução de vinho branco com ervas.',
        ingredients: ['Peixe do dia', 'Cogumelos', 'Manteiga noisette', 'Vinho branco'],
        diet: ['sem-gluten'],
        allergens: ['Peixe', 'Lactose'],
        price: 132,
        image: 'd-fish',
      },
      {
        id: 'cordeiro-lento',
        name: 'Cordeiro de cocção lenta',
        summary: 'Paleta de cordeiro, legumes assados e jus reduzido.',
        description:
          'Paleta de cordeiro cozida por horas no forno a lenha, servida com legumes assados e o próprio jus reduzido.',
        ingredients: ['Paleta de cordeiro', 'Legumes assados', 'Jus de cordeiro', 'Alecrim'],
        diet: ['sem-gluten', 'sem-lactose'],
        allergens: [],
        price: 156,
        image: 'd-lamb',
      },
      {
        id: 'massa-tomate',
        name: 'Massa ao tomate assado',
        summary: 'Massa fresca, tomates assados na brasa e manjericão.',
        description:
          'Massa fresca feita na casa com molho de tomates assados na brasa, azeite de manjericão e queijo curado.',
        ingredients: ['Massa fresca', 'Tomates', 'Manjericão', 'Queijo curado'],
        diet: ['vegetariano'],
        allergens: ['Glúten', 'Ovos', 'Lactose'],
        price: 92,
        image: 'd-pasta',
      },
      {
        id: 'ancho-fatiado',
        name: 'Ancho para dois',
        summary: 'Corte alto fatiado, servido com manteiga de ervas.',
        description:
          'Corte alto preparado lentamente na brasa e fatiado à mesa, com manteiga de ervas e acompanhamento da estação.',
        ingredients: ['Ancho', 'Manteiga de ervas', 'Acompanhamento da estação'],
        diet: ['sem-gluten'],
        allergens: ['Lactose'],
        price: 268,
        image: 'd-ribeye',
      },
    ],
  },
  {
    id: 'sobremesas',
    label: 'Sobremesas',
    title: 'O último gesto',
    note: 'Doces de confeitaria autoral, servidos à temperatura certa.',
    image: 'd-chocolate',
    dishes: [
      {
        id: 'chocolate-amargo',
        name: 'Chocolate amargo',
        summary: 'Bolo quente de chocolate, frutas vermelhas e cacau.',
        description:
          'Bolo de chocolate amargo com centro macio, frutas vermelhas e uma camada fina de cacau em pó.',
        ingredients: ['Chocolate 70%', 'Frutas vermelhas', 'Cacau', 'Manteiga'],
        diet: ['vegetariano'],
        allergens: ['Glúten', 'Ovos', 'Lactose'],
        price: 44,
        image: 'd-chocolate',
        signature: true,
      },
      {
        id: 'framboesa',
        name: 'Framboesa',
        summary: 'Mousse de framboesa, pétalas e açúcar de baunilha.',
        description:
          'Mousse leve de framboesa sobre base crocante de amêndoas, coberta com açúcar de baunilha e framboesas frescas.',
        ingredients: ['Framboesa', 'Amêndoas', 'Baunilha', 'Creme'],
        diet: ['vegetariano', 'sem-gluten'],
        allergens: ['Amêndoas', 'Lactose'],
        price: 42,
        image: 'd-raspberry',
      },
      {
        id: 'pavlova-amoras',
        name: 'Pavlova de amoras',
        summary: 'Merengue crocante, creme leve e amoras maceradas.',
        description:
          'Merengue assado lentamente, crocante por fora e macio por dentro, com creme leve e amoras maceradas em vinho.',
        ingredients: ['Merengue', 'Creme', 'Amoras', 'Vinho tinto'],
        diet: ['vegetariano', 'sem-gluten'],
        allergens: ['Ovos', 'Lactose'],
        price: 40,
        image: 'd-pavlova',
      },
      {
        id: 'bolo-especiarias',
        name: 'Bolo de especiarias',
        summary: 'Bolo úmido de especiarias e sorvete de creme.',
        description:
          'Fatia de bolo úmido de especiarias, aquecida na hora e servida com sorvete de creme da casa.',
        ingredients: ['Especiarias', 'Melado', 'Sorvete de creme'],
        diet: ['vegetariano'],
        allergens: ['Glúten', 'Ovos', 'Lactose'],
        price: 38,
        image: 'd-cake',
      },
    ],
  },
  {
    id: 'bebidas',
    label: 'Bebidas',
    title: 'Copos e taças',
    note: 'Coquetelaria autoral e uma carta de vinhos em rotação.',
    image: 'd-coupe',
    dishes: [
      {
        id: 'coquetel-ambar',
        name: 'Âmbar',
        summary: 'Destilado envelhecido, vermute e casca de laranja.',
        description:
          'Coquetel mexido de destilado envelhecido, vermute da casa e óleos de casca de laranja, servido em taça gelada.',
        ingredients: ['Destilado envelhecido', 'Vermute', 'Laranja'],
        diet: ['vegano', 'vegetariano', 'sem-gluten', 'sem-lactose'],
        allergens: [],
        price: 46,
        image: 'd-coupe',
        signature: true,
      },
      {
        id: 'coquetel-brasa',
        name: 'Brasa',
        summary: 'Bourbon, xarope defumado e bitters.',
        description:
          'Releitura de um clássico: bourbon, xarope defumado na brasa da cozinha, bitters aromáticos e laranja.',
        ingredients: ['Bourbon', 'Xarope defumado', 'Bitters', 'Laranja'],
        diet: ['vegano', 'vegetariano', 'sem-lactose'],
        allergens: [],
        price: 48,
        image: 'd-oldfashioned',
      },
      {
        id: 'coquetel-rubi',
        name: 'Rubi',
        summary: 'Gin, framboesa, limão e espuma sedosa.',
        description:
          'Gin, framboesas frescas e limão, batido até ganhar uma espuma sedosa. Leve, ácido e aromático.',
        ingredients: ['Gin', 'Framboesa', 'Limão', 'Clara de ovo'],
        diet: ['vegetariano', 'sem-gluten', 'sem-lactose'],
        allergens: ['Ovos'],
        price: 44,
        image: 'd-sour',
      },
      {
        id: 'coquetel-horta',
        name: 'Horta',
        summary: 'Sem álcool: chá gelado, ervas e cítricos.',
        description:
          'Opção sem álcool com chá gelado da casa, ervas frescas, cítricos e água com gás.',
        ingredients: ['Chá gelado', 'Ervas', 'Cítricos', 'Água com gás'],
        diet: ['vegano', 'vegetariano', 'sem-gluten', 'sem-lactose'],
        allergens: [],
        price: 28,
        image: 'd-highball',
      },
      {
        id: 'vinho-taca',
        name: 'Vinho em taça',
        summary: 'Seleção rotativa de tintos, brancos e espumantes.',
        description:
          'Uma seleção que muda com frequência. A equipe de salão indica o rótulo do dia e a harmonização com cada prato.',
        ingredients: ['Seleção rotativa'],
        diet: [],
        allergens: ['Sulfitos'],
        price: 42,
        image: 'd-wine',
      },
    ],
  },
]
