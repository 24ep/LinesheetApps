
const express = require('express');
const app = express();
const path = require('path');
const port = 3000;

const fs = require('fs');


// Set the PYTHONHOME and PATH environment variables

  // process.env.PYTHONHOME = path.join(__dirname, '../src/pythons');
  // process.env.PATH = `${process.env.PYTHONHOME};${process.env.PATH}`;

process.env.PYTHONHOME = path.join(__dirname, 'pythons');
process.env.PATH = `${process.env.PYTHONHOME};${process.env.PATH}`;

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


