// catalog-data.js
export const defaultCatalog = [
  {
    projectId: 'ahao',
    projectName: 'AHAO Gardens',
    villas: [
      {
        villaId: 'ahao-2br', 
        name: '2BR Garden Villa', 
        area: 100, 
        ppsm: 2500, 
        baseUSD: 250000,
        leaseholdEndDate: new Date(2030, 11, 31),
        dailyRateUSD: 150,
        rentalPriceIndexPct: 5,
        monthlyPriceGrowthPct: 2
      },
      {
        villaId: 'ahao-3br', 
        name: '3BR Garden Villa', 
        area: 130, 
        ppsm: 2450, 
        baseUSD: 318500,
        leaseholdEndDate: new Date(2030, 11, 31),
        dailyRateUSD: 180,
        rentalPriceIndexPct: 5,
        monthlyPriceGrowthPct: 2
      }
    ]
  },
  {
    projectId: 'enso',
    projectName: 'Enso Villas',
    villas: [
      {
        villaId: 'enso-2br', 
        name: 'Enso 2BR', 
        area: 100, 
        ppsm: 2500, 
        baseUSD: 250000,
        leaseholdEndDate: new Date(2030, 11, 31),
        dailyRateUSD: 150,
        rentalPriceIndexPct: 5,
        monthlyPriceGrowthPct: 2
      },
      {
        villaId: 'enso-3br', 
        name: 'Enso 3BR', 
        area: 120, 
        ppsm: 2700, 
        baseUSD: 324000,
        leaseholdEndDate: new Date(2030, 11, 31),
        dailyRateUSD: 170,
        rentalPriceIndexPct: 5,
        monthlyPriceGrowthPct: 2
      }
    ]
  },
  // Добавить больше стандартных проектов и вилл
  {
    projectId: 'bali-luxury',
    projectName: 'Bali Luxury Estates',
    villas: [
      {
        villaId: 'bali-2br-lux', 
        name: '2BR Luxury Villa', 
        area: 120, 
        ppsm: 3000, 
        baseUSD: 360000,
        leaseholdEndDate: new Date(2035, 11, 31),
        dailyRateUSD: 200,
        rentalPriceIndexPct: 7,
        monthlyPriceGrowthPct: 2.5
      },
      {
        villaId: 'bali-4br-lux', 
        name: '4BR Luxury Villa', 
        area: 180, 
        ppsm: 3200, 
        baseUSD: 576000,
        leaseholdEndDate: new Date(2035, 11, 31),
        dailyRateUSD: 300,
        rentalPriceIndexPct: 7,
        monthlyPriceGrowthPct: 2.5
      }
    ]
  }
];
