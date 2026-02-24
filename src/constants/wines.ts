export const COUNTRIES = [
  'Argentina', 'Austrália', 'Brasil', 'Chile', 'Espanha',
  'Estados Unidos', 'França', 'Itália', 'Nova Zelândia',
  'Portugal', 'Uruguai', 'Alemanha', 'África do Sul',
  'Grécia', 'Áustria', 'Hungria',
]

export const GRAPE_VARIETIES = [
  // Tintas
  'Cabernet Sauvignon', 'Merlot', 'Pinot Noir', 'Syrah/Shiraz',
  'Malbec', 'Tempranillo', 'Nebbiolo', 'Sangiovese', 'Carménère',
  'Touriga Nacional', 'Touriga Franca', 'Tinta Roriz/Aragonez',
  'Garnacha/Grenache', 'Mourvèdre', 'Barbera', 'Dolcetto',
  'Montepulciano', 'Corvina', 'Primitivo/Zinfandel',
  'Cabernet Franc', 'Petit Verdot', 'Tannat',
  // Brancas
  'Chardonnay', 'Sauvignon Blanc', 'Riesling', 'Pinot Grigio/Gris',
  'Viognier', 'Gewürztraminer', 'Moscato/Muscat',
  'Chenin Blanc', 'Verdejo', 'Albarino/Albariño',
  'Vermentino', 'Garganega', 'Arinto', 'Loureiro',
]

export const WINE_REGIONS: Record<string, string[]> = {
  Brasil: [
    'Serra Gaúcha', 'Vale dos Vinhedos', 'Campanha Gaúcha',
    'Serra Catarinense', 'Planalto Catarinense', 'Vale do São Francisco',
  ],
  Argentina: [
    'Mendoza', 'Valle de Uco', 'San Juan', 'Salta', 'Patagônia',
    'La Rioja', 'Neuquén',
  ],
  Chile: [
    'Maipo Valley', 'Colchagua Valley', 'Casablanca Valley',
    'Rapel Valley', 'Aconcagua Valley', 'Bio Bio Valley',
    'Leyda Valley',
  ],
  França: [
    'Bordeaux', 'Borgonha', 'Champagne', 'Rhône', 'Loire',
    'Alsácia', 'Provença', 'Languedoc-Roussillon',
  ],
  Itália: [
    'Toscana', 'Piemonte', 'Veneto', 'Sicília', 'Campânia',
    'Lombardia', 'Friuli', 'Puglia', 'Emilia-Romagna',
  ],
  Espanha: [
    'Rioja', 'Ribera del Duero', 'Priorat', 'Rías Baixas',
    'Bierzo', 'Jerez', 'Toro', 'Navarra',
  ],
  Portugal: [
    'Douro', 'Alentejo', 'Vinho Verde', 'Dão', 'Bairrada',
    'Setúbal', 'Lisboa', 'Tejo',
  ],
}

export const CURRENT_YEAR = new Date().getFullYear()
export const MIN_VINTAGE_YEAR = 1900
export const VINTAGE_YEARS = Array.from(
  { length: CURRENT_YEAR - MIN_VINTAGE_YEAR + 1 },
  (_, i) => CURRENT_YEAR - i,
)
