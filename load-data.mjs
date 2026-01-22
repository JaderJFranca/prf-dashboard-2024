import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Importar as funções do banco de dados
const { loadAccidentData } = await import('./dist/server/db.js');

// Carregar dados JSON
const dataPath = path.join(__dirname, 'public', 'accidents-data.json');
const data = JSON.parse(fs.readFileSync(dataPath, 'utf-8'));

// Carregar no banco de dados
await loadAccidentData(data);
console.log('Dados carregados com sucesso!');
