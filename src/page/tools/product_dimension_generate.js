
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
