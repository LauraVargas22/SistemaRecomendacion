const { Pool } = require('pg');

const pool = new Pool({
    user: 'postgres',
    host: 'localhost',
    database: 'recommendation_db',
    password: 'Lau05032015', 
    port: 5432,
});

// Probar la conexión
pool.connect((err, client, release) => {
    if (err) {
        console.error('❌ Error conectando a la base de datos:', err.stack);
    } else {
        console.log('✅ Conectado a PostgreSQL - Base de datos: recommendation_db');
        release();
    }
});

module.exports = pool;