const { app } = require('@azure/functions');
const { getClient } = require('../dbClient');
const { corsResponse } = require('../corsResponse');

// A ver si as
app.http('getUsers', {
	methods: ['GET'],
	authLevel: 'anonymous',
	handler: async (request, context) => {
		context.log('Http function processed request for url "' + request.url + '"');
		try {
			const client = await getClient();
			// Query to fetch all users and their client_alias
			const query = `
				SELECT 
					u.user_id, 
					u.username, 
					u.client_id, 
					u.administrator, 
					c.client_alias
				FROM users u
				LEFT JOIN clients c ON u.client_id = c.client_id
				ORDER BY u.user_id;
			`;
			context.log('Executing query:', query);
			const res = await client.query(query);
			client.release();
			context.log('Database query executed successfully:', res.rows);
			return corsResponse({
				status: 200,
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify(res.rows)
			});
		} catch (error) {
			context.log.error('Error during database operation:', error);
			return corsResponse({
				status: 500,
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ success: false, message: `Database operation failed: ${error.message}` })
			});
		}
	}
});
