const fs = require('fs');
const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const content = fs.readFileSync(path.join(__dirname, '../src/context/LanguageContext.jsx'), 'utf8');
const match = content.match(/const translations = (\{[\s\S]*?\n\s*\});/);

if (match) {
  let jsObjString = match[1];
  // To evaluate this, we can wrap it in a function since it's just a JS object
  let translations;
  try {
    translations = eval('(' + jsObjString + ')');
  } catch(e) {
    console.error("Eval error", e);
    process.exit(1);
  }

  const enCats = translations.en['menu.categories'];
  const arCats = translations.ar['menu.categories'];
  const enItems = translations.en['menu.items'];
  const arItems = translations.ar['menu.items'];

  const db = require('./database.js');

  // Wait for table creation (since database.js uses callbacks, we should wrap this in a timeout just in case)
  setTimeout(() => {
    db.serialize(() => {
    // Insert categories
    const stmtCat = db.prepare(`INSERT OR IGNORE INTO categories (key, name_en, name_ar) VALUES (?, ?, ?)`);
    for (const [key, name_en] of Object.entries(enCats)) {
      const name_ar = arCats[key] || name_en;
      stmtCat.run(key, name_en, name_ar);
    }
    stmtCat.finalize();

    // Map categories to prefixes
    const prefixToCat = {
      'sh_': 'shawarma',
      'west_': 'shawarma', // Assuming western sandwiches go here or a new category
      'br_': 'broasted',
      'meal_': 'broasted',
      'pz_': 'pizza',
      'man_': 'pizza',
      'cr_': 'crepes',
      'maria_': 'crepes',
      'sham_': 'crepes',
      'tray_': 'appetizers',
      'app_': 'appetizers',
      'dr_': 'drinks',
      'ds_': 'drinks'
    };

    const getCat = (itemKey) => {
      for (const [prefix, cat] of Object.entries(prefixToCat)) {
        if (itemKey.startsWith(prefix)) return cat;
      }
      return 'shawarma';
    };

    // Insert products
    const stmtProd = db.prepare(`INSERT OR IGNORE INTO products (category_key, key, name_en, name_ar, desc_en, desc_ar, price, is_popular) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`);
    for (const [key, itemEn] of Object.entries(enItems)) {
      const itemAr = arItems[key] || itemEn;
      const catKey = getCat(key);
      const priceJson = JSON.stringify(itemEn.price);
      // Let's make some popular randomly or based on key
      const is_popular = (key.includes('shawarma') || key.includes('br_2')) ? 1 : 0;
      stmtProd.run(catKey, key, itemEn.name, itemAr.name, itemEn.desc, itemAr.desc, priceJson, is_popular);
    }
    stmtProd.finalize();
  });

    db.close(() => {
      console.log("Database seeded successfully!");
      process.exit(0);
    });
  }, 1000);
} else {
  console.log("Translations not found");
}
