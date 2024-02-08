

    document.getElementById("dimension_width_list").style.display = "block";
    document.getElementById("dimension_height_list").style.display = "none";
    document.getElementById("dimension_depth_list").style.display = "none";
    document.getElementById("dimension_waistlength_list").style.display = "block";
    document.getElementById("dimension_beltlength_list").style.display = "block";
    document.getElementById("dimension_length_list").style.display = "none";
    document.getElementById("dimension_handleheight_list").style.display = "none";
    document.getElementById("dimension_diameter_list").style.display = "none";
    document.getElementById("dimension_shoulderstrap_list").style.display = "none";
    document.getElementById("dimension_frameheight_list").style.display = "none";
    document.getElementById("dimension_framewidth_list").style.display = "none";
    document.getElementById("dimension_lensheight_list").style.display = "none";
    document.getElementById("dimension_lenswidth_list").style.display = "none";
    document.getElementById("dimension_bridgesize_list").style.display = "none";
    document.getElementById("dimension_templearms_list").style.display = "none";




// {/* <script src="https://cdnjs.cloudflare.com/ajax/libs/jquery/3.5.1/jquery.min.js"></script> */}

    //get dropdown list
    function get_option_list_dimension() {
        fetch("./config.json")
            .then((response) => response.json())
            .then((data) => {
                let options = "";
                data.dimension.forEach((dimension) => {
                    options += `<option value='${dimension.code}'>${dimension.label}</option>`;
                });
                document.getElementById("dimension").innerHTML = options;
            });
    }
    function get_option_list_unit_dimension() {
        var lang = document.getElementById("lang").value;
        fetch("./config.json")
            .then((response) => response.json())
            .then((data) => {
                let options = "";
                data.unit_dimension.forEach((unit_dimension) => {
                    if (lang == "th") {
                        options += `<option value='${unit_dimension.code_th}'>${unit_dimension.label_th}</option>`;
                    } else {
                        options += `<option value='${unit_dimension.code_en}'>${unit_dimension.label_en}</option>`;
                    }
                });
                document.getElementById("unit_dimension").innerHTML = options;
            });
    }

    function get_option_list_lang() {
        fetch("./config.json")
            .then((response) => response.json())
            .then((data) => {
                let options = "";
                data.lang.forEach((lang) => {
                    options += `<option value='${lang.code}'>${lang.label}</option>`;
                });
                document.getElementById("lang").innerHTML = options;
            });
        // get_option_list_unit_dimension();
    }
    function suggestion_chart_name() {
        var use_default_chart_name = document.getElementById("use_default_chart_name");
        if (use_default_chart_name.checked == true) {
            var lang = document.getElementById("lang").value;
            var dimension_image_selected = document.getElementById("dimension").value;
            var current_chart_name = document.getElementById("chart_name").value;
            // get_suggestion_chart_name
            fetch("./config.json")
                .then((response) => response.json())
                .then((data) => {
                    data.dimension.forEach((dimension) => {
                        if (dimension.code === dimension_image_selected) {
                            if (lang == "th") {
                                suggestion_chart_name_value = dimension.chart_name_th;
                                sg_chart_name.innerHTML = suggestion_chart_name_value;
                                document.getElementById("chart_name").value =
                                    suggestion_chart_name_value;
                            } else {
                                suggestion_chart_name_value = dimension.chart_name_en;
                                sg_chart_name.innerHTML = suggestion_chart_name_value;
                                document.getElementById("chart_name").value =
                                    suggestion_chart_name_value;
                            }
                        }
                    });
                });

            var sg_chart_name = document.getElementById("sg_chart_name");
        }
    }
    function change_use_default_chart_name() {
        var use_default_chart_name = document.getElementById(
            "use_default_chart_name"
        );
        var chart_name = document.getElementById("chart_name");
        if (use_default_chart_name.checked == true) {
            chart_name.disabled = true;
        } else {
            chart_name.disabled = false;
            suggestion_chart_name();
        }
    }

    get_option_list_dimension();
    get_option_list_unit_dimension();
    get_option_list_lang();

    // change image dimension ----
    function change_image_dimension() {
        var dimension = document.getElementById("dimension").value;
        var lang = document.getElementById("lang").value;
        document.getElementById("dimension_image").src = "./image/dimension/" + dimension + "_" + lang + "/" + dimension + "_" + lang + "-2.png";

        document.getElementById("first_column").value = first_column;
        suggestion_chart_name();
        change_hide_list();
        change_css();
    }

// hide list label
    function change_hide_list() {
        var total_list = ["dimension_width_list",
            "dimension_height_list",
            "dimension_depth_list",
            "dimension_waistlength_list",
            "dimension_beltlength_list",
            "dimension_length_list",
            "dimension_handleheight_list",
            "dimension_diameter_list",
            "dimension_shoulderstrap_list",
            "dimension_frameheight_list",
            "dimension_framewidth_list",
            "dimension_lensheight_list",
            "dimension_lenswidth_list",
            "dimension_bridgesize_list",
            "dimension_templearms_list"
        ]
        var dimension_list_select = document.getElementById("dimension").value;
        fetch("./config.json")
            .then((response) => response.json())
            .then((data) => {
                data.dimension.forEach((dimension) => {
                    if (dimension.code === dimension_list_select) {
                        for (let i = 0; i < total_list.length; i++) {
                            if (dimension.dimension_list.includes(total_list[i])) {
                                var id_list = total_list[i];
                                document.getElementById(id_list).style.display = "block";
                            } else {
                                var id_list = total_list[i];
                                document.getElementById(id_list).style.display = "none";
                            }
                        }
                    }
                });
            });

    }


    function change_unit_dimension() {
        var lang = document.getElementById("lang").value;
        var unit_selected = document.getElementById("unit_dimension").value;

        fetch("./config.json")
            .then((response) => response.json())
            .then((data) => {
                data.unit_dimension.forEach((unit_dimension) => {
                    if (unit_dimension.code_en === unit_selected) {
                        if (lang == "th") {
                            unit = unit_dimension.label_th;
                            document.getElementById("unit_bt").innerHTML = unit;
                        } else {
                            unit = unit_dimension.label_en;
                            document.getElementById("unit_bt").innerHTML = unit;
                        }
                    }
                });
            });
        change_dimension();
    }

// concat dimension and unit dimension
    function change_dimension() {
        var width = document.getElementById("dimension_width").value;
        var height = document.getElementById("dimension_heigth").value;
        var depth = document.getElementById("dimension_depth").value;
        var waistlength = document.getElementById("dimension_waistlength").value;
        var beltlength = document.getElementById("dimension_beltlength").value;
        var length = document.getElementById("dimension_length").value;
        var handleheight = document.getElementById("dimension_handleheight").value;
        var shoulderstrap = document.getElementById("dimension_shoulderstrap").value;
        var diameter = document.getElementById("dimension_diameter").value;
        var frameheight = document.getElementById("dimension_frameheight").value;
        var framewidth = document.getElementById("dimension_framewidth").value;
        var lensheight = document.getElementById("dimension_lensheight").value;
        var lenswidth = document.getElementById("dimension_lenswidth").value;
        var bridgesize = document.getElementById("dimension_bridgesize").value;
        var templearms = document.getElementById("dimension_templearms").value;

        var unit = "";
        var lang = document.getElementById("lang").value;
        var unit_selected = document.getElementById("unit_dimension").value;
        fetch('./config.json')
            .then(response => response.json())
            .then(data => {
                data.unit_dimension.forEach(unit_dimension => {
                    if (unit_dimension.code_en === unit_selected) {
                        if (lang == 'th') {
                            unit = unit_dimension.label_th;
                        } else {
                            unit = unit_dimension.label_en;
                        }
                    }
                });
                var resultSpan = document.getElementById("show_width")
                resultSpan.innerHTML = width + " " + unit;
                var resultSpan = document.getElementById("show_height");
                resultSpan.innerHTML = height + " " + unit;
                var resultSpan = document.getElementById("show_depth");
                resultSpan.innerHTML = depth + " " + unit;
                var resultSpan = document.getElementById("show_waistlength");
                resultSpan.innerHTML = waistlength + " " + unit;
                var resultSpan = document.getElementById("show_beltlength");
                resultSpan.innerHTML = beltlength + " " + unit;
                var resultSpan = document.getElementById("show_length");
                resultSpan.innerHTML = length + " " + unit;
                var resultSpan = document.getElementById("show_handleheight");
                resultSpan.innerHTML = handleheight + " " + unit;
                var resultSpan = document.getElementById("show_shoulderstrap");
                resultSpan.innerHTML = shoulderstrap + " " + unit;
                var resultSpan = document.getElementById("show_diameter");
                resultSpan.innerHTML = diameter + " " + unit;
                var resultSpan = document.getElementById("show_frameheight");
                resultSpan.innerHTML = frameheight + " " + unit;
                var resultSpan = document.getElementById("show_framewidth");
                resultSpan.innerHTML = framewidth + " " + unit;
                var resultSpan = document.getElementById("show_lensheight");
                resultSpan.innerHTML = lensheight + " " + unit;
                var resultSpan = document.getElementById("show_lenswidth");
                resultSpan.innerHTML = lenswidth + " " + unit;
                var resultSpan = document.getElementById("show_bridgesize");
                resultSpan.innerHTML = bridgesize + " " + unit;
                var resultSpan = document.getElementById("show_templearms");
                resultSpan.innerHTML = templearms + " " + unit;
            });

    }

    // hide text span and create new css

    function change_css() {

        var dimension_list_select = document.getElementById("dimension").value;
        fetch('./config.json')
            .then(response => response.json())
            .then(data => {
                data.dimension.forEach((dimension) => {
                    if (dimension.code === dimension_list_select) {
                        document.getElementById("show_width").style.display = "none";
                        document.getElementById("show_height").style.display = "none";
                        document.getElementById("show_depth").style.display = "none";
                        document.getElementById("show_waistlength").style.display = "none";
                        document.getElementById("show_beltlength").style.display = "none";
                        document.getElementById("show_length").style.display = "none";
                        document.getElementById("show_handleheight").style.display = "none";
                        document.getElementById("show_shoulderstrap").style.display = "none";
                        document.getElementById("show_diameter").style.display = "none";
                        document.getElementById("show_frameheight").style.display = "none";
                        document.getElementById("show_framewidth").style.display = "none";
                        document.getElementById("show_lensheight").style.display = "none";
                        document.getElementById("show_lenswidth").style.display = "none";
                        document.getElementById("show_bridgesize").style.display = "none";
                        document.getElementById("show_templearms").style.display = "none";
                        for (var i = 0; i < dimension.dimensions.length; i++) {
                            const show_dimension_list = dimension.dimensions[i].id;
                            const show_dimension = document.getElementById(show_dimension_list);
                            if (show_dimension) {
                                show_dimension.style.marginTop = dimension.dimensions[i]['margin-top'];
                                show_dimension.style.position = dimension.dimensions[i].position;
                                show_dimension.style.right = dimension.dimensions[i].right;
                                show_dimension.style.display = "block";

                            }

                        }


                    }
                });
            });
    }

    function change_chart_name() {
        chart_name = document.getElementById("chart_name").value;
        // var SizeGuideFrame = document.getElementById("SizeGuideFrameDiv");
        var sg_chart_name = document.getElementById("sg_chart_name");
        sg_chart_name.innerHTML = chart_name.toUpperCase();
    }
    function change_table_row() {
        // span += '<span class="unit_bt" id="unit_bt">' + unit_dimension + '</span>';
        // span += '<span class="unit_bt" id="unit_bt">' + unit_dimension + '</span>';
    }
    function change_lang() {
        var lang = document.getElementById("lang").value;
        // var standard = document.getElementById("standard").value;
        var dimension = document.getElementById("dimension").value;

        //change unit dimension
        document.getElementById("first_column").value = first_column;
        change_image_dimension();
        change_unit_dimension();
        suggestion_chart_name();
    }
    // end change size guide table ----
    $.get("./page/tools/template/product_dimension_template.html", function (data) {
        // Find the element you want to insert the HTML into
        let container = $("#SizeGuideFrameDiv");
        // Insert the HTML into the element
        container.html(data);
    });

    function add_image_metadata(image) {
        const Exif = require("exif-js");
        // Get the image element
        // const image = document.getElementById(imageId);
        chart_name = document.getElementById("chart_name").value;

        // Read the image's EXIF data
        Exif.getData(image, function () {
            // Update the image's metadata
            Exif.getAllTags(this).Title = chart_name;
            Exif.getAllTags(this).Subject = "CDS-SizeGuide";
            Exif.getAllTags(this).Rating = 5;
            Exif.getAllTags(this).Tags = ["Size Guide", "Central Online"];
            Exif.getAllTags(this).Comments = "central.co.th";
            Exif.getAllTags(this).Authors = "SizeGuide Generator";
            Exif.getAllTags(this).DateTaken = "2022-01-01T12:00:00";
            Exif.getAllTags(this).ProgramName = "LinesheetApp";
            Exif.getAllTags(this).DateAcquired = "2022-01-01T12:00:00";
            Exif.getAllTags(this).Copyright =
                "Copyright © Central Online operated by Central Department Store Limited Head Office";
            Exif.getAllTags(this).ImageID = "Unknow";
            Exif.getAllTags(this).OfflineStatus = "Ready to use";
            Exif.getAllTags(this).Owner =
                "Central Online - operated by Central Department Store Limited Head Office";

            // Write the updated EXIF data back to the image
            Exif.setData(this, function () {
                console.log("Image metadata updated successfully!");
            });
        });
    }
    var domtoimage = require('dom-to-image');

    document
        .getElementById("download_as_jpg")
        .addEventListener("click", function () {
            chart_name = document.getElementById("chart_name").value;
            domtoimage
                .toJpeg(document.getElementById("SizeGuideFrameDiv"))
                .then(function (dataUrl) {
                    var link = document.createElement("a");
                    link.download = chart_name + " Product_dimension.jpg";
                    link.href = dataUrl;
                    link.click();
                })
                .catch(function (error) {
                    console.error("oops, something went wrong!", error);
                });
        });
