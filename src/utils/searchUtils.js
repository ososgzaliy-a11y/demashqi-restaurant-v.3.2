export const normalizeText = (text) => {
  if (!text) return '';
  return text
    .replace(/[أإآ]/g, 'ا')
    .replace(/ة/g, 'ه')
    .replace(/ى/g, 'ي')
    .replace(/غ/g, 'ج') // Phonetic mapping
    .replace(/[\u064B-\u065F]/g, '') // Remove tashkeel
    .toLowerCase()
    .trim();
};

const synonymMap = {
  'مانجا': 'مانجو',
  'مانجو': 'مانجا',
  'فراخ': 'دجاج',
  'دجاج': 'فراخ',
  'شاورمه': 'شاورما',
  'شاورما': 'شاورمه',
  'سندوتش': 'ساندوتش',
  'سندويش': 'ساندوتش',
  'صندويش': 'ساندوتش',
  'بطاطس': 'باتاتا',
  'بيبسي': 'مشروب'
};

const getSearchVariants = (term) => {
  const normalized = normalizeText(term);
  const synonym = synonymMap[normalized];
  return synonym ? [normalized, normalizeText(synonym)] : [normalized];
};

export const searchMenuItems = (searchQuery, allItemsFlattened) => {
  if (!searchQuery) return [];
  
  const queryWords = searchQuery.trim().split(' ').filter(Boolean);

  const results = allItemsFlattened.filter((item) => {
    const name = normalizeText(item.name || item.name_ar || item.name_en);
    const desc = normalizeText(item.desc || item.desc_ar || item.desc_en);
    const category = normalizeText(item.category_key || item.category);

    return queryWords.every(word => {
      const variants = getSearchVariants(word);
      return variants.some((v) =>
        name.includes(v) || desc.includes(v) || category.includes(v)
      );
    });
  });
  
  return results;
};
