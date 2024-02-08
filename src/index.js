


// const express = require('express');
// const app = express();
const port = 3000;

const path = require('path');

const PythonShell = require('python-shell');
const chokidar = require('chokidar');


// Set the PYTHONHOME and PATH environment variables

  // process.env.PYTHONHOME = path.join(__dirname, '../src/pythons');
  // process.env.PATH = `${process.env.PYTHONHOME};${process.env.PATH}`;

process.env.PYTHONHOME = path.join(__dirname, 'pythons');
process.env.PATH = `${process.env.PYTHONHOME};${process.env.PATH}`;

// app.use(express.static(__dirname + '/'));



const express = require('express');
const app = express();
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

let lastExecutedFile = __filename;

// Function to log the last executed file
const logLastExecutedFile = () => {
  console.log(`Last executed file: ${path.basename(lastExecutedFile)}`);
};

// Initial log
logLastExecutedFile();

// Watch for changes in the current directory
const watcher = chokidar.watch(__dirname, {
  ignored: /node_modules/,
  persistent: true,
});

// When a file is added or changed, update the lastExecutedFile variable
watcher.on('change', (filePath) => {
  lastExecutedFile = filePath;
  logLastExecutedFile();
});

// Handle errors in the watcher
watcher.on('error', (error) => {
  console.error(`Watcher error: ${error}`);
});

// Handle the process exit to close the watcher
process.on('exit', () => {
  watcher.close();
});

