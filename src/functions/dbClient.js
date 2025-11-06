/**
 * FileName: src/functions/dbClient.js
 * Author(s): Arturo Vargas
 * Brief: Provides a PostgreSQL connection pool for both local and Azure environments.
 * Date: 2024-11-21
 *
 * Description:
 * This module exports a function to obtain a PostgreSQL client from a managed connection pool,
 * supporting both local development and Azure deployments. For local use, it authenticates with
 * username and password. In Azure, it leverages Managed Identity and token-based authentication
 * via DefaultAzureCredential.
 *
 * Copyright (c) 2024 BY: Nexelium Technological Solutions S.A. de C.V.
 * All rights reserved.
 *
 * ---------------------------------------------------------------------------
 * Code Description:
 * 1. Environment Detection: Determines whether the code is running locally or in Azure based on the ENVIRONMENT variable.
 *
 * 2. Pool Initialization: Initializes a singleton connection pool using the `pg` library. For local, uses standard credentials.
 *    For Azure, retrieves an access token using DefaultAzureCredential and uses it as the password.
 *
 * 3. Pool Reuse: Ensures the pool is only created once and reused for subsequent requests, optimizing resource usage.
 *
 * 4. Client Retrieval: Exports an async `getClient` function that returns a pooled client for executing queries.
 *
 * 5. Configuration: Requires environment variables (`PGHOST`, `PGDATABASE`, `PGPORT`, `PGUSER`, `PGPASSWORD`) to be set.
 *    For Azure, Managed Identity must be configured and the application must have access to the PostgreSQL server.
 * ---------------------------------------------------------------------------
 */

const { Pool } = require('pg');

let pool;

/**
 * Initializes and returns a singleton PostgreSQL connection pool.
 * Determines the environment (local or Azure) and configures the pool accordingly.
 * For local, uses user/password authentication; for Azure, uses Managed Identity token.
 * @since 1.0.0
 * @return {Promise<Pool>} The initialized PostgreSQL connection pool.
 * @throws {Error} If a valid Azure Managed Identity token cannot be retrieved.
 */
function initPool() {
    if (pool) {
        console.log("Reusing existing connection pool");
        return pool;  // Reuse the existing pool if already created
    }

    const config = {
        host: process.env.DB_HOST,
        database: process.env.DB_NAME,
        user: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
        port: process.env.DB_PORT || 5432,
        ssl: { rejectUnauthorized: false },
        // Connection pool settings
        max: 20, // Maximum number of clients
        idleTimeoutMillis: 30000,
        connectionTimeoutMillis: 2000,
    };

    pool = new Pool(config);

    pool.on('error', (err) => {
        console.error('Unexpected error on idle client', err);
        // Try to reconnect
        pool = null;
    });

    console.log("New connection pool initialized");
    return pool;
}

/**
 * Fetches a PostgreSQL client from the connection pool for executing queries.
 * Ensures the pool is initialized before returning a client.
 * @since 1.0.0
 * @return {Promise<import('pg').PoolClient>} A pooled PostgreSQL client.
 */
async function getClient() {
    try {
        const pool = initPool();
        const client = await pool.connect();
        console.log("New client connection established");
        return client;
    } catch (err) {
        console.error("Error getting client:", err);
        throw err;
    }
}

module.exports = { getClient };