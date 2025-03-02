import { Product } from '@/types'

interface Recommendation {
  mainDish: Product
  drink: Product
  dessert: Product
}

// Sabit anahtar kelime listeleri - Bellekte bir kere tutulacak
const MAIN_DISH_PRIORITY = new Set([
  'steak house', 'steakhouse', 'et yemekleri',
  'izgara', 'ana yemekler', 'burgerler', 'kebaplar',
  'pideler', 'makarnalar', 'tavuk yemekleri'
]);

const DRINK_PRIORITY = new Set([
  'içecekler', 'beverages', 'drinks', 'kahveler',
  'çaylar', 'soğuk içecekler', 'sıcak içecekler',
  'meşrubatlar', 'smoothies', 'milkshakes'
]);

const DESSERT_PRIORITY = new Set([
  'tatlılar', 'desserts', 'pastalar', 'sütlü tatlılar',
  'dondurma çeşitleri', 'waffle çeşitleri', 'baklavalar',
  'cheesecake', 'tiramisu', 'künefe'
]);

// Et yemekleri için anahtar kelimeler
const MEAT_KEYWORDS = new Set([
  'et', 'meat', 'steak', 'biftek', 'bonfile', 'pirzola', 'köfte',
  'kebap', 'döner', 'tavuk', 'chicken', 'kanat', 'but', 'antrikot',
  'kuzu', 'dana', 'beef', 'lamb', 'şiş', 'ızgara', 'mangal', 'burger',
  'sucuk', 'pastırma', 'kavurma', 'tandır', 'külbastı', 'şnitzel'
]);

// Vejetaryen yemekler için anahtar kelimeler
const VEGETARIAN_KEYWORDS = new Set([
  'vejetaryen', 'vegetarian', 'vegan', 'sebze', 'vegetable',
  'salata', 'salad', 'yeşillik', 'mantar', 'mushroom',
  'mercimek', 'nohut', 'fasulye', 'patlıcan', 'kabak',
  'ıspanak', 'brokoli', 'karnabahar', 'tofu'
]);

// Sağlıklı yemekler için anahtar kelimeler
const HEALTHY_KEYWORDS = new Set([
  'sağlıklı', 'healthy', 'fit', 'diyet', 'diet', 'light',
  'düşük kalorili', 'low calorie', 'protein', 'glutensiz',
  'gluten free', 'organik', 'organic', 'kinoa', 'quinoa',
  'avokado', 'avocado', 'chia', 'badem', 'almond'
]);

// Yemek türleri için anahtar kelimeler
const CUISINE_TYPES = new Set([
  { type: 'türk', keywords: ['türk', 'turkish', 'anadolu', 'osmanlı', 'geleneksel'] },
  { type: 'italyan', keywords: ['italyan', 'italian', 'pizza', 'pasta', 'makarna'] },
  { type: 'meksika', keywords: ['meksika', 'mexican', 'taco', 'burrito', 'nachos'] },
  { type: 'uzakdoğu', keywords: ['çin', 'japon', 'thai', 'sushi', 'noodle', 'asya'] },
  { type: 'hint', keywords: ['hint', 'indian', 'curry', 'masala', 'tandoori'] }
]);

// Öğün tercihleri için anahtar kelimeler
const MEAL_TYPES = new Set([
  { type: 'kahvaltı', keywords: ['kahvaltı', 'breakfast', 'sabah', 'morning'] },
  { type: 'öğle', keywords: ['öğle', 'lunch', 'hafif'] },
  { type: 'akşam', keywords: ['akşam', 'dinner', 'gece'] }
]);

// Mevsimsel tercihler için anahtar kelimeler
const SEASONAL_PREFERENCES = new Set([
  { type: 'yaz', keywords: ['yaz', 'summer', 'soğuk', 'ferah', 'serinletici'] },
  { type: 'kış', keywords: ['kış', 'winter', 'sıcak', 'çorba', 'soup'] }
]);

// Doku tercihleri için anahtar kelimeler
const TEXTURE_PREFERENCES = new Set([
  { type: 'çıtır', keywords: ['çıtır', 'crispy', 'kıtır', 'gevrek'] },
  { type: 'yumuşak', keywords: ['yumuşak', 'soft', 'tender', 'lokum'] }
]);

// Pişirme yöntemi tercihleri
const COOKING_METHODS = new Set([
  { type: 'ızgara', keywords: ['ızgara', 'grilled', 'mangal', 'barbekü'] },
  { type: 'fırın', keywords: ['fırın', 'oven', 'baked', 'roasted'] },
  { type: 'tava', keywords: ['tava', 'pan', 'sote', 'kavurma'] },
  { type: 'buğulama', keywords: ['buğulama', 'steamed', 'haşlama', 'boiled'] }
]);

// Yeni anahtar kelime setleri
const MOOD_PREFERENCES = new Set([
  { type: 'romantik', keywords: ['romantik', 'romantic', 'özel', 'special', 'date', 'buluşma'] },
  { type: 'enerjik', keywords: ['enerji', 'energy', 'güç', 'power', 'dinç', 'canlı'] },
  { type: 'rahatlatıcı', keywords: ['rahat', 'relax', 'sakin', 'huzur', 'peaceful'] },
  { type: 'sosyal', keywords: ['sosyal', 'social', 'arkadaş', 'friend', 'grup', 'kalabalık'] }
]);

const DIETARY_RESTRICTIONS = new Set([
  { type: 'glutensiz', keywords: ['glutensiz', 'gluten free', 'çölyak'] },
  { type: 'laktozsuz', keywords: ['laktozsuz', 'lactose free', 'sütsüz'] },
  { type: 'şekersiz', keywords: ['şekersiz', 'sugar free', 'diyabetik'] },
  { type: 'vegan', keywords: ['vegan', 'plant based', 'bitkisel'] }
]);

const TASTE_PREFERENCES = new Set([
  { type: 'tatlı', keywords: ['tatlı', 'sweet', 'şekerli', 'ballı'] },
  { type: 'ekşi', keywords: ['ekşi', 'sour', 'limonlu', 'narenciye'] },
  { type: 'tuzlu', keywords: ['tuzlu', 'salty', 'çerezlik'] },
  { type: 'umami', keywords: ['umami', 'doyurucu', 'lezzetli'] }
]);

// Optimize edilmiş kategori kontrol fonksiyonları
function isMainDishCategory(category: string): boolean {
  const lowerCategory = category.toLowerCase();
  
  // Öncelikli kategorileri kontrol et
  for (const cat of MAIN_DISH_PRIORITY) {
    if (lowerCategory.includes(cat)) return true;
  }

  // Ana yemek anahtar kelimeleri
  const isMainDish = /burger|pizza|makarna|spagetti|tavuk|chicken|et|meat|steak|biftek|salata|salad|wrap|dürüm|köfte|kebap|döner|bonfile|antrikot|pirzola|ızgara|mangal/.test(lowerCategory);
  
  // İçecek veya tatlı olmamalı
  const isNotDrinkOrDessert = !/içecek|drink|beverage|tatlı|dessert|sweet|coffee|kahve|tea|çay/.test(lowerCategory);
  
  return isMainDish && isNotDrinkOrDessert;
}

function isDrinkCategory(category: string): boolean {
  const lowerCategory = category.toLowerCase();
  
  // Öncelikli kategorileri kontrol et
  for (const cat of DRINK_PRIORITY) {
    if (lowerCategory.includes(cat)) return true;
  }

  // İçecek anahtar kelimeleri
  const isDrink = /kahve|coffee|çay|tea|içecek|drink|smoothie|shake|juice|soda|limonata|ayran|kola/.test(lowerCategory);
  
  // Ana yemek veya tatlı olmamalı
  const isNotMainDishOrDessert = !/steak|burger|pizza|tatlı|dessert|sweet|pasta|cake|waffle/.test(lowerCategory);
  
  return isDrink && isNotMainDishOrDessert;
}

function isDessertCategory(category: string): boolean {
  const lowerCategory = category.toLowerCase();
  
  // Öncelikli kategorileri kontrol et
  for (const cat of DESSERT_PRIORITY) {
    if (lowerCategory.includes(cat)) return true;
  }

  // Tatlı anahtar kelimeleri
  const isDessert = /tatlı|dessert|sweet|pasta|cake|dondurma|ice cream|waffle|cheesecake|brownie|cookie|kurabiye|pudding|tiramisu|baklava|künefe|kadayıf|sufle/.test(lowerCategory);
  
  // Ana yemek veya içecek olmamalı
  const isNotMainDishOrDrink = !/steak|burger|pizza|içecek|drink|beverage|coffee|kahve|tea|çay/.test(lowerCategory);
  
  return isDessert && isNotMainDishOrDrink;
}

// Yeni puanlama fonksiyonları
function calculateMoodScore(product: Product, word: string): number {
  let score = 0;
  const lowerText = `${product.name} ${product.description || ''} ${product.category}`.toLowerCase();

  MOOD_PREFERENCES.forEach((mood: { type: string, keywords: string[] }) => {
    if (mood.keywords.some(k => word.includes(k))) {
      if (mood.keywords.some(k => lowerText.includes(k))) {
        score += 12;
        
        // Ruh haline göre özel puanlamalar
        if (mood.type === 'romantik' && /şarap|wine|mum|candle/.test(lowerText)) {
          score += 8;
        } else if (mood.type === 'enerjik' && /protein|vitamin|fresh|taze/.test(lowerText)) {
          score += 8;
        } else if (mood.type === 'rahatlatıcı' && /çay|tea|bitki|herbal/.test(lowerText)) {
          score += 8;
        } else if (mood.type === 'sosyal' && /paylaşım|sharing|porsiyon|portion/.test(lowerText)) {
          score += 8;
        }
      }
    }
  });

  return score;
}

function calculateDietaryScore(product: Product, word: string): number {
  let score = 0;
  const lowerText = `${product.name} ${product.description || ''} ${product.category}`.toLowerCase();

  DIETARY_RESTRICTIONS.forEach((diet: { type: string, keywords: string[] }) => {
    if (diet.keywords.some(k => word.includes(k))) {
      if (diet.keywords.some(k => lowerText.includes(k))) {
        score += 20; // Diyet kısıtlamaları çok önemli
      }
    }
  });

  return score;
}

function calculateTasteScore(product: Product, word: string): number {
  let score = 0;
  const lowerText = `${product.name} ${product.description || ''} ${product.category}`.toLowerCase();

  TASTE_PREFERENCES.forEach((taste: { type: string, keywords: string[] }) => {
    if (taste.keywords.some(k => word.includes(k))) {
      if (taste.keywords.some(k => lowerText.includes(k))) {
        score += 10;
      }
    }
  });

  return score;
}

// Optimize edilmiş puanlama sistemi güncelleniyor
function scoreProduct(product: Product, preferences: string): number {
  const lowerPrefs = preferences.toLowerCase();
  const lowerName = product.name.toLowerCase();
  const lowerDesc = product.description?.toLowerCase() || '';
  const lowerCategory = product.category.toLowerCase();
  let score = 0;

  // Tercihleri kelime kelime analiz et
  const prefWords = lowerPrefs.split(/[\s,.]+/).filter(Boolean);

  // Her kelime için puan hesapla
  prefWords.forEach(word => {
    // Et tercihi
    if (word.includes('et') || word.includes('meat')) {
      for (const keyword of MEAT_KEYWORDS) {
        if (lowerName.includes(keyword) || lowerDesc.includes(keyword)) {
          score += 15;
          break;
        }
      }
      if (lowerCategory.includes('steak') || lowerCategory.includes('et')) {
        score += 10;
      }
    }

    // Vejetaryen tercihi
    if (word.includes('vejet') || word.includes('vegan')) {
      // Et içermemesi bonus puan
      if (!Array.from(MEAT_KEYWORDS).some(meat => 
        lowerName.includes(meat) || lowerDesc.includes(meat)
      )) {
        score += 15;
      }
      // Vejetaryen ürün olması ekstra puan
      for (const keyword of VEGETARIAN_KEYWORDS) {
        if (lowerName.includes(keyword) || lowerDesc.includes(keyword)) {
          score += 10;
          break;
        }
      }
    }

    // Sağlıklı tercihi
    if (word.includes('sağlık') || word.includes('healthy') || word.includes('fit')) {
      for (const keyword of HEALTHY_KEYWORDS) {
        if (lowerName.includes(keyword) || lowerDesc.includes(keyword)) {
          score += 10;
          break;
        }
      }
      // Salata kategorisi bonus puan
      if (lowerCategory.includes('salata') || lowerCategory.includes('salad')) {
        score += 8;
      }
    }

    // Acı tercihi
    if (word.includes('acı') || word.includes('spicy')) {
      if (/acı|aci|spicy|hot|jalapeno|chili/.test(lowerName + lowerDesc)) {
        score += 12;
      }
      // Acı seviyesi özelliği varsa ekstra puan
      if (product.features?.some(f => 
        f.label === 'Acı Seviyesi' && 
        (f.value.includes('Acılı') || f.value.includes('Spicy'))
      )) {
        score += 8;
      }
    }

    // Fiyat tercihleri
    const productPrice = parseFloat(product.price);
    if (word.includes('ekonomik') || word.includes('ucuz')) {
      if (productPrice < 100) score += 10;
      if (productPrice < 50) score += 5;
    }
    if (word.includes('premium') || word.includes('lüks')) {
      if (productPrice > 200) score += 15;
      if (productPrice > 300) score += 10;
    }

    // Porsiyon tercihleri
    if (word.includes('büyük') || word.includes('doyur')) {
      if (/büyük|xl|king|mega|jumbo|duble/.test(lowerName + lowerDesc)) {
        score += 10;
      }
      // Porsiyon özelliği varsa ekstra puan
      if (product.features?.some(f => 
        f.label === 'Porsiyon' && 
        (f.value.includes('Büyük') || f.value.includes('2 Kişilik'))
      )) {
        score += 8;
      }
    }
    if (word.includes('küçük') || word.includes('az')) {
      if (/küçük|small|mini|yarım/.test(lowerName + lowerDesc)) {
        score += 10;
      }
      // Porsiyon özelliği varsa ekstra puan
      if (product.features?.some(f => 
        f.label === 'Porsiyon' && 
        (f.value.includes('Küçük') || f.value.includes('1 Kişilik'))
      )) {
        score += 8;
      }
    }

    // Mutfak türü tercihi
    CUISINE_TYPES.forEach((cuisine: { type: string, keywords: string[] }) => {
      if (cuisine.keywords.some(k => word.includes(k))) {
        if (cuisine.keywords.some(k => 
          lowerName.includes(k) || 
          lowerDesc.includes(k) || 
          lowerCategory.includes(k)
        )) {
          score += 15;
        }
      }
    });

    // Öğün tercihi
    MEAL_TYPES.forEach((meal: { type: string, keywords: string[] }) => {
      if (meal.keywords.some(k => word.includes(k))) {
        if (meal.keywords.some(k => 
          lowerName.includes(k) || 
          lowerDesc.includes(k) || 
          lowerCategory.includes(k)
        )) {
          score += 10;
        }
      }
    });

    // Mevsimsel tercih
    SEASONAL_PREFERENCES.forEach((season: { type: string, keywords: string[] }) => {
      if (season.keywords.some(k => word.includes(k))) {
        if (season.keywords.some(k => 
          lowerName.includes(k) || 
          lowerDesc.includes(k)
        )) {
          score += 8;
        }
      }
    });

    // Doku tercihi
    TEXTURE_PREFERENCES.forEach((texture: { type: string, keywords: string[] }) => {
      if (texture.keywords.some(k => word.includes(k))) {
        if (texture.keywords.some(k => 
          lowerName.includes(k) || 
          lowerDesc.includes(k)
        )) {
          score += 10;
        }
      }
    });

    // Pişirme yöntemi tercihi
    COOKING_METHODS.forEach((method: { type: string, keywords: string[] }) => {
      if (method.keywords.some(k => word.includes(k))) {
        if (method.keywords.some(k => 
          lowerName.includes(k) || 
          lowerDesc.includes(k)
        )) {
          score += 12;
        }
      }
    });

    // Yeni puanlama sistemleri ekleniyor
    score += calculateMoodScore(product, word);
    score += calculateDietaryScore(product, word);
    score += calculateTasteScore(product, word);
  });

  // Özel durumlar için ek puanlar
  const currentHour = new Date().getHours();
  const currentDay = new Date().getDay();
  const isWeekend = currentDay === 0 || currentDay === 6;

  // Hafta sonu özel puanlaması
  if (isWeekend) {
    // Hafta sonu brunch önerileri
    if (currentHour >= 10 && currentHour <= 14) {
      if (/kahvaltı|breakfast|brunch|yumurta|egg|tost|toast/.test(lowerName + lowerDesc)) {
        score += 10;
      }
    }
    
    // Hafta sonu akşam özel menü önerileri
    if (currentHour >= 19 && currentHour <= 23) {
      if (product.features?.some(f => f.value === 'Şefin Önerisi')) {
        score += 15;
      }
    }
  }

  // Hava durumuna göre puanlama (örnek olarak yaz/kış)
  const currentMonth = new Date().getMonth() + 1;
  const isSummerSeason = currentMonth >= 6 && currentMonth <= 9;

  if (isSummerSeason) {
    if (/serinletici|refreshing|soğuk|cold|dondurma|ice cream/.test(lowerName + lowerDesc)) {
      score += 8;
    }
  } else {
    if (/sıcak|hot|çorba|soup|güveç|stew/.test(lowerName + lowerDesc)) {
      score += 8;
    }
  }

  // Kalori bazlı puanlama
  if (prefWords.some(w => w.includes('diyet') || w.includes('kalori'))) {
    const calorieMatch = product.description?.match(/(\d+)\s*kcal/);
    if (calorieMatch) {
      const calories = parseInt(calorieMatch[1]);
      if (calories < 300) score += 15;
      else if (calories < 500) score += 10;
      else if (calories < 800) score += 5;
    }
  }

  return score;
}

// Ürün havuzları
let mainDishPool: Product[] = []
let drinkPool: Product[] = []
let dessertPool: Product[] = []

// Ürün havuzlarını hazırla
function prepareProductPools(products: Product[]) {
  mainDishPool = products.filter(p => p?.category && isMainDishCategory(p.category))
  drinkPool = products.filter(p => p?.category && isDrinkCategory(p.category))
  dessertPool = products.filter(p => p?.category && isDessertCategory(p.category))
}

// Tercihlere göre ürün seç
function selectProductByPreference(products: Product[], preferences: string, usedProducts: Set<string> = new Set()): Product {
  // Ürünleri puanla ve sırala
  const scoredProducts = products
    .filter(p => !usedProducts.has(p.id)) // Daha önce kullanılmamış ürünleri filtrele
    .map(product => ({
      product,
      score: scoreProduct(product, preferences)
    }))
    .sort((a, b) => b.score - a.score);

  // En yüksek puanlı ürünlerden rastgele birini seç
  const topProducts = scoredProducts.slice(0, Math.min(3, scoredProducts.length));
  const selectedProduct = topProducts[Math.floor(Math.random() * topProducts.length)].product;
  
  // Seçilen ürünü kullanılmış olarak işaretle
  usedProducts.add(selectedProduct.id);
  
  return selectedProduct;
}

// Geliştirilmiş içecek eşleştirme mantığı
function matchDrinkWithMainDish(mainDish: Product, drink: Product): number {
  let matchScore = 0;
  const mainDishText = `${mainDish.name} ${mainDish.description || ''} ${mainDish.category}`.toLowerCase();
  const drinkText = `${drink.name} ${drink.description || ''} ${drink.category}`.toLowerCase();

  // Et yemekleri için içecek eşleştirmeleri
  if (Array.from(MEAT_KEYWORDS).some(k => mainDishText.includes(k))) {
    if (/şarap|wine/.test(drinkText)) matchScore += 15;
    if (/ayran|yoğurt|yogurt/.test(drinkText)) matchScore += 10;
  }

  // Baharatlı/acı yemekler için içecek eşleştirmeleri
  if (/acı|baharatlı|spicy|hot/.test(mainDishText)) {
    if (/soğuk|cold|ice|buzlu|ayran|limonata/.test(drinkText)) matchScore += 15;
    if (/süt|milk|yoğurt|yogurt/.test(drinkText)) matchScore += 10;
  }

  // Deniz ürünleri için içecek eşleştirmeleri
  if (/balık|fish|deniz|seafood|karides|shrimp/.test(mainDishText)) {
    if (/beyaz şarap|white wine/.test(drinkText)) matchScore += 15;
    if (/limonata|lemonade/.test(drinkText)) matchScore += 10;
  }

  // Makarna ve pizza için içecek eşleştirmeleri
  if (/makarna|pasta|pizza|italian/.test(mainDishText)) {
    if (/şarap|wine/.test(drinkText)) matchScore += 12;
    if (/kola|cola|soda/.test(drinkText)) matchScore += 8;
  }

  // Kahvaltı yemekleri için içecek eşleştirmeleri
  if (/kahvaltı|breakfast|yumurta|egg|tost|toast/.test(mainDishText)) {
    if (/çay|tea/.test(drinkText)) matchScore += 15;
    if (/kahve|coffee/.test(drinkText)) matchScore += 12;
    if (/portakal suyu|orange juice/.test(drinkText)) matchScore += 10;
  }

  return matchScore;
}

// Geliştirilmiş tatlı eşleştirme mantığı
function matchDessertWithMeal(mainDish: Product, drink: Product, dessert: Product): number {
  let matchScore = 0;
  const mealText = `${mainDish.name} ${drink.name}`.toLowerCase();
  const dessertText = `${dessert.name} ${dessert.description || ''}`.toLowerCase();

  // Ağır yemekler sonrası hafif tatlılar
  if (/et|meat|kebap|kebab|pizza/.test(mealText)) {
    if (/sütlü|milk|hafif|light|dondurma|ice cream/.test(dessertText)) {
      matchScore += 10;
    }
  }

  // Kahve yanına uygun tatlılar
  if (/kahve|coffee/.test(mealText)) {
    if (/çikolata|chocolate|tiramisu|cheesecake/.test(dessertText)) {
      matchScore += 12;
    }
  }

  // Türk yemekleri sonrası geleneksel tatlılar
  if (/türk|turkish|kebap|pide|lahmacun/.test(mealText)) {
    if (/baklava|künefe|kadayıf|sütlaç|kazandibi/.test(dessertText)) {
      matchScore += 15;
    }
  }

  return matchScore;
}

// Optimize edilmiş öneri sistemi güncelleniyor
function getSmartRecommendation(preferences: string): Recommendation {
  // Kullanılmış ürünleri takip et
  const usedProducts = new Set<string>();
  const isPremium = preferences.toLowerCase().includes('premium');

  // Et tercihi varsa ana yemek havuzunu filtrele
  let currentMainDishPool = [...mainDishPool];
  if (preferences.toLowerCase().includes('et')) {
    const meatDishes = mainDishPool.filter(dish => {
      const lowerText = `${dish.name} ${dish.description || ''} ${dish.category}`.toLowerCase();
      return Array.from(MEAT_KEYWORDS).some(keyword => lowerText.includes(keyword));
    });
    if (meatDishes.length > 0) {
      currentMainDishPool = meatDishes;
    }
  }

  // Premium için minimum fiyat filtresi
  if (isPremium) {
    currentMainDishPool = currentMainDishPool.filter(p => parseFloat(p.price) >= 250);
  }

  // Ana yemek seç
  const mainDish = selectProductByPreference(currentMainDishPool, preferences, usedProducts);

  // Ana yemek seçildiyse çay ikramını ekle
  if (mainDish) {
    // Açıklamaya ekle
    mainDish.description = mainDish.description || '';
    if (!mainDish.description.includes('Çay ikramımızdır')) {
      mainDish.description += mainDish.description ? ' • Çay ikramımızdır' : 'Çay ikramımızdır';
    }

    // Özelliklere ekle
    if (!mainDish.features) {
      mainDish.features = [];
    }
    
    // Eğer çay ikramı özelliği yoksa ekle
    const hasTeaFeature = mainDish.features.some(f => f.label === 'İkram');
    if (!hasTeaFeature) {
      mainDish.features.push({
        id: 'tea-service',
        icon: '🫖',
        label: 'İkram',
        value: 'Çay'
      });
    }
  }

  // İçecek havuzunu filtrele (Premium için)
  let currentDrinkPool = [...drinkPool];
  if (isPremium) {
    currentDrinkPool = currentDrinkPool.filter(p => parseFloat(p.price) >= 150);
  }

  // İçecek seçimi için geliştirilmiş mantık
  const scoredDrinks = currentDrinkPool
    .filter(d => !usedProducts.has(d.id))
    .map(drink => ({
      drink,
      score: scoreProduct(drink, preferences) + matchDrinkWithMainDish(mainDish, drink)
    }))
    .sort((a, b) => b.score - a.score);

  const drink = scoredDrinks[0]?.drink || selectProductByPreference(currentDrinkPool, preferences, usedProducts);

  // Tatlı havuzunu filtrele (Premium için)
  let currentDessertPool = [...dessertPool];
  if (isPremium) {
    currentDessertPool = currentDessertPool.filter(p => parseFloat(p.price) >= 150);
  }

  // Tatlı seçimi için geliştirilmiş mantık
  const scoredDesserts = currentDessertPool
    .filter(d => !usedProducts.has(d.id))
    .map(dessert => ({
      dessert,
      score: scoreProduct(dessert, preferences) + matchDessertWithMeal(mainDish, drink, dessert)
    }))
    .sort((a, b) => b.score - a.score);

  const dessert = scoredDesserts[0]?.dessert || selectProductByPreference(currentDessertPool, preferences, usedProducts);

  // Ana yemek ve içecek uyumu için ek kontroller
  if (mainDish && drink) {
    const mainDishText = `${mainDish.name} ${mainDish.description || ''} ${mainDish.category}`.toLowerCase();
    const drinkText = `${drink.name} ${drink.description || ''} ${drink.category}`.toLowerCase();

    // Baharatlı/acı yemeklerle serinletici içecekler
    if (/acı|baharatlı|spicy|hot/.test(mainDishText)) {
      if (/soğuk|cold|ice|buzlu|ayran|limonata/.test(drinkText)) {
        drink.features = [...(drink.features || []), {
          id: 'pairing',
          icon: '✨',
          label: 'Uyum',
          value: 'Ferahlatıcı İçecek'
        }];
      }
    }

    // Et yemekleriyle şarap uyumu
    if (Array.from(MEAT_KEYWORDS).some(k => mainDishText.includes(k))) {
      if (/şarap|wine/.test(drinkText)) {
        drink.features = [...(drink.features || []), {
          id: 'pairing',
          icon: '🍷',
          label: 'Uyum',
          value: 'Et ile Uyumlu'
        }];
      }
    }
  }

  // Premium için toplam tutar kontrolü
  const totalPrice = parseFloat(mainDish.price) + parseFloat(drink.price) + parseFloat(dessert.price);
  if (isPremium && totalPrice < 750) {
    // Yeniden deneme yap
    return getSmartRecommendation(preferences);
  }

  return {
    mainDish,
    drink,
    dessert
  };
}

// Optimize edilmiş rastgele öneri
function getRandomRecommendation(): Recommendation {
  const mainDish = mainDishPool[Math.floor(Math.random() * mainDishPool.length)]
  const drink = drinkPool[Math.floor(Math.random() * drinkPool.length)]
  const dessert = dessertPool[Math.floor(Math.random() * dessertPool.length)]

  return { mainDish, drink, dessert }
}

// Ana fonksiyon
export async function getRecommendation(products: Product[], preferences?: string): Promise<Recommendation> {
  try {
    if (!products || !Array.isArray(products) || products.length === 0) {
      throw new Error('Geçerli ürün listesi bulunamadı');
    }

    // İlk çağrıda ürün havuzlarını hazırla
    if (mainDishPool.length === 0) {
      prepareProductPools(products);
    }

    // Havuzlar boşsa yeniden doldur
    if (mainDishPool.length === 0 || drinkPool.length === 0 || dessertPool.length === 0) {
      prepareProductPools(products);
    }

    // Tercihlere göre akıllı öneri yap veya rastgele seç
    if (preferences) {
      return getSmartRecommendation(preferences);
    } else {
      return getRandomRecommendation();
    }
  } catch (error) {
    console.error('Öneri oluşturma hatası:', error);
    throw error;
  }
} 