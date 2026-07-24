import Fuse from 'fuse.js';
import foodDictionary from '../data/food_dictionary.json';

// --- Advanced Phonetic Normalization ---
export const normalizeText = (text) => {
  if (!text) return '';
  return text
    .replace(/[أإآ]/g, 'ا')
    .replace(/ة/g, 'ه')
    .replace(/ى/g, 'ي')
    .replace(/غ/g, 'ج') // Phonetic matching for words like مارغريتا / مارجريتا and برغر / برجر
    .replace(/[\u064B-\u065F]/g, '') // Remove tashkeel
    .replace(/\s+/g, ' ')           // Collapse multiple spaces
    .trim()
    .toLowerCase();
};

// --- Build Synonym Lookup from External Dictionary ---
const synonymLookup = {};
foodDictionary.synonym_groups.forEach(group => {
  const normalizedGroup = group.map(normalizeText);
  normalizedGroup.forEach(word => {
    synonymLookup[word] = normalizedGroup;
  });
});

// Given a user search query, expand it into a set of all synonym words to search for
export const expandSearchQuery = (query) => {
  const normalizedQuery = normalizeText(query);
  const terms = new Set();
  terms.add(normalizedQuery);

  // Check each synonym group: if any word in a group is found inside the query (or vice versa), add all words in that group
  for (const word in synonymLookup) {
    if (normalizedQuery.includes(word) || word.includes(normalizedQuery)) {
      synonymLookup[word].forEach(syn => terms.add(syn));
    }
  }

  return [...terms];
};

export const searchMenuItems = (searchQuery, allItemsFlattened) => {
  if (!searchQuery) return [];

  const expandedTerms = expandSearchQuery(searchQuery);

  const searchableData = allItemsFlattened.map(item => ({
    ...item,
    searchName: normalizeText(item.name),
    searchDesc: normalizeText(item.desc),
  }));

  const fuse = new Fuse(searchableData, {
    keys: ['searchName', 'searchDesc'],
    threshold: 0.4, // User requested 0.4 threshold
    ignoreLocation: true,
    distance: 100
  });

  // Search for each expanded term individually and merge unique results
  const allResults = [];
  const seenIds = new Set();

  expandedTerms.forEach(term => {
    const results = fuse.search(term);
    results.forEach(res => {
      if (!seenIds.has(res.item.id)) {
        seenIds.add(res.item.id);
        allResults.push(res.item);
      }
    });
  });

  return allResults;
};
