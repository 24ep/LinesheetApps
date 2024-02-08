
    var linesheet_file_path = sessionStorage.getItem('linesheet_file_path');
    var IN_LINK_DATA = convertExcelToJsonTransposed(linesheet_file_path,'IN_LINK_DATA');

    document.getElementById("brand").innerHTML =  get_linesheet_information('brand');
    document.getElementById("sku").innerHTML =  get_linesheet_information('sku')+' SKUs';
    document.getElementById("template").innerHTML =  get_linesheet_information('template');


    $("#nav_choose_file").load('page/linesheet/asset/nav_choose_file.html');

    function summary_parent_sku_range(){

        parent_prefix = document.getElementById("parent_prefix").value
        parent_bu = document.getElementById("parent_bu").value
        parent_us_id = document.getElementById("parent_us_id").value
        parent_year = document.getElementById("parent_year").value
        parent_month = document.getElementById("parent_month").value
        parent_running = document.getElementById("parent_running").value

        parent_sku_display =parent_prefix+parent_bu+parent_us_id+parent_year+parent_month+parent_running
        document.getElementById("preview_parent_start").innerText = parent_sku_display

    }

    var XLSX = require('xlsx');
    var { PythonShell } = require('python-shell');
    var os = require('os');
    var path = require('path');
    var fs = require('fs');

  // Function to handle file input change
//   document.getElementById('linesheet_input').files[0] = sessionStorage.getItem('linesheet_file_path');

    function revealFileInExplorer(filePath) {
    var url = 'file://' + filePath;
    window.open(url, '_blank');
    }

    function handleFileChange() {
    Notiflix.Block.standard('.convert_running');
      console.log('call handleFileChange');
    //   const file = event.target.files[0];
    //   const file= sessionStorage.getItem('linesheet_file_path')
    //   const reader = new FileReader();

    //   reader.onload = function (e) {
        // const data = new Uint8Array(e.target.result);
        const file= sessionStorage.getItem('linesheet_file_path')
        // const workbook = XLSX.read(data, { type: 'array' });
        const workbook = XLSX.readFile(file);
        const worksheet = workbook.Sheets[workbook.SheetNames[0]];
        let jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 0 ,defval: ''});

        // Remove rows 2 to 11
        jsonData.splice(0, 11);

        jsonData = jsonData.filter(row => row['ibc'] !== '');
       // Find the columns to delete


        // const columnsToDelete = Object.keys(jsonData[0]).filter(key => key.startsWith('__EMPTY'));

        // Remove the columns from each row in the jsonData
        jsonData = jsonData.map(row => {
        // columnsToDelete.forEach(column => {
        //     delete row[column];
        // });

        return row;
        });

        console.log('Excel file converted to JSON:');
        console.log(jsonData);

        // Convert JSON to string
        const jsonString = JSON.stringify(jsonData);

        // Create a JSON file in the temporary directory
        const tempDir = os.tmpdir();
        const filePath = path.join(tempDir, 'temp_spear_convert.json');
        fs.writeFileSync(filePath, jsonString);

        //get data from elements
        var product_online = document.getElementById("product_online").checked;
        var enable_on_channel = document.getElementById("enable_on_channel").checked;

        // var allow_cc = document.getElementById("allow_cc").checked;
        // var allow_cod = document.getElementById("allow_cod").checked;
        var new_in = document.getElementById("new").checked;
        // var allow_gift_wrapping = document.getElementById("allow_gift_wrapping").checked;
        var allow_installment = document.getElementById("allow_installment").checked;
        var can_return = document.getElementById("can_return").checked;
        var can_exchange = document.getElementById("can_exchange").checked;
        var embed_size_guide = document.getElementById("embed_size_guide").checked;

        // var bu = document.getElementById("bu").value
        var job_number = document.getElementById("job_number").value
        // var product_status = document.getElementById("product_status").value
        var launch_date = document.getElementById("launch_date").value
        var sheet_name = document.getElementById("sheet_name").value

        var parent_prefix = document.getElementById("parent_prefix").value
        var parent_bu = document.getElementById("parent_bu").value
        var parent_us_id = document.getElementById("parent_us_id").value
        var parent_year = document.getElementById("parent_year").value
        var parent_month = document.getElementById("parent_month").value
        var parent_running = document.getElementById("parent_running").value

        var template = document.getElementById("template").innerHTML

        //clear log
        document.getElementById('convert_logs').innerHTML="";
        document.getElementById('result_convert').innerHTML ="";
        var_send_to_validate=[sessionStorage.getItem('linesheet_file_path')]
        var_send_to_convert = [
                                path.join(tempDir, 'temp_spear_convert.json'),
                                parent_prefix,
                                parent_bu,
                                parent_us_id,
                                parent_year,
                                parent_month,
                                parent_running,
                                product_online,
                                enable_on_channel,
                                // allow_cc,
                                // allow_cod,
                                new_in,
                                // allow_gift_wrapping,
                                allow_installment,
                                can_return,
                                can_exchange,
                                embed_size_guide,
                                job_number,
                                // product_status,
                                launch_date,
                                sheet_name,
                                template
                            ]

        // start validation using VBA on files
        new PythonShell(path.join(__dirname,`../src/page/linesheet/convertor/vba_caller.py`), { args: var_send_to_validate}  )
        .on('error', err => {console.error('An error occurred while running the Python script:', err);})
        .on('stderr', message => {
            console.error('Received error message:', message);
            if(message.includes('Warning')==false){
                Notiflix.Report.warning(
                    'Warning',
                    message,
                    'Okay',
                );

            }else{
                Notiflix.Report.warning(
                    'Warning',
                     message,
                    'Okay',
                );
            }
        })
        .on('close', message => {
            convert_logs = document.getElementById('convert_logs').innerHTML;

        })
        .on('message', message => {
            if(message.includes("Error")){
                message_style='<li class="text-danger m-1  fw-bold"><ion-icon name="alert-circle-outline" class="me-1"></ion-icon>'+message+'</li>'

            }else if(message.includes("Warning")){
                message_style='<li class="text-warning m-1  fw-bold"><ion-icon name="warning-outline" class="me-1"></ion-icon>'+message+'</li>'
            }else if(message.includes("Passed")){
                message_style='<li class="text-success m-1  fw-bold"><ion-icon name="checkmark-outline" class="me-1"></ion-icon>'+message+'</li>'
            }
            else{
                message_style='<li class="text-dark m-1  fw-bold"><ion-icon name="information-circle-outline" class="me-1"></ion-icon>'+message+'</li>'
            }
            if(message!=''){
                document.getElementById('convert_logs').innerHTML = document.getElementById('convert_logs').innerHTML + message_style

                // start convert
                new PythonShell(path.join(__dirname,`../src/page/linesheet/convertor/main.py`), { args: var_send_to_convert}  )
                        .on('error', err => {console.error('An error occurred while running the Python script:', err);})
                        .on('stderr', message => {
                            console.error('Received error message:', message);
                            if(message.includes('Warning')==false){
                                Notiflix.Report.warning(
                                    'Warning',
                                    message,
                                    'Okay',
                                );

                            }else{
                                Notiflix.Report.warning(
                                    'Warning',
                                    message,
                                    'Okay',
                                );
                            }
                        })
                        .on('close', message => {
                            convert_logs = document.getElementById('convert_logs').innerHTML;

                            var currentURL = window.location.href;
                            var basePath = currentURL.substring(0, currentURL.lastIndexOf('/'));
                            var minusOnePath = basePath.substring(0, basePath.lastIndexOf('/'));
                            var minusOnePath = minusOnePath.substring(0, minusOnePath.lastIndexOf('/'));
                            var minusOnePath = minusOnePath.substring(0, minusOnePath.lastIndexOf('/'));

                            download_bt= `
                            <div class="dropdown">
                                <a class="btn btn-sm btn-success dropdown-toggle" href="#" role="button" id="dropdownMenuLink" data-bs-toggle="dropdown" aria-expanded="false">Open the template</a>
                                <ul class="dropdown-menu" aria-labelledby="dropdownMenuLink">
                                    <li><a class="dropdown-item" onclick="revealInFileExplorer(&#39;`+minusOnePath+`/converted&#39;)">Reveal in File Explorer</a></li>
                                </ul>
                            </div>`;

                            document.getElementById('result_convert').innerHTML = download_bt;

                            Notiflix.Block.remove('.convert_running');

                        })
                        .on('message', message => {
                            if(message.includes("Error")){
                                message_style='<li class="text-danger m-1 fw-bold"><ion-icon name="alert-circle-outline" class="me-1"></ion-icon>'+message+'</li>'

                            }else if(message.includes("Warning")){
                                message_style='<li class="text-warning m-1 fw-bold"><ion-icon name="warning-outline" class="me-1"></ion-icon>'+message+'</li>'
                            }else if(message.includes("Success")){
                                message_style='<li class="text-success m-1 fw-bold"><ion-icon name="checkmark-outline" class="me-1"></ion-icon>'+message+'</li>'
                            }
                            else{
                                message_style='<li class="text-dark m-1  fw-bold"><ion-icon name="information-circle-outline" class="me-1"></ion-icon>'+message+'</li>'
                            }
                            if(message!=''){
                                document.getElementById('convert_logs').innerHTML = document.getElementById('convert_logs').innerHTML + message_style

                            }
                        })
                    ;
            }
        })


    }
