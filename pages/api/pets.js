export const config = { api: { bodyParser: { sizeLimit: '10mb' } } };

const petsHandler = require('../../api/pets');

export default petsHandler;