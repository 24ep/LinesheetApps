
    var mysql = require('mysql');
    var { promisify } = require('util');
    function runSlimSelect(select_id) {
        new SlimSelect({
            select: select_id,
            settings: {
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



    var linesheet_file_path = sessionStorage.getItem('linesheet_file_path');
    var LOOKUP_SHEET = convertExcelToJson(linesheet_file_path, 'LOOKUP_SHEET');
    var ATT_OPTION = convertExcelToJson(linesheet_file_path, 'ATT_OPTION');
    var IM_FORM = convertExcelToJson(linesheet_file_path, 'IM_FORM');
    var IN_LINK_DATA = convertExcelToJsonTransposed(linesheet_file_path,'IN_LINK_DATA');


    function get_linesheet_group_model() {

        const uniqueCatalogueNumbers = new Set(
            IM_FORM
        .filter(item => item.ibc !== undefined)
        .map(item => item.catalogue_number_for_group)
        );
        const liElements = Array.from(uniqueCatalogueNumbers)
        .map(catalogueNumber => `<input placeholder="No catalog" readonly style="font-size: 13px;"  onclick="get_linesheet_group_ibc('${catalogueNumber}')" class="model_selection" value="${catalogueNumber}">`)
        .join('');
        document.getElementById("model_list").innerHTML = liElements;
    }
    function get_linesheet_group_ibc(catalogue_number_for_group){
        var linesheet_file_path = sessionStorage.getItem('linesheet_file_path');
        linesheet_info = convertExcelToJson(linesheet_file_path,'IM_FORM');
        // console.log(linesheet_info);
        const liElements = linesheet_info
        .filter(item => item.ibc !== undefined && item.catalogue_number_for_group == catalogue_number_for_group )
        .map(item => `

        <div class="p-3 rounded shadow mb-2 onclick="get_product_all_information('${item.ibc}')"">
        <div class="card-body" onclick="get_product_all_information('${item.ibc}')">
            <div class="text-secondary mb-1" style="font-size:12px">IBC : ${item.ibc}</div>
            <strong class="card-subtitle mb-1 text-muted bold " style="font-size:13px">${item.product_name_th}</strong>
                <ul class="list-group list-group-horizontal border-0">
                <li class="list-group-item rounded-0 border-0 p-0 m-0">
                    <input type="color" style="font-size: 13px;border-radius: 15px!important;width: 20px;height: 20px;" class="rounded-0 m-0 ps-0  border-0" id="${item.ibc}_color_hex" value="${item.color_hex}"></li>
                <li class="list-group-item border-0 p-0 ps-2" style="font-size:12px">${item.color_shade}</li>
                <li class="list-group-item border-0 p-0 ps-2" style="font-size:12px">${item.size}</li>
                </ul>
            </div>
        </div>


        `)
        .join('');
        document.getElementById("ibc_list").innerHTML=liElements
    }
    get_linesheet_group_model();


    function translate(text,language,element_id){
        const data = JSON.stringify({
            language: language,
            text: text
        });

            const xhr = new XMLHttpRequest();
            xhr.withCredentials = true;

            xhr.addEventListener('readystatechange', function () {
            if (this.readyState === this.DONE) {
                const response = JSON.parse(this.responseText);
                const result = response.result;
                console.log(result)
                document.getElementById(element_id).value = result; // Output the result to the console
                // You can use the 'result' variable for further processing or display on your page
            }
            });

            xhr.open('POST', 'https://translator82.p.rapidapi.com/api/translate');
            xhr.setRequestHeader('content-type', 'application/json');
            xhr.setRequestHeader('X-RapidAPI-Key', '65fd8abd73mshaef403ff4f9da0fp19e2ecjsnf410b3a5b157');
            xhr.setRequestHeader('X-RapidAPI-Host', 'translator82.p.rapidapi.com');

            xhr.send(data);
    }
    function  show_enrich_prompt(prompt,sku,attribute_code){
        if(prompt=='ask_for_apply'){
            body = `<strong>Scope of apply to ${attribute_code}</strong>
                    <hr>
                    <div class="d-grid gap-2 col-6 mx-auto">
                        <button class="btn btn-primary" type="button" onclick="show_enrich_prompt_detail('one_sku','${sku}','${attribute_code}')">Apply to this sku</button>
                        <button class="btn btn-primary" type="button" onclick="show_enrich_prompt_detail('group','${sku}','${attribute_code}')">Apply to all sku in this group</button>
                        <button class="btn btn-primary" type="button">All sku in linesheet</button>
                    </div> `;
            document.getElementById("body_model").innerHTML=body

        }
    }

    function  show_enrich_prompt_detail(type,sku,attribute_code){
            body_table = ` <strong class="p-1 ps-3 pe-3 mb-3 bg-light rounded">Enrich : ${attribute_code}</strong>
                    <hr>
                    <table class="table">
                        <thead>
                            <tr>
                            <th scope="col">SKU</th>
                            <th scope="col">Current product name</th>
                            <th scope="col">Auto Translate</th>
                            </tr>
                        </thead>
                        <tbody id="table_enrich">

                        </tbody>
                        </table>
                    <button type="button" class="btn btn-primary">Accept</button>`;
            document.getElementById("body_model").innerHTML= body_table;
        if(type=='one_sku'){
            body = `
                    <tr>
                    <th style="vertical-align: middle;" scope="row">${sku}</th>
                    <td style="vertical-align: middle;">${get_ls_info_cell_by_cell(sku,'product_name_th')}</td>
                    <td style="vertical-align: middle;"><input type="text" class="form-control h-100 rounded" id="text_changed_${sku}" ></td>
                    </tr>
                   `;
            document.getElementById("table_enrich").innerHTML= body;
            translate(get_ls_info_cell_by_cell(sku,'product_name_en' ), "th",`text_changed_${sku}`)

        }
        else if(type=='group'){

                var catalogue_number_for_group = get_ls_info_cell_by_cell(sku,'catalogue_number_for_group')
                var linesheet_file_path = sessionStorage.getItem('linesheet_file_path');
                linesheet_info = convertExcelToJson(linesheet_file_path,'IM_FORM');
                // console.log(linesheet_info);
                const liElements = linesheet_info
                .filter(item => item.ibc !== undefined && item.catalogue_number_for_group == catalogue_number_for_group )
                .map(item => `

                <tr>
                    <th style="vertical-align: middle;" scope="row">${item.ibc}</th>
                    <td style="vertical-align: middle;">${item.product_name_th}</td>
                    <td style="vertical-align: middle;"><input type="text" class="form-control h-100 rounded" id="text_changed_${item.ibc}" ></td>
                </tr>

                `)
                .join('');
                document.getElementById("table_enrich").innerHTML= liElements;
                for (const item of liElements) {
                    console.log(item.product_name_en)
                    translate(item.product_name_en, "th",`text_changed_${item.ibc}`)
                }

        }



    }
    function super_function(attribute_code,TargetIBC){

        if(attribute_code=='product_name_th'){
            func=  ` <div class="col-sm-1 p-0">
                <div class="dropdown">
                <button class="btn btn-sm btn-light shadow-sm dropdown-toggle" type="button" id="dropdownMenuButton1" data-bs-toggle="dropdown" aria-expanded="false">
                    <ion-icon name="color-wand-outline"></ion-icon>
                </button>
                <ul class="dropdown-menu" aria-labelledby="dropdownMenuButton1">
                    <li><a class="dropdown-item" onclick="show_enrich_prompt('ask_for_apply','${TargetIBC}','${attribute_code}')" data-bs-toggle="modal" data-bs-target="#enrich_prompt" >Translate from product name EN field</a></li>
                    <li><a class="dropdown-item" href="#">Generate new product name</a></li>
                </ul>
                </div>
            </div>`
        }else if(attribute_code=='product_name_en'){

            func=  ` <div class="col-sm-1 p-0">
                <div class="dropdown">
                <button class="btn btn-sm btn-light shadow-sm dropdown-toggle" type="button" id="dropdownMenuButton1" data-bs-toggle="dropdown" aria-expanded="false">
                    <ion-icon name="color-wand-outline"></ion-icon>
                </button>
                <ul class="dropdown-menu" aria-labelledby="dropdownMenuButton1">
                    <li><a class="dropdown-item" href="#">Translate from product name TH field</a></li>
                    <li><a class="dropdown-item" href="#">Generate new product name</a></li>
                </ul>
                </div>
            </div>`
        }else if(attribute_code=='short_description_th'){

            func=  ` <div class="col-sm-1 p-0">
                <div class="dropdown">
                <button class="btn btn-sm btn-light shadow-sm dropdown-toggle" type="button" id="dropdownMenuButton1" data-bs-toggle="dropdown" aria-expanded="false">
                    <ion-icon name="color-wand-outline"></ion-icon>
                </button>
                <ul class="dropdown-menu" aria-labelledby="dropdownMenuButton1">
                    <li><a class="dropdown-item" href="#">Translate from short description EN field</a></li>
                    <li><a class="dropdown-item" href="#">Generate new short description</a></li>
                </ul>
                </div>
            </div>`
        }else if(attribute_code=='short_description_en'){

            func=  ` <div class="col-sm-1 p-0">
                <div class="dropdown">
                <button class="btn btn-sm btn-light shadow-sm dropdown-toggle" type="button" id="dropdownMenuButton1" data-bs-toggle="dropdown" aria-expanded="false">
                    <ion-icon name="color-wand-outline"></ion-icon>
                </button>
                <ul class="dropdown-menu" aria-labelledby="dropdownMenuButton1">
                    <li><a class="dropdown-item" href="#">Translate from short description TH field</a></li>
                    <li><a class="dropdown-item" href="#">Generate new short description</a></li>
                </ul>
                </div>
            </div>`
        }else if(attribute_code=='color_hex'){

            func=  ` <div class="col-sm-1 p-0">
                        <div class="dropdown">
                        <button class="btn btn-sm btn-light shadow-sm dropdown-toggle" type="button" id="dropdownMenuButton1" data-bs-toggle="dropdown" aria-expanded="false">
                            <ion-icon name="color-wand-outline"></ion-icon>
                        </button>
                        <ul class="dropdown-menu" aria-labelledby="dropdownMenuButton1">
                            <li><a class="dropdown-item" href="#">Generate from color shade</a></li>
                        </ul>
                        </div>
                    </div>`

        }else{
            func='';
        }

        return func

    }


    function get_product_all_information(TargetIBC) {
        Notiflix.Loading.standard('loading ...');
        const getColumnHTML = (items) =>
        items
        .map(({ linesheet_code, field_type, required }) => {
            const value = get_ls_info_cell_by_cell(TargetIBC, linesheet_code);
            const invalidClass = required && !value ? ' is-invalid' : '';
            const requiredAttribute = required ? ' required' : '';
            const invalidMessage = required && !value ? '<small class="invalid-feedback">This field is required.</small>' : '';
            console.log(`send->${linesheet_code} : ${field_type}`);
            if (value == 'undefined') {
                invalidMessage = 'not found column in linesheet';
            }
            switch (field_type) {
                case 'Simple Select':
                case 'Multiple Select':
                if (field_type === 'Multiple Select') {
                    select_type = 'Multiple';
                }else{
                    select_type = '';
                }
                if (linesheet_code == 'online_categories') {
                    var options = get_cate_option_linesheet('online_categories', value);
                }else{
                    var options = get_att_option_linesheet(linesheet_code, value);
                }
                return `<div class="col mt-3 row">
                    <label for="${linesheet_code}" class=" fw-bold text-secondary col-sm-4 col-form-label">${linesheet_code}${required ? ' *' : ''}</label>
                    <div class="col-sm-7">
                        <input type="hidden" id="${linesheet_code}" value="${value}" class="form-control" placeholder="">
                        <select ${select_type} style="font-size:13px" id="${linesheet_code}_show" name="${linesheet_code}_show" class=" form-select ${invalidClass}"  onchange="updateExcelCellValue('IM_FORM', getColumnNumber('IM_FORM', '${linesheet_code}'), getRowNumberWithMatchingValue('IM_FORM', getColumnNumber('IM_FORM', 'ibc'), '${TargetIBC}'), '${linesheet_code}') ">
                            <option value=""></option>
                            ${options}
                        </select>
                        ${invalidMessage}
                    </div>
                </div>
                `;
                runSlimSelect("#"+linesheet_code+"_show")
                case 'Free Text':
                case 'Number only':
                case 'Formula':
                case 'link':
                case 'Boolean':
                const inputType = field_type === 'Free Text' ? 'text': field_type === 'Boolean' ? 'text' : field_type === 'Number only' ? 'number' : field_type === 'Formula' ? 'text" disabled' : field_type === 'link' ? 'link" disabled' : '';
                return `<div class="col mt-3 row">
                    <label for="${linesheet_code}" class=" fw-bold text-secondary col-sm-4 col-form-label">${linesheet_code}${required ? ' *' : ''}</label>
                    <div class="col-sm-7 ps-2 pe-2">
                        <input type="${inputType}" id="${linesheet_code}" name="${linesheet_code}" style="font-size:13px" class="p-3  form-control ${invalidClass}" value="${value}"${requiredAttribute}  onchange="updateExcelCellValue('IM_FORM', getColumnNumber('IM_FORM', '${linesheet_code}'), getRowNumberWithMatchingValue('IM_FORM', getColumnNumber('IM_FORM', 'ibc'), '${TargetIBC}'), '${linesheet_code}') ">
                        ${invalidMessage}
                    </div>
                    ${super_function(linesheet_code,TargetIBC)}
                </div>`;
                case 'Free Textarea':
                    return `<div class="col mt-3 row">
                        <label for="${linesheet_code}" class=" fw-bold text-secondary col-sm-4 col-form-label">${linesheet_code}${required ? ' *' : ''}</label>
                        <div class="col-sm-7">
                            <textarea class="form-control" style="font-size:13px;height: 170px" class="p-3 form-control ${invalidClass}" placeholder="Leave a comment here" id="${linesheet_code}" ${requiredAttribute}  onchange="updateExcelCellValue('IM_FORM', getColumnNumber('IM_FORM', '${linesheet_code}'), getRowNumberWithMatchingValue('IM_FORM', getColumnNumber('IM_FORM', 'ibc'), '${TargetIBC}'), '${linesheet_code}') ">${value}</textarea>
                            ${invalidMessage}
                        </div>
                        ${super_function(linesheet_code,TargetIBC)}
                    </div>`;
                break;
                default:
                // Handle any other field_type cases here
                return `<div class="col mt-3 row">
                    <label for="${linesheet_code}" class=" fw-bold text-secondary col-sm-4 col-form-label">${linesheet_code}${required ? ' *' : ''}</label>
                    <div class="col-sm-7">
                        <input type="${inputType}" id="${linesheet_code}" name="${linesheet_code}" class="p-3  form-control ${invalidClass}" value="${value}"${requiredAttribute}  onchange="updateExcelCellValue('IM_FORM', getColumnNumber('IM_FORM', '${linesheet_code}'), getRowNumberWithMatchingValue('IM_FORM', getColumnNumber('IM_FORM', 'ibc'), '${TargetIBC}'), '${linesheet_code}') ">
                        ${invalidMessage}
                    </div>
                    ${super_function(linesheet_code,TargetIBC)}
                </div>`;
                break;
            }
        })
        .join('');
        const ibc = get_ls_info_cell_by_cell(TargetIBC, 'ibc');
        const product_name_th = get_ls_info_cell_by_cell(TargetIBC, 'product_name_th');
        const family = lookup_label_cate_to_family(TargetIBC);
        set_value_in_to_elements(ibc, 'ibc');
        set_value_in_to_elements(product_name_th, 'product_name_th');
        set_value_in_to_elements(family, 'family');
        const getBootstrapColumns = (results, targetElement) => {
            const { length } = results;
            const halfLength = Math.ceil(length / 2);
            const column1 = results.slice(0, halfLength);
            const column2 = results.slice(halfLength);
            const bootstrapColumns = `
            <div class="container">
                <div class="row">
                    <div class="col">${getColumnHTML(column1)}</div>
                    <div class="col">${getColumnHTML(column2)}</div>
                </div>
            </div>
            `;
            set_value_in_to_elements(bootstrapColumns, targetElement);
        };
        //get common session
        get_attribute(family, 'variant', (results) => {
            getBootstrapColumns(results, 'variant_attribute_list');
        });
        //get common session
        get_attribute(family, 'common', (results) => {
            getBootstrapColumns(results, 'common_attribute_list');
        });
        Notiflix.Loading.remove();
    }
    function get_attribute(family,type, callback) {
        // const mysql = require('mysql');
        const connection = mysql.createConnection({
            host: '156.67.217.3',
            user: 'data_studio',
            password: 'a417528639',
            database: 'im_form'
        });
        connection.connect();
        const query =
        'SELECT linesheet_code, field_label, both_language, field_type ,CASE WHEN ' +
        family +
        ' = "R" THEN true ELSE false END AS required FROM attribute_setting WHERE ' +
        family +
        ' IN ("R","O") and status = "Actived" AND grouping_common = "'+type+'"';
        connection.query(query, (error, results) => {
            if (error) throw error;
            // Duplicate rows with _en and _th suffixes if both_language is "yes"
            const modifiedResults = [];
            results.forEach((item) => {
                if (item.both_language == true) {
                    const newItemEn = { ...item, linesheet_code: item.linesheet_code + '_en' };
                    const newItemTh = { ...item, linesheet_code: item.linesheet_code + '_th' };
                    modifiedResults.push(newItemEn, newItemTh);
                } else {
                    modifiedResults.push(item);
                }
            });
            connection.end();
            // Return modified results
            callback(modifiedResults);
            // return modifiedResults
        });
    }
    function lookup_label_cate_to_family(TargetIBC){
        var categories_label =  get_ls_info_cell_by_cell(TargetIBC,'online_categories');
        console.log(categories_label)
        get_categories_mapping_table((results) => {
            // Use the results here or assign them to a variable
            var table_categories_mapping = results;
            const matchingFamily = Object.values(table_categories_mapping).find(item => item.label_th === categories_label);
            // console.log(matchingFamily?.['family'])
            if (matchingFamily) {
                family =  matchingFamily?.['family'];
            } else {
                family =  'No matching family found.';
            }
        });
        console.log(family)
        return family
    }
    function get_categories_mapping_table(callback){
        const connection = mysql.createConnection({
            host: '156.67.217.3',
            user: 'data_studio',
            password: 'a417528639',
            database: 'im_form'
        });
        connection.connect();
        optionsHTML ='';
        const query = 'SELECT * FROM categories_setting';
        connection.query(query, (error, results) => {
            if (error) throw error;
            // return results
            connection.end();
            callback(results);
        });
    }

    function get_ls_info_cell_by_cell(TargetIBC,propertyName ) {
        const linesheet_file_path = sessionStorage.getItem('linesheet_file_path');
        const data_value = IM_FORM.find(item => item.ibc == TargetIBC);
        return data_value?.[propertyName]
    }

    function get_att_option_linesheet(linesheet_code, selected_option) {
        const selectedOptions = selected_option ? selected_option.split(',') : [];
        const options = LOOKUP_SHEET
        .filter(result => result?.['linesheet_code'] == linesheet_code)
        .map(result => {
            const isSelected = selectedOptions.includes(result['input_option']) ? 'selected' : '';
            return `<option value="${result?.['input_option']}" ${isSelected}>${result?.['input_option']}</option>`;
        });
        return options.join('');
    }

    function get_cate_option_linesheet(linesheet_code, selected_option) {
        const selectedOptions = selected_option ? selected_option.split(',') : [];

        const options = ATT_OPTION
        .filter(result => result?.['online_categories'] != '')
        .map(result => {
            const isSelected = selectedOptions.includes(result?.['online_categories']) ? 'selected' : '';
            return `<option value="${result?.['online_categories']}" ${isSelected}>${result?.['online_categories']}</option>`;
        });
        return options.join('');
    }
    function set_value_in_to_elements(value,targetElementId){
        const targetElement = document.getElementById(targetElementId);
        if (targetElement) {
            targetElement[targetElement.tagName === 'INPUT' ? 'value' : 'innerHTML'] =value || (targetElement.tagName === 'INPUT' ? '' : 'Data not found');
        }
    }
    var configOptions = [
    { id: 'brand', args: ['get_text_input_two_grid', 'brand', 'free_text',get_linesheet_information('brand'),'2'], variableName: 'brandList'  , slim_id:'#brand_show' },
    { id: 'launch_date', args: ['get_text_input_two_grid', 'launch_date', 'free_text',get_linesheet_information('launch_date'),'7'], variableName: 'launch_dateList'  , slim_id:'#launch_date_show' },
    { id: 'sku', args: ['get_text_input_two_grid', 'sku', 'free_text',get_linesheet_information('sku'),'3'], variableName: 'skuList'  , slim_id:'#sku_show' },
    { id: 'sale_channel', args: ['get_multi_select_input_two_grid', 'sale_channel', 'multiple',get_linesheet_information('sale_channel'),'6'], variableName: 'SaleChannelList' , slim_id:'#sale_channel_show'  },
    { id: 'stock_source', args: ['get_multi_select_input_two_grid', 'stock_source', 'multiple',get_linesheet_information('stock_source'),'4'], variableName: 'stockSourceList' , slim_id:'#stock_source_show'  },
    { id: 'production_type', args: ['get_single_select_input_two_grid', 'production_type', 'single',get_linesheet_information('production_type'),'8'], variableName: 'ProductionTypeList' , slim_id:'#production_type_show'  },
    { id: 'template', args: ['get_family_input_two_grid', 'template', 'multiple',get_linesheet_information('template'),'5'], variableName: 'templateList' , slim_id:'#template_show'  }
    ];
    configOptions.forEach(option => {
        let optionList = '';
        new PythonShell(path.join(__dirname,`../src/page/linesheet/config/new_linesheet_config.py`), { args: option.args })
        .on('error', err => {
            console.error('An error occurred while running the Python script:', err);
            // handle the error here
        })
        .on('stderr', message => {
            console.error('Received error message:', message);
        })
        .on('message', message => {
            optionList += message;
            if (optionList) {
                document.getElementById(option.id+"_slot").innerHTML = optionList;
                runSlimSelect(option.slim_id);
            }
        });
    });
    var XLSX = require('xlsx');
    var fs = require('fs');
    function updateExcelCellValue(sheetName, columnNumber, rowNumber, element_id) {
    try {
        var newValue = document.getElementById(element_id).value;
        const linesheet_file_path = sessionStorage.getItem('linesheet_file_path');
        // Read the Excel file
        const workbook = XLSX.readFile(linesheet_file_path);
        // Select the specified sheet
        const sheet = workbook.Sheets[sheetName];
        // Convert column number to letter
        const columnName = XLSX.utils.encode_col(columnNumber);
        // Generate the cell reference based on the column number and row number
        const cellReference = columnName + rowNumber;
        console.log(sheetName + ":" + cellReference + ":" + element_id + ":" + newValue);
        // Check if the cell exists
        if (!sheet.hasOwnProperty(cellReference)) {
            sheet[cellReference] = { t: 's', v: newValue };
        } else {
            // Preserve the existing style properties
            const existingCell = sheet[cellReference];
            sheet[cellReference] = {
                t: existingCell.t,
                v: newValue,
                s: existingCell.s,
                w: newValue,
            };
        }
        // Save the modified Excel file
        XLSX.writeFile(workbook, linesheet_file_path);
        // Save the changes
        Notiflix.Notify.success(element_id + ' updated successfully.');
    } catch (error) {
        console.error('An error occurred:', error);
    }
}







    function getColumnNumber(sheet_name, columnName) {
        // Read the Excel file
        const linesheet_file_path = sessionStorage.getItem('linesheet_file_path');
        const workbook = XLSX.readFile(linesheet_file_path);
            // Select the specified sheet
        const sheet = workbook.Sheets[sheet_name];
        const range = XLSX.utils.decode_range(sheet['!ref']);
        const colCount = range.e.c + 1;

        for (let colIndex = 0; colIndex < colCount; colIndex++) {
            const cellAddress = XLSX.utils.encode_cell({ c: colIndex, r: 0 });
            const cellValue = sheet[cellAddress]?.v;

            if (cellValue === columnName) {
            return colIndex + 1; // Adding 1 to convert from zero-based index to one-based index
            }
        }

        return -1; // Column not found
        }

    function getRowNumberWithMatchingValue(sheet_name, columnNumber, searchValue) {
        // Read the Excel file
        const linesheet_file_path = sessionStorage.getItem('linesheet_file_path');
        const workbook = XLSX.readFile(linesheet_file_path);
            // Select the specified sheet
        const sheet = workbook.Sheets[sheet_name];
        const range = XLSX.utils.decode_range(sheet['!ref']);
        const rowCount = range.e.r + 1;

        for (let rowIndex = 1; rowIndex < rowCount; rowIndex++) {
            const cellAddress = XLSX.utils.encode_cell({ c: columnNumber - 1, r: rowIndex });
            const cellValue = sheet[cellAddress]?.v;

            if (cellValue == searchValue) {
            return rowIndex + 1; // Adding 1 to convert from zero-based index to one-based index
            }
        }

        return -1; // Row not found
    }


