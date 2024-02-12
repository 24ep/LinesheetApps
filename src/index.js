


// const express = require('express');
// const app = express();
const port = 3000;

const path = require('path');

const fs = require('fs');
const { PythonShell } = require('python-shell');
const ejs = require('ejs');
const util = require('util');
const { promisify } = require('util');

// Set the PYTHONHOME and PATH environment variables

  // process.env.PYTHONHOME = path.join(__dirname, '../src/pythons');
  // process.env.PATH = `${process.env.PYTHONHOME};${process.env.PATH}`;

process.env.PYTHONHOME = path.join(__dirname, 'pythons');
process.env.PATH = `${process.env.PYTHONHOME};${process.env.PATH}`;

// app.use(express.static(__dirname + '/'));



const express = require('express');
const app = express();
app.use(express.static(__dirname + '/'));
// Set EJS as the view engine
// app.set('view engine', 'ejs');
// app.set('views', path.join(__dirname, '/page/linesheet'));

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

      var configOptions = [
        { id: 'template_options', args: ['get_family'], variableName: 'familyList' , slim_id:'#template' },
        { id: 'sale_channel_options', args: ['get_input', 'sale_channel', 'multiple'], variableName: 'saleChannelList'  , slim_id:'#sale_channel' },
        { id: 'production_type_options', args: ['get_input', 'production_type', 'single'], variableName: 'productionTypeList' , slim_id:'#production_type'  },
        { id: 'stock_source_options', args: ['get_input', 'stock_source', 'multiple'], variableName: 'stockSourceList' , slim_id:'#stock_source'  }
     ];

     const runPythonScript = util.promisify((options, callback) => {
      let optionList = ''; // Declare optionList inside the function

      const pythonShell = new PythonShell(path.join(__dirname, '/page/linesheet/config/new_linesheet_config.py'), { args: options.args });

      pythonShell.on('error', err => {
          console.error('An error occurred while running the Python script:', err);
          callback(err);
      });

      pythonShell.on('stderr', message => {
          console.error('Received error message:', message);
          // Notiflix.Loading.remove();
      });

      pythonShell.on('message', message => {
          optionList += message;
      });

      pythonShell.end(err => {
          if (err) {
              console.error('An error occurred while ending the Python script:', err);
              callback(err);
          } else {
              callback(null, { id: options.id, result: optionList });
          }
      });
  });


  Promise.all( configOptions.map(option => runPythonScript(option)))
      .then(results => {
          const resultObject = results.reduce((acc, result) => {
              acc[result.id] = result.result;
              return acc;
          }, {});
          res.send(resultObject);
      })
      .catch(error => {

          console.error(error);
          res.status(500).send('Internal Server Error');
      });

});

app.get('/generate-new-linesheet', (req, res) => {

  const brand = req.query.brand;
  const template = req.query.template;
  const sku = req.query.sku;
  const launch_date = req.query.launch_date;
  const stock_source = req.query.stock_source;
  const sale_channel = req.query.sale_channel;
  const production_type = req.query.production_type;
  const contact_person = req.query.contact_person;

  // call python
  var errormessage='';
  let generate_form_ms = '';

  new PythonShell(path.join(__dirname, `/src/page/linesheet/config/new_linesheet_create.py`), {
      args: ['generate_form', brand, template,sku,launch_date,stock_source,sale_channel,production_type,contact_person]
  })
  .on('error', err => {
      console.log('error');
      console.error('An error occurred while running the Python script:', err);
      Notiflix.Loading.remove();
      Notiflix.Report.failure(
          'Notiflix Failure',
          err,
          'Okay',
          );
      })
      .on('stderr', message => {
          console.error('Received error message:', message);
          Notiflix.Loading.remove();
          errormessage += message;
          if( errormessage.includes("Programmatic access to Visual Basic Project is not trusted")){
              Notiflix.Report.warning(
                  'Need config in excel',
                  'Please select trust access to the VBA project object model before use this via open an excel > Option > Trust center > Trust center setting > Macro setting >select trust access to the VBA project object model, refernace : https://docs.cdse-commercecontent.com/spear/troubleshoot ',
                  'Okay',
                  );
              }

          })
          .on('message', message => {
              Notiflix.Loading.remove();
              get_linesheetlist('linesheet');
              generate_form_ms += message;
              if (generate_form_ms) {
                  Notiflix.Report.success(
                      'Generate complete',
                      'you file name is '+ generate_form_ms,
                      'Open the file',
                      function cb() {
                        console.log("open_file")
                      },
                      );
                  }
              });


});













// app.get('/get_folder_linesheet_list', (req, res) => {

//   const runPythonScript = promisify((args, callback) => {
//     PythonShell.run(path.join(__dirname, '/page/linesheet/config/get_folder_list.py'), { args: ['nothing'] }, (err, results) => {
//         if (err) {
//             callback(err);
//         } else {
//             console.log(results)
//             callback(null, results);

//         }
//     });
// });

// runPythonScript()
//     .then((folder_list_linesheetList) => {

//         res.send(folder_list_linesheetList.join('\n'));
//         // document.getElementById('folder_list').innerHTML = folder_list_linesheetList.join('\n');
//     })
//     .catch((err) => {
//         console.error('An error occurred while running the Python script:', err);
//         // handle the error here
//     });
// });




app.listen(port, () => {
  console.log(`Example app listening on port https://localhost:${port}`);
  console.log(`Current path: ${__dirname}`);

});



