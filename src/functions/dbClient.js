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
let connectionAttempts = 0;
const MAX_RETRIES = 3;
const RETRY_DELAY = 5000; // 5 seconds

/**
 * Initializes and returns a singleton PostgreSQL connection pool with improved error handling
 */
function initPool() {
    if (pool) {
        console.log("Reusing existing connection pool");
        return pool;
    }

    const config = {
        host: process.env.PGHOST,
        database: process.env.PGDATABASE,
        user: process.env.PGUSER,
        password: process.env.PGPASSWORD,
        port: parseInt(process.env.PGPORT || '5432'),
        ssl: {
            rejectUnauthorized: false
        },
        // Connection settings
        connectionTimeoutMillis: 10000,
        idleTimeoutMillis: 30000,
        max: 10,
        statement_timeout: 10000,
        query_timeout: 10000,
        keepalive: true,
        keepaliveInitialDelayMillis: 30000
    };

    console.log("Initializing connection pool for host:", config.host);
    pool = new Pool(config);

    // Handle pool errors
    pool.on('error', (err) => {
        console.error('Unexpected error on idle client:', err);
        pool = null;
    });

    // Handle pool connection events
    pool.on('connect', () => {
        console.log('New connection established to database');
        connectionAttempts = 0; // Reset counter on successful connection
    });

    return pool;
}

/**
 * Gets a client from the connection pool with retry logic
 */
async function getClient() {
    try {
        connectionAttempts++;
        const pool = initPool();
        
        console.log(`Attempting to get client (attempt ${connectionAttempts} of ${MAX_RETRIES})`);
        
        const client = await pool.connect();
        
        // Add error handler to client
        client.on('error', (err) => {
            console.error('Client error:', err);
            client.release(true); // Force release with error
        });

        return client;
    } catch (err) {
        console.error("Error getting client:", err);

        // Destroy pool on connection error
        if (err.code === 'ECONNREFUSED' || err.code === 'ETIMEDOUT') {
            pool = null;
        }

        if (connectionAttempts < MAX_RETRIES) {
            console.log(`Retrying in ${RETRY_DELAY/1000} seconds...`);
            await new Promise(resolve => setTimeout(resolve, RETRY_DELAY));
            return getClient(); // Recursive retry
        }

        // Reset attempts counter after max retries
        connectionAttempts = 0;
        throw new Error(`Failed to connect after ${MAX_RETRIES} attempts: ${err.message}`);
    }
}

/**
 * Releases a client back to the pool
 */
function releaseClient(client) {
    if (client) {
        client.release(true); // Force release
    }
}

module.exports = { getClient, releaseClient };