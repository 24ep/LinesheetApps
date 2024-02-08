






const express = require('express');
const app = express();
const port = 3000;

const path = require('path');
const fs = require('fs');

const { PythonShell } = require('python-shell');
const XLSX = require('xlsx');
const opn = require('opn');


// Set the PYTHONHOME and PATH environment variables

  // process.env.PYTHONHOME = path.join(__dirname, '../src/pythons');
  // process.env.PATH = `${process.env.PYTHONHOME};${process.env.PATH}`;

process.env.PYTHONHOME = path.join(__dirname, 'pythons');
process.env.PATH = `${process.env.PYTHONHOME};${process.env.PATH}`;

app.use(express.static(__dirname + '/'));

// เส้นทางหลักของแอปพลิเคชัน
app.get('/', (req, res) => {
  const indexPath = path.join(__dirname, '/src/index.html');
  res.sendFile(indexPath);
  console.log(`Current path: ${indexPath}`);

  // Function to recursively traverse directory and log all file paths
  function logAllPaths(directoryPath) {
    // Get all files and subdirectories in the current directory
    fs.readdir(directoryPath, { withFileTypes: true }, (err, files) => {
      if (err) {
        console.error(`Error reading directory ${directoryPath}: ${err}`);
        return;
      }

      // Iterate through each file or subdirectory
      files.forEach((file) => {
        // Construct full path to the file or subdirectory
        const fullPath = path.join(directoryPath, file.name);

        // Check if it's a directory
        if (file.isDirectory()) {
          // If it's a directory, recursively call logAllPaths to traverse it
          logAllPaths(fullPath);
        } else {
          // If it's a file, log its path
          console.log(fullPath);
        }
      });
    });
  }

  // Call the function to log all paths starting from the current directory
  logAllPaths(__dirname);

});

app.listen(port, () => {
  console.log(`Example app listening on port https://localhost${port}`);
  console.log(`Current path: ${__dirname}`);

});


