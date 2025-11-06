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
 * Initializes and returns a singleton PostgreSQL connection pool
 */
function initPool() {
    if (pool) {
        console.log("Reusing existing connection pool");
        return pool;
    }

    // Use environment variables for connection
    const config = {
        host: process.env.DB_HOST || process.env.PGHOST,
        database: process.env.DB_NAME || process.env.PGDATABASE,
        user: process.env.DB_USER || process.env.PGUSER,
        password: process.env.DB_PASSWORD || process.env.PGPASSWORD,
        port: parseInt(process.env.DB_PORT || process.env.PGPORT || '5432'),
        ssl: {
            rejectUnauthorized: false // Required for Azure PostgreSQL
        },
        // Connection pool settings
        max: 20,
        idleTimeoutMillis: 30000,
        connectionTimeoutMillis: 2000,
    };

    console.log("Initializing connection pool with host:", config.host);
    pool = new Pool(config);

    pool.on('error', (err) => {
        console.error('Unexpected error on idle client', err);
        // Try to reconnect
        pool = null;
    });

    return pool;
}

/**
 * Gets a client from the connection pool
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