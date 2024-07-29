const sql = require('mssql');

const config = {
    user: 'wms_svc_user',
    password: '5E9C1385-1326-43E1-8703-A2EFDB6D719DEF60AC80-EFCE-4466-82FD-62832A637A59', // Your provided password
    server: 'gt-general-sql-dev.database.windows.net', // Your provided server URL
    database: 'wms', // Replace with your actual database name
    options: {
        encrypt: true, // Use encryption for Azure SQL Database
    },
};

const poolPromise = new sql.ConnectionPool(config)
    .connect()
    .then(pool => {
        console.log('Connected to SQL Server');
        return pool;
    })
    .catch(err => {
        console.error('Database Connection Failed! Bad Config: ', err);
        throw err;
    });

const insertIntoStockGenerator = async (payload) => {
    const { id, InsertDate, sku, matched_current_stock, foreign_object_id } = payload;
    try {
        const pool = await poolPromise;
        await pool.request()
            .input('id', sql.UniqueIdentifier, id)
            .input('InsertDate', sql.DateTime2, InsertDate)
            .input('sku', sql.NVarChar, sku)
            .input('matched_current_stock', sql.Bit, matched_current_stock)
            .input('foreign_object_id', sql.Int, foreign_object_id)
            .query(`
                INSERT INTO staging.stock_generator (id, InsertDate, sku, matched_current_stock, foreign_object_id)
                VALUES (@id, @InsertDate, @sku, @matched_current_stock, @foreign_object_id)
            `);
        return { success: true };
    } catch (error) {
        console.error('Error inserting data:', error);
        return { success: false, error };
    }
};

module.exports = { insertIntoStockGenerator };
