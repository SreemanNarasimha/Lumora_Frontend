import mysql from 'mysql2/promise';

const dbConfig = {
  host: 'localhost',
  user: 'root',
  password: 'NARASIMHA',
  database: 'ecommerce'
};

const skinTypes = [
  { id: 1, name: 'All Types' },
  { id: 2, name: 'Oily' },
  { id: 3, name: 'Dry' },
  { id: 4, name: 'Combination' },
  { id: 5, name: 'Sensitive' },
  { id: 6, name: 'Normal' }
];

const mappings = {
  5: [1, 4, 10, 23, 28, 30, 35, 135, 139, 157, 158, 189], // Sensitive
  3: [2, 40, 129, 130, 133, 134, 137, 138, 142, 144, 146, 148, 149], // Dry
  2: [3, 11, 12, 25, 84, 101, 115, 136, 180, 186, 192], // Oily
  4: [62, 113, 125, 128, 147], // Combination
  1: [5, 6, 18, 22, 51, 102, 119, 155, 161, 178, 183, 187, 188, 198, 199] // All Types
};

async function seed() {
  const connection = await mysql.createConnection(dbConfig);
  try {
    for (const st of skinTypes) {
      await connection.execute(`INSERT IGNORE INTO skin_types (skin_type_id, name) VALUES (?, ?)`, [st.id, st.name]);
    }
    console.log('Inserted skin types.');
    
    await connection.execute(`DELETE FROM product_skin_types`);
    
    for (const [skinTypeId, productIds] of Object.entries(mappings)) {
      for (const pid of productIds) {
        await connection.execute(`INSERT IGNORE INTO product_skin_types (product_id, skin_type_id) VALUES (?, ?)`, [pid, skinTypeId]);
      }
    }
    console.log('Inserted product skin types.');
  } catch (err) {
    console.error(err);
  } finally {
    await connection.end();
  }
}

seed();
