


// const express = require('express');
// const app = express();
const port = 3000;

const path = require('path');



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
  next();
}, (req, res) => {
  console.log(req);
});

app.get('/linesheet-creation', (req, res) => {
  const indexPath = path.join(__dirname, '/page/linesheet/js/new_linesheet.js');
  setTimeout(() => {
    try {
      // Execute new_linesheet.js as Node.js code
      delete require.cache[require.resolve('./page/linesheet/js/new_linesheet')];
      const ImportModule = require('./page/linesheet/js/new_linesheet');

     
      // res.render('index', { message: 'Hello World!' });

      // old_elements = '<div id="'+ImportModule[0]+'"><p class="placeholder-glow"><span class="placeholder w-25 opacity-25 bg-secondary"></span><span class="placeholder w-75 opacity-25 bg-secondary"></span></p></div>'
      res.send('New_linesheet.js loaded and executed successfully');
      console.log(ImportModule)
      // res.render(ImportModule[0], { message: ImportModule[1] });
      // console.log('Data from new_linesheet.js:', ImportModule);
      // const linesheetData = ImportModule;
      // console.log('Data from new_linesheet.js:', linesheetData);
      
      // res.send(`New_linesheet.js loaded and executed successfully. Exported variable: ${ImportModule}`);
      // res.send({ message: 'New_linesheet.js loaded and executed successfully', data: res });

      // res.send({ message: ImportModule[0][0], data: ImportModule[1] });
      // console.log(ImportModule[0])
      // console.log('new_linesheet.js loaded and executed successfully');
      
      // // Send a response indicating success
 
    } catch (error) {
      console.error('Failed to load or execute new_linesheet.js:', error);
      // Send a response indicating failure
      res.status(500).send('Failed to load or execute new_linesheet.js');
    }
  }, 2000); // Delay of 2 seconds
});


app.listen(port, () => {
  console.log(`Example app listening on port https://localhost:${port}`);
  console.log(`Current path: ${__dirname}`);

});



