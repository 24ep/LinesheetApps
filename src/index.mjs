import { fileURLToPath } from 'url';
import { dirname } from 'path';
// Import required modules
import express from 'express';
import path from 'path';
import fs from 'fs';

// Create an express app
const app = express();
const port = 3000;


// Set the PYTHONHOME and PATH environment variables

  // process.env.PYTHONHOME = path.join(__dirname, '../src/pythons');
  // process.env.PATH = `${process.env.PYTHONHOME};${process.env.PATH}`;

// Get the directory name of the current module file
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Set the PYTHONHOME environment variable
process.env.PYTHONHOME = path.join(__dirname, 'pythons');


app.use(express.static(__dirname + '/'));

// เส้นทางหลักของแอปพลิเคชัน
app.get('/', (req, res) => {
  const indexPath = path.join(__dirname, '/src/index.html');
  res.sendFile(indexPath);
  console.log(`Current path: ${indexPath}`);
});

app.listen(port, () => {
  console.log(`Example app listening on port https://localhost${port}`);
  console.log(`Current path: ${__dirname}`);

});


