
// var  PythonShell = ''

;
// const XLSX = require('xlsx');



// const fs = require('fs');

// const {PythonShell} = require('python-shell');
const path = require('path');

// import { XLSX , fs, path } from '/index.js';
// import { PythonShell } from '/index.js'

// import PythonShell  from '/dist/bundle.js'

const XLSX = require('xlsx');
const fs = require('fs');
const { PythonShell } = require('python-shell');




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

