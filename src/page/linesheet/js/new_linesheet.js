
// var  PythonShell = ''


console.log('call xlsx');
const XLSX = require('xlsx');

console.log('call path');
const path = require('path');

console.log('call fs');
const fs = require('fs');

"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PythonShell = exports.NewlineTransformer = exports.PythonShellErrorWithLogs = exports.PythonShellError = void 0;
const events_1 = require("events");
const child_process_1 = require("child_process");
const os_1 = require("os");
const path_1 = require("path");
const stream_1 = require("stream");
const fs_1 = require("fs");
const util_1 = require("util");
function toArray(source) {
    if (typeof source === 'undefined' || source === null) {
        return [];
    }
    else if (!Array.isArray(source)) {
        return [source];
    }
    return source;
}
/**
 * adds arguments as properties to obj
 */
function extend(obj, ...args) {
    Array.prototype.slice.call(arguments, 1).forEach(function (source) {
        if (source) {
            for (let key in source) {
                obj[key] = source[key];
            }
        }
    });
    return obj;
}
/**
 * gets a random int from 0-10000000000
 */
function getRandomInt() {
    return Math.floor(Math.random() * 10000000000);
}
const execPromise = (0, util_1.promisify)(child_process_1.exec);
class PythonShellError extends Error {
}
exports.PythonShellError = PythonShellError;
class PythonShellErrorWithLogs extends PythonShellError {
}
exports.PythonShellErrorWithLogs = PythonShellErrorWithLogs;
/**
 * Takes in a string stream and emits batches seperated by newlines
 */
class NewlineTransformer extends stream_1.Transform {
    _transform(chunk, encoding, callback) {
        let data = chunk.toString();
        if (this._lastLineData)
            data = this._lastLineData + data;
        const lines = data.split(os_1.EOL);
        this._lastLineData = lines.pop();
        //@ts-ignore this works, node ignores the encoding if it's a number
        lines.forEach(this.push.bind(this));
        callback();
    }
    _flush(done) {
        if (this._lastLineData)
            this.push(this._lastLineData);
        this._lastLineData = null;
        done();
    }
}
exports.NewlineTransformer = NewlineTransformer;
/**
 * An interactive Python shell exchanging data through stdio
 * @param {string} script    The python script to execute
 * @param {object} [options] The launch options (also passed to child_process.spawn)
 * @param [stdoutSplitter] Optional. Splits stdout into chunks, defaulting to splitting into newline-seperated lines
 * @param [stderrSplitter] Optional. splits stderr into chunks, defaulting to splitting into newline-seperated lines
 * @constructor
 */
class PythonShell extends events_1.EventEmitter {
    /**
     * spawns a python process
     * @param scriptPath path to script. Relative to current directory or options.scriptFolder if specified
     * @param options
     * @param stdoutSplitter Optional. Splits stdout into chunks, defaulting to splitting into newline-seperated lines
     * @param stderrSplitter Optional. splits stderr into chunks, defaulting to splitting into newline-seperated lines
     */
    constructor(scriptPath, options, stdoutSplitter = null, stderrSplitter = null) {
        super();
        /**
         * returns either pythonshell func (if val string) or custom func (if val Function)
         */
        function resolve(type, val) {
            if (typeof val === 'string') {
                // use a built-in function using its name
                return PythonShell[type][val];
            }
            else if (typeof val === 'function') {
                // use a custom function
                return val;
            }
        }
        if (scriptPath.trim().length == 0)
            throw Error("scriptPath cannot be empty! You must give a script for python to run");
        let self = this;
        let errorData = '';
        events_1.EventEmitter.call(this);
        options = extend({}, PythonShell.defaultOptions, options);
        let pythonPath;
        if (!options.pythonPath) {
            pythonPath = PythonShell.defaultPythonPath;
        }
        else
            pythonPath = options.pythonPath;
        let pythonOptions = toArray(options.pythonOptions);
        let scriptArgs = toArray(options.args);
        this.scriptPath = (0, path_1.join)(options.scriptPath || '', scriptPath);
        this.command = pythonOptions.concat(this.scriptPath, scriptArgs);
        this.mode = options.mode || 'text';
        this.formatter = resolve('format', options.formatter || this.mode);
        this.parser = resolve('parse', options.parser || this.mode);
        // We don't expect users to ever format stderr as JSON so we default to text mode
        this.stderrParser = resolve('parse', options.stderrParser || 'text');
        this.terminated = false;
        this.childProcess = (0, child_process_1.spawn)(pythonPath, this.command, options);
        ['stdout', 'stdin', 'stderr'].forEach(function (name) {
            self[name] = self.childProcess[name];
            self.parser && self[name] && self[name].setEncoding(options.encoding || 'utf8');
        });
        // Node buffers stdout&stderr in batches regardless of newline placement
        // This is troublesome if you want to recieve distinct individual messages
        // for example JSON parsing breaks if it recieves partial JSON
        // so we use newlineTransformer to emit each batch seperated by newline
        if (this.parser && this.stdout) {
            if (!stdoutSplitter)
                stdoutSplitter = new NewlineTransformer();
            // note that setting the encoding turns the chunk into a string
            stdoutSplitter.setEncoding(options.encoding || 'utf8');
            this.stdout.pipe(stdoutSplitter).on('data', (chunk) => {
                this.emit('message', self.parser(chunk));
            });
        }
        // listen to stderr and emit errors for incoming data
        if (this.stderrParser && this.stderr) {
            if (!stderrSplitter)
                stderrSplitter = new NewlineTransformer();
            // note that setting the encoding turns the chunk into a string
            stderrSplitter.setEncoding(options.encoding || 'utf8');
            this.stderr.pipe(stderrSplitter).on('data', (chunk) => {
                this.emit('stderr', self.stderrParser(chunk));
            });
        }
        if (this.stderr) {
            this.stderr.on('data', function (data) {
                errorData += '' + data;
            });
            this.stderr.on('end', function () {
                self.stderrHasEnded = true;
                terminateIfNeeded();
            });
        }
        else {
            self.stderrHasEnded = true;
        }
        if (this.stdout) {
            this.stdout.on('end', function () {
                self.stdoutHasEnded = true;
                terminateIfNeeded();
            });
        }
        else {
            self.stdoutHasEnded = true;
        }
        this.childProcess.on('error', function (err) {
            self.emit('error', err);
        });
        this.childProcess.on('exit', function (code, signal) {
            self.exitCode = code;
            self.exitSignal = signal;
            terminateIfNeeded();
        });
        function terminateIfNeeded() {
            if (!self.stderrHasEnded || !self.stdoutHasEnded || (self.exitCode == null && self.exitSignal == null))
                return;
            let err;
            if (self.exitCode && self.exitCode !== 0) {
                if (errorData) {
                    err = self.parseError(errorData);
                }
                else {
                    err = new PythonShellError('process exited with code ' + self.exitCode);
                }
                err = extend(err, {
                    executable: pythonPath,
                    options: pythonOptions.length ? pythonOptions : null,
                    script: self.scriptPath,
                    args: scriptArgs.length ? scriptArgs : null,
                    exitCode: self.exitCode
                });
                // do not emit error if only a callback is used
                if (self.listeners('pythonError').length || !self._endCallback) {
                    self.emit('pythonError', err);
                }
            }
            self.terminated = true;
            self.emit('close');
            self._endCallback && self._endCallback(err, self.exitCode, self.exitSignal);
        }
        ;
    }
    /**
     * checks syntax without executing code
     * @returns rejects promise w/ string error output if syntax failure
     */
    static checkSyntax(code) {
        return __awaiter(this, void 0, void 0, function* () {
            const randomInt = getRandomInt();
            const filePath = (0, os_1.tmpdir)() + path_1.sep + `pythonShellSyntaxCheck${randomInt}.py`;
            const writeFilePromise = (0, util_1.promisify)(fs_1.writeFile);
            return writeFilePromise(filePath, code).then(() => {
                return this.checkSyntaxFile(filePath);
            });
        });
    }
    static getPythonPath() {
        return this.defaultOptions.pythonPath ? this.defaultOptions.pythonPath : this.defaultPythonPath;
    }
    /**
     * checks syntax without executing code
     * @returns {Promise} rejects w/ stderr if syntax failure
     */
    static checkSyntaxFile(filePath) {
        return __awaiter(this, void 0, void 0, function* () {
            const pythonPath = this.getPythonPath();
            let compileCommand = `${pythonPath} -m py_compile ${filePath}`;
            return execPromise(compileCommand);
        });
    }
    /**
     * Runs a Python script and returns collected messages as a promise.
     * If the promise is rejected, the err will probably be of type PythonShellErrorWithLogs
     * @param scriptPath   The path to the script to execute
     * @param options  The execution options
     */
    static run(scriptPath, options) {
        return new Promise((resolve, reject) => {
            let pyshell = new PythonShell(scriptPath, options);
            let output = [];
            pyshell.on('message', function (message) {
                output.push(message);
            }).end(function (err) {
                if (err) {
                    err.logs = output;
                    reject(err);
                }
                else
                    resolve(output);
            });
        });
    }
    ;
    /**
     * Runs the inputted string of python code and returns collected messages as a promise. DO NOT ALLOW UNTRUSTED USER INPUT HERE!
     * @param code   The python code to execute
     * @param options  The execution options
     * @return a promise with the output from the python script
     */
    static runString(code, options) {
        // put code in temp file
        const randomInt = getRandomInt();
        const filePath = os_1.tmpdir + path_1.sep + `pythonShellFile${randomInt}.py`;
        (0, fs_1.writeFileSync)(filePath, code);
        return PythonShell.run(filePath, options);
    }
    ;
    static getVersion(pythonPath) {
        if (!pythonPath)
            pythonPath = this.getPythonPath();
        return execPromise(pythonPath + " --version");
    }
    static getVersionSync(pythonPath) {
        if (!pythonPath)
            pythonPath = this.getPythonPath();
        return (0, child_process_1.execSync)(pythonPath + " --version").toString();
    }
    /**
     * Parses an error thrown from the Python process through stderr
     * @param  {string|Buffer} data The stderr contents to parse
     * @return {Error} The parsed error with extended stack trace when traceback is available
     */
    parseError(data) {
        let text = '' + data;
        let error;
        if (/^Traceback/.test(text)) {
            // traceback data is available
            let lines = text.trim().split(os_1.EOL);
            let exception = lines.pop();
            error = new PythonShellError(exception);
            error.traceback = data;
            // extend stack trace
            error.stack += os_1.EOL + '    ----- Python Traceback -----' + os_1.EOL + '  ';
            error.stack += lines.slice(1).join(os_1.EOL + '  ');
        }
        else {
            // otherwise, create a simpler error with stderr contents
            error = new PythonShellError(text);
        }
        return error;
    }
    ;
    /**
     * Sends a message to the Python shell through stdin
     * Override this method to format data to be sent to the Python process
     * @returns {PythonShell} The same instance for chaining calls
     */
    send(message) {
        if (!this.stdin)
            throw new Error("stdin not open for writing");
        let data = this.formatter ? this.formatter(message) : message;
        if (this.mode !== 'binary')
            data += os_1.EOL;
        this.stdin.write(data);
        return this;
    }
    ;
    /**
     * Closes the stdin stream. Unless python is listening for stdin in a loop
     * this should cause the process to finish its work and close.
     * @returns {PythonShell} The same instance for chaining calls
     */
    end(callback) {
        if (this.childProcess.stdin) {
            this.childProcess.stdin.end();
        }
        this._endCallback = callback;
        return this;
    }
    ;
    /**
     * Sends a kill signal to the process
     * @returns {PythonShell} The same instance for chaining calls
     */
    kill(signal) {
        this.terminated = this.childProcess.kill(signal);
        return this;
    }
    ;
    /**
     * Alias for kill.
     * @deprecated
     */
    terminate(signal) {
        // todo: remove this next breaking release
        return this.kill(signal);
    }
}
exports.PythonShell = PythonShell;
// starting 2020 python2 is deprecated so we choose 3 as default
PythonShell.defaultPythonPath = process.platform != "win32" ? "python3" : "python";
PythonShell.defaultOptions = {}; //allow global overrides for options
// built-in formatters
PythonShell.format = {
    text: function toText(data) {
        if (!data)
            return '';
        else if (typeof data !== 'string')
            return data.toString();
        return data;
    },
    json: function toJson(data) {
        return JSON.stringify(data);
    }
};
//built-in parsers
PythonShell.parse = {
    text: function asText(data) {
        return data;
    },
    json: function asJson(data) {
        return JSON.parse(data);
    }
};
;
//# sourceMappingURL=index.js.map



// console.log('call opn');
// const opn = require('opn');

// console.log('call PythonShell');
// var PythonShell = require('python-shell');

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

