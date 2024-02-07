import express from 'express';
const app = express();
import path from 'path';
const port = 3000;

import fs from 'fs';
import { PythonShell } from 'python-shell';
import XLSX from 'xlsx';


import { execSync, exec } from 'child_process';
import { promisify } from 'util';
import { appendFile } from 'fs';
import which from 'which';
import https from 'https';
import opn from 'opn';


// Set the PYTHONHOME and PATH environment variables

  // process.env.PYTHONHOME = path.join(__dirname, '../src/pythons');
  // process.env.PATH = `${process.env.PYTHONHOME};${process.env.PATH}`;

// Use import.meta.url to get the module URL and then extract the directory
const __filename = new URL(import.meta.url).pathname;
const __dirname = path.dirname(__filename);

process.env.PYTHONHOME = path.join(__dirname, 'pythons');

app.use(express.static(__dirname + '/'));

// เส้นทางหลักของแอปพลิเคชัน
app.get('/', (req, res) => {
  const indexPath = path.join(__dirname, 'src/index.html');
  res.sendFile(indexPath);
  console.log(`Current path: ${indexPath}`);
});

app.listen(port, () => {
  console.log(`Example app listening on port https://localhost${port}`);
  console.log(`Current path: ${__dirname}`);

});


