
// var  PythonShell = ''


console.log('call xlsx');
const XLSX = require('xlsx');

console.log('call path');
const path = require('path');

// console.log('call fs');
// const fs = require('fs');





// console.log('call opn');
// const opn = require('opn');

console.log('call PythonShell');
var PythonShell = require('python-shell');

// var path = require('path');
// var fs = require('fs');
// var { PythonShell } = require('python-shell');
// var XLSX = require('xlsx');
// var opn = require('opn');

// import * as path from 'path';
// import * as fs from 'fs';
// import { PythonShell } from 'python-shell';
// import * as XLSX from 'xlsx';
// import * as opn from 'opn';

// import * as module from '/src/bundle.js';


var configOptions = [
    { id: 'template_options', args: ['get_family'], variableName: 'familyList' , slim_id:'#template' },
    { id: 'sale_channel_options', args: ['get_input', 'sale_channel', 'multiple'], variableName: 'saleChannelList'  , slim_id:'#sale_channel' },
    { id: 'production_type_options', args: ['get_input', 'production_type', 'single'], variableName: 'productionTypeList' , slim_id:'#production_type'  },
    { id: 'stock_source_options', args: ['get_input', 'stock_source', 'multiple'], variableName: 'stockSourceList' , slim_id:'#stock_source'  }
];

// var tail = require('tail.select.js');

configOptions.forEach(option => {
    let optionList = '';

    new PythonShell(path.join(__dirname, '/src/page/linesheet/config/new_linesheet_config.py'), { args: option.args })
    // new PythonShell(`src//src/page/linesheet/config/new_linesheet_config.py`, { args: option.args })
    .on('error', err => {
        console.error('An error occurred while running the Python script:', err);
        // handle the error here
    })
    .on('stderr', message => {
        console.error('Received error message:', message);
        // Notiflix.Loading.remove();
    })
    .on('message', message => {
        optionList += message;
        if (optionList) {
            document.getElementById(option.id).innerHTML = optionList;
            // runSlimSelect(option.slim_id);
            // runTomselect(option.slim_id);
            // new TomSelect(option.slim_id,{});
            setTimeout(() => {
                new TomSelect(option.slim_id,{});
            }, 2000);
        }

    });

});


function runSlimSelect(select_id) {
    new SlimSelect({
        select: select_id,
        settings: {
            showSearch: true,
            closeOnSelect: false,
            allowDeselectOption: true,
        },
        events: {
            afterChange: (newVal) => {
                input = select_id.replace('_show', '');
                document.querySelector(input).value = newVal.map(val => val.value).join(',');
            }
        }
    });
}
function get_folder_linesheetlist(){
    var folder_list_linesheetList=''
    new PythonShell(path.join(__dirname, `/src/page/linesheet/config/get_folder_list.py`), {args: ['nothing']})
    .on('error', err => {
        console.error('An error occurred while running the Python script:', err);
        // handle the error here
    })
    .on('message', message => {
        folder_list_linesheetList += message;
        if (folder_list_linesheetList) {
            document.getElementById('folder_list').innerHTML = folder_list_linesheetList;
        }
    });
}
get_folder_linesheetlist();
function get_linesheetlist(folder){
    Notiflix.Loading.standard('Opening..');
    var linesheetList=''
    new PythonShell(path.join(__dirname, `/src/page/linesheet/config/new_linesheet_get_list.py`), {args: [folder]})
    .on('error', err => {
        console.error('An error occurred while running the Python script:', err);
        Notiflix.Loading.remove();
        // handle the error here
    })
    .on('message', message => {
        linesheetList += message;
        if (linesheetList) {
            document.getElementById('linesheet_folder').innerHTML = linesheetList;
            Notiflix.Loading.remove();
        }
    });
}
get_linesheetlist('linesheet');
function generate_linesheet(){
    Notiflix.Loading.standard('Generating ...');
    brand = document.getElementById("brand").value
    // template = document.getElementById("template").value
    template = [...document.querySelectorAll("#template option:checked")].map(option => option.value).join(',');
    sku = document.getElementById("sku").value
    launch_date = document.getElementById("launch_date").value
    // stock_source = document.getElementById("stock_source").value
    stock_source = [...document.querySelectorAll("#stock_source option:checked")].map(option => option.value).join(',');
    // sale_channel = document.getElementById("sale_channel").value
    sale_channel = [...document.querySelectorAll("#sale_channel option:checked")].map(option => option.value).join(',');

    production_type = document.getElementById("production_type").value
    contact_person=document.getElementById("contact_person").value
    // call python
    var errormessage='';
    let generate_form_ms = '';
    console.log('reading_python');
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
                // else{
                //     Notiflix.Report.failure(
                //         'Error',
                //         'error '+message+ 'please contact cdse-commercecontent@central.co.th',
                //         'Okay',
                //     );
                // }
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
                            new PythonShell(path.join(__dirname, `/src/page/linesheet/config/open_excel_linesheet.py`), {
                                args: [generate_form_ms]
                            })
                        },
                        );
                    }
                });
            }

            function open_xlsm(file_location){
                new PythonShell(path.join(__dirname, `/src/page/linesheet/config/open_excel_linesheet.py`), {
                    args: [file_location]
                })
                .on('error', err => {
                    console.error('An error occurred while running the Python script:', err);

                })
            }
            // new DataTable('#new_linesheet_list');
            function convertExcelToJsonTransposed(filePath,sheet_name) {
                var workbook = XLSX.readFile(filePath);
                var worksheet = workbook.Sheets[sheet_name];
                var jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1, defval: '' });
                var headers = jsonData[0];
                var rows = jsonData.slice(1);
                var transposedData = rows.map(row => {
                    var rowData = {};
                    row.forEach((cellValue, index) => {
                        rowData[headers[index]] = cellValue;
                    });
                    return rowData;
                });
                return transposedData;
            }
            function convertExcelToJson(filePath,sheet_name) {
                var workbook = XLSX.readFile(filePath);
                var worksheet = workbook.Sheets[sheet_name];
                var jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 0, defval: '' });

                // Remove rows 2 to 11
                if(sheet_name=='IM_FORM'){
                    jsonData.splice(0, 12);
                }


                jsonData.filter(row => row['ibc'] !== '');
                // Find the columns to delete
                var columnsToDelete = Object.keys(jsonData[0]).filter(key => key.startsWith('__EMPTY'));

                return jsonData;
            }
            function read_json_xlsm(filePath) {
                // Storing a variable in session storage
                sessionStorage.setItem('linesheet_file_path', filePath);
                load_page(path.join(__dirname, '/src/page/linesheet/edit_linesheet.html'));
            }
            function read_json_xlsm_convert(filePath) {
                // Storing a variable in session storage
                sessionStorage.setItem('linesheet_file_path', filePath);
                load_page(path.join(__dirname, '/src/page/linesheet/convert_linesheet.html'));
            }
            function get_linesheet_information(attribute_name){

                return (IN_LINK_DATA.find(item => item.attribute === attribute_name) || {}).value;
                // document.getElementById("brand_name").value = (linesheet_info.find(item => item.attribute === 'brand') || {}).value;;
            }




            // import path from 'path';

            // function revealInFileExplorer(path) {
            //     var folderPath = path;
            //     opn(folderPath)
            //     .then(() => {
            //         console.log('Folder opened successfully');
            //     })
            //     .catch((err) => {
            //         console.error('Error while opening folder:', err);
            //     });
            // }



    // const path =  require('path');



            function createFolder(folderPath) {
                fs.mkdir(folderPath, { recursive: true }, (err) => {
                    if (err) {
                        Notiflix.Report.failure(
                            'Create unsuccessful',
                            err,
                            'Okay',
                            );
                        } else {
                            Notiflix.Notify.success('create successful');
                            get_folder_linesheetlist();
                        }
                    });
                }

                function prompt_folder_name_create(){
                    Notiflix.Confirm.prompt(
                        'Create new folder',
                        'please fill your folder name',
                        '',
                        'Create',
                        'Cancel',
                        (clientAnswer) => {
                            // alert('Client answer is: ' + clientAnswer);
                            createFolder(clientAnswer);

                        },
                        (clientAnswer) => {
                            // alert('Client answer was: ' + clientAnswer);
                        },
                        );
                    }

                    // Function to remove a folder
                    function removeFolder(folderPath) {
                        fs.rmdir(folderPath, { recursive: true }, (err) => {
                            if (err) {
                                Notiflix.Report.failure(
                                    'remove unsuccessful',
                                    err,
                                    'Okay',
                                    );
                                } else {
                                    Notiflix.Notify.success(' remove successful');
                                    get_folder_linesheetlist();
                                }
                            });
                        }

