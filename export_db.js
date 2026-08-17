const sqlite3 = require('sqlite3').verbose();
const fs = require('fs');
const db = new sqlite3.Database('database.sqlite');

let sql = '';

db.serialize(() => {
  db.all("SELECT sql FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%'", (err, rows) => {
    if (err) throw err;
    rows.forEach(row => {
      sql += row.sql + ';\n';
    });

    // Let's get the data for specific tables (categories, products)
    db.all("SELECT * FROM categories", (err, cats) => {
      cats.forEach(c => {
        sql += `INSERT INTO categories (id, key, name_en, name_ar, img, desc_en, desc_ar) VALUES (${c.id}, '${c.key.replace(/'/g, "''")}', '${c.name_en.replace(/'/g, "''")}', '${c.name_ar.replace(/'/g, "''")}', '${(c.img||'').replace(/'/g, "''")}', '${(c.desc_en||'').replace(/'/g, "''")}', '${(c.desc_ar||'').replace(/'/g, "''")}');\n`;
      });
      
      db.all("SELECT * FROM products", (err, prods) => {
        prods.forEach(p => {
          sql += `INSERT INTO products (id, category_key, key, name_en, name_ar, desc_en, desc_ar, price, img, weight, sauces, ingredients, is_popular, offer_type) VALUES (${p.id}, '${p.category_key.replace(/'/g, "''")}', '${p.key.replace(/'/g, "''")}', '${p.name_en.replace(/'/g, "''")}', '${p.name_ar.replace(/'/g, "''")}', '${(p.desc_en||'').replace(/'/g, "''")}', '${(p.desc_ar||'').replace(/'/g, "''")}', '${p.price}', '${(p.img||'').replace(/'/g, "''")}', '${(p.weight||'').replace(/'/g, "''")}', '${(p.sauces||'').replace(/'/g, "''")}', '${(p.ingredients||'').replace(/'/g, "''")}', ${p.is_popular}, '${p.offer_type}');\n`;
        });
        
        fs.writeFileSync('schema.sql', sql);
        console.log('schema.sql created successfully');
      });
    });
  });
});
