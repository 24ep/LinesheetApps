
//get dropdown list
function get_option_list_measurement(){
    fetch('./config.json')
    .then(response => response.json())
    .then(data => {
        let options = "";
        data.measurement.forEach(measurement => {
            options += `<option value='${measurement.code}'>${measurement.label}</option>`;
        });
        document.getElementById('measurement').innerHTML = options;
    });
}
function get_option_list_unit_dimension(){
    var lang = document.getElementById("lang").value;
    fetch('./config.json')
    .then(response => response.json())
    .then(data => {
        let options = "";
        data.unit_dimension.forEach(unit_dimension => {
            if(lang=='th'){
                options += `<option value='${unit_dimension.code_th}'>${unit_dimension.label_th}</option>`;
            }else{
                options += `<option value='${unit_dimension.code_en}'>${unit_dimension.label_en}</option>`;
            }
        });
        document.getElementById('unit_dimension').innerHTML = options;
    });
}
function get_option_list_standard(){
    fetch('./config.json')
    .then(response => response.json())
    .then(data => {
        let options = "";
        data.standard.forEach(standard => {
            options += `<option value='${standard.code}'>${standard.label}</option>`;
        });
        document.getElementById('standard').innerHTML = options;
    });
}
function get_option_list_row(){
    fetch('./config.json')
    .then(response => response.json())
    .then(data => {
        let options = "";
        data.row.forEach(row => {
            options += `<option value='${row.code}'>${row.label}</option>`;
        });
        document.getElementById('row').innerHTML = options;
    });
}
function get_option_list_column(){
    fetch('./config.json')
    .then(response => response.json())
    .then(data => {
        let options = "";
        data.columns.forEach(columns => {
            options += `<option value='${columns.code}'>${columns.label}</option>`;
        });
        document.getElementById('columns').innerHTML = options;
    });
}
function get_option_list_lang(){
    fetch('./config.json')
    .then(response => response.json())
    .then(data => {
        let options = "";
        data.lang.forEach(lang => {
            options += `<option value='${lang.code}'>${lang.label}</option>`;
        });
        document.getElementById('lang').innerHTML = options;
    });
    // get_option_list_unit_dimension();
}
function suggestion_chart_name(){
    var use_default_chart_name = document.getElementById("use_default_chart_name");
    if(use_default_chart_name.checked == true){
        var lang = document.getElementById("lang").value;
        var measurement_image_selected = document.getElementById("measurement").value;
        var current_chart_name = document.getElementById("chart_name").value
        // get_suggestion_chart_name
        fetch('./config.json')
        .then(response => response.json())
        .then(data => {
            data.measurement.forEach(measurement => {
                if(measurement.code === measurement_image_selected){
                    if(lang=='th'){
                        suggestion_chart_name_value = measurement.chart_name_th;
                        sg_chart_name.innerHTML = suggestion_chart_name_value;
                        document.getElementById("chart_name").value = suggestion_chart_name_value;
                    }else{
                        suggestion_chart_name_value = measurement.chart_name_en;
                        sg_chart_name.innerHTML = suggestion_chart_name_value;
                        document.getElementById("chart_name").value = suggestion_chart_name_value;
                    }
                }
            });
        });

        var sg_chart_name = document.getElementById("sg_chart_name");
    }

}
function change_use_default_chart_name(){
    var use_default_chart_name = document.getElementById("use_default_chart_name");
    var chart_name = document.getElementById("chart_name");
    if(use_default_chart_name.checked == true){
        chart_name.disabled = true;
    }else{
        chart_name.disabled = false;
        suggestion_chart_name();
    }
}

get_option_list_measurement();
get_option_list_unit_dimension();
get_option_list_standard();
get_option_list_row();
get_option_list_column();
get_option_list_lang();
// change size guide table ----

function change_image_measurement(){
    var measurement = document.getElementById("measurement").value;
    var lang = document.getElementById("lang").value;
    document.getElementById("measurement_image").src = "./image/measurement/"+measurement+"_"+lang+"/"+measurement+"_"+lang+"-2.jpg";


    var standard = document.getElementById("standard").value;
 // change measurement
    if(measurement=='men_shoes' || measurement=='women_shoes' || measurement=='baby_shoes'){
        first_column = standard;
    }else if(measurement=='girl_bra' || measurement=='women_bra'){
        if(lang=="th"){
            first_column = "คัพ";
        }else{
            first_column = "CUP";
        }
    }
    else if(measurement=='baby_clothing'){
        if(lang=="th"){
            first_column = "เดือน";
        }else{
            first_column = "MONTH";
        }
    }else{
        if(lang=="th"){
            first_column = "ขนาด";
        }else{
            first_column = "SIZE";
        }
    }

    document.getElementById("first_column").value= first_column;
    suggestion_chart_name();
}
function change_unit_dimension(){
    var lang = document.getElementById("lang").value;
    var unit_selected = document.getElementById("unit_dimension").value;
    // document.getElementById("unit_bt").innerHTML= unit;
    fetch('./config.json')
            .then(response => response.json())
            .then(data => {
                data.unit_dimension.forEach(unit_dimension => {
                    if(unit_dimension.code_en === unit_selected){
                        if(lang=='th'){
                            unit = unit_dimension.label_th;
                            document.getElementById("unit_bt").innerHTML= unit;
                        }else{
                            unit = unit_dimension.label_en;
                            document.getElementById("unit_bt").innerHTML= unit;
                        }
                    }
                });
            });
}
function change_standard(){
    var standard = document.getElementById("standard").value;
    var measurement = document.getElementById("measurement").value;
    if(measurement==="men_shoes" || measurement==="women_shoes"){
        first_column = standard;
        document.getElementById("first_column").value= first_column;
    }

}
function change_table_column(){
    table_column_text = document.getElementById("columns_value").value
    let table_column = table_column_text.split(",");
    let html = '<th class="border_header_start"><input class="input_first_column" id="first_column" type="text" value="SIZE"></th>';
    for (column_name of table_column) {
        column_name = column_name.toUpperCase();
        html +=  '<th class="border_header">'+column_name+'</th>';
    }
    // var SizeGuideFrame = document.getElementById("SizeGuideFrame");
    var sg_columns = document.getElementById("sg_columns");
    sg_columns.innerHTML = html;
    change_lang();
    change_table_row()
}
function change_chart_name(){
    chart_name = document.getElementById("chart_name").value
    // var SizeGuideFrame = document.getElementById("SizeGuideFrameDiv");
    var sg_chart_name = document.getElementById("sg_chart_name");
    sg_chart_name.innerHTML = chart_name.toUpperCase();
}
function change_table_row(){
    table_row_text = document.getElementById("row_value").value
    column_value = document.getElementById("columns_value").value
    unit_dimension = document.getElementById("unit_dimension").value
    count_column = column_value.split(",").length;
    let table_row = table_row_text.split(",");
    html= '';
    var x= 0;
    for (row of table_row) {
        row = row.toUpperCase();
        td='';
        for (let i = 0; i < count_column; i++) {
            if(i==0 && x==0){
                td += '<td><span class="unit_bt" id="unit_bt">'+unit_dimension+'</span><input class="input_size" type="text" value="00"></td>';
            }else{
                td += '<td><input  class="input_size" type="text" value="00"></td>';
            }
        }
        html +=  '<tr><td class="col"><input class="input_size_bold" type="text" value="'+row+'"></td>'+td+'</tr>';
        x++;
    }
    // var SizeGuideFrame = document.getElementById("SizeGuideFrame");
    var sg_row = document.getElementById("sg_row");
    sg_row.innerHTML = html+'<tr class="line_bottom"></tr>';
}
function change_lang(){
    var lang = document.getElementById("lang").value;
    var standard = document.getElementById("standard").value;
    var measurement = document.getElementById("measurement").value;
    // change measurement
    if(measurement=='men_shoes' || measurement=='women_shoes' || measurement=='baby_shoes'){
        first_column = standard;
    }else if(measurement=='girl_bra' || measurement=='women_bra'){
        if(lang=="th"){
            first_column = "คัพ";
        }else{
            first_column = "CUP";
        }
    }
    else if(measurement=='baby_clothing'){
        if(lang=="th"){
            first_column = "เดือน";
        }else{
            first_column = "MONTH";
        }
    }else{
        if(lang=="th"){
            first_column = "ขนาด";
        }else{
            first_column = "SIZE";
        }
    }
    //change unit dimension



    document.getElementById("first_column").value = first_column;
    change_image_measurement();
    change_unit_dimension();
    suggestion_chart_name();
}
// end change size guide table ----
$.get('./page/tools/template/sizeguide_template.html', function(data) {
    // Find the element you want to insert the HTML into
    let container = $("#SizeGuideFrameDiv");
    // Insert the HTML into the element
    container.html(data);
});



function add_image_metadata(image){
    const Exif = require('exif-js');
     // Get the image element
    // const image = document.getElementById(imageId);
    chart_name = document.getElementById("chart_name").value

    // Read the image's EXIF data
    Exif.getData(image, function() {
    // Update the image's metadata
    Exif.getAllTags(this).Title = chart_name;
    Exif.getAllTags(this).Subject = 'CDS-SizeGuide';
    Exif.getAllTags(this).Rating = 5;
    Exif.getAllTags(this).Tags = ['Size Guide', 'Central Online'];
    Exif.getAllTags(this).Comments = 'central.co.th';
    Exif.getAllTags(this).Authors = 'SizeGuide Generator';
    Exif.getAllTags(this).DateTaken = '2022-01-01T12:00:00';
    Exif.getAllTags(this).ProgramName = 'LinesheetApp';
    Exif.getAllTags(this).DateAcquired = '2022-01-01T12:00:00';
    Exif.getAllTags(this).Copyright = 'Copyright © Central Online operated by Central Department Store Limited Head Office';
    Exif.getAllTags(this).ImageID = 'Unknow';
    Exif.getAllTags(this).OfflineStatus = 'Ready to use';
    Exif.getAllTags(this).Owner = 'Central Online - operated by Central Department Store Limited Head Office';

    // Write the updated EXIF data back to the image
    Exif.setData(this, function() {
        console.log('Image metadata updated successfully!');
    });
    });
}

var domtoimage = require('dom-to-image');
document.getElementById("download_as_jpg").addEventListener("click", function() {
    chart_name = document.getElementById("chart_name").value
    domtoimage.toJpeg(document.getElementById('SizeGuideFrameDiv'))
    .then(function (dataUrl) {
        var link = document.createElement('a');
        link.download = chart_name+' size guide.jpg';
        link.href = dataUrl;
        link.click();
    })
    .catch(function (error) {
        console.error('oops, something went wrong!', error);
    });
});




