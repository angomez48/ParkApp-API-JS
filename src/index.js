const { app } = require('@azure/functions');

app.setup({
    enableHttpStream: true,
});

require('./functions/dbModifiers/postStatus');
require('./functions/dbModifiers/addSensor');
require('./functions/dbModifiers/addClient');
require('./functions/dbModifiers/addParking');
require('./functions/dbModifiers/addLevel');
require('./functions/dbModifiers/addUser');
require('./functions/dbModifiers/grantPermission');
require('./functions/dbModifiers/updateFlags');
require('./functions/dbModifiers/updateMaintenance');

require('./functions/dbFetchers/getGeneralInfo');
