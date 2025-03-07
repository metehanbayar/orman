interface FeatureIcon {
  icon: string;
  label: string;
  values: string[];
}

export const FEATURE_ICONS: FeatureIcon[] = [
  { icon: '🌶️', label: 'Acı Seviyesi', values: ['Az Acılı', 'Orta Acılı', 'Çok Acılı'] },
  { icon: '⚖️', label: 'Porsiyon', values: ['Küçük', 'Normal', 'Büyük'] },
  { icon: '🥩', label: 'Pişirme', values: ['Az', 'Orta', 'İyi'] },
  { icon: '🌱', label: 'Diyet', values: ['Vejetaryen', 'Vegan', 'Glutensiz'] },
  { icon: '🥄', label: 'Servis', values: ['1 Kişilik', '2 Kişilik', '4 Kişilik'] },
  { icon: '🔥', label: 'Kalori', values: ['300-400', '400-600', '600+'] },
  { icon: '⭐', label: 'Özellik', values: ['Şefin Önerisi', 'Yeni', 'Popüler'] },
  { icon: '🥜', label: 'Alerjen', values: ['Gluten', 'Fındık', 'Süt'] },
  { icon: '⏰', label: 'Hazırlama', values: ['10-15 dk', '15-25 dk', '25+ dk'] },
  { icon: '💯', label: 'Beğeni', values: ['Trend', 'En Çok Satan', 'Favori'] },
]; 