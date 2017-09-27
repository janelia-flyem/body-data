// Namespace with helpful variables and functions for the body explorer
var bodyExplorer = {

   jquery: 'static/components/jquery/dist/jquery.min.js',

   // gallery only
   galleryUrlBase: 'http://emdata1:8700/api/node/',
   galleryUrlXY: '/grayscale/isotropic/0_1/256_256/',
   galleryUrlXZ: '/grayscale/isotropic/0_2/256_256/',
   galleryUrlYZ: '/grayscale/isotropic/1_2/256_256/',

   // table only
   sharkUrl: 'http://emdata1:8700/api/node/18979088f9d248d6ac428df4cea022fe/pb26-27-2-trm-eroded32_ffn-20170216-2_celis_cx2-2048_r10_0_seeded_64blksz_vol_skeletons',

   // custom scripts
   galleryJS: 'static/js/gallery.js',

   openGallery: function() {
      var checked = {
         xy: true,
         xz: false,
         yz: false
      };
      table_ns.open_image_gallery(checked);
   },

   requestData: function() {

      zip.workerScriptsPath = '/static/components/zip-js/WebContent/';
      var val = document.getElementById("uuid-input").value;
      if (val && (val != '')){
         var url = 'http://emdata1:8700/api/node/<uuid>/bodyannotations/key/cx_body_status';
         url = url.replace(/<uuid>/g, val);
         var swcRequest = new Request(url, {method: 'GET'});

         fetch(swcRequest)
               .then(function (resp) {
                        if (resp.status == '200') {
                           return resp.blob();
                        }
                        else {
                           table_ns.add_error_element("Please enter a valid UUID to request body annotation data.");
                        }
                     }
               ).then (
               function (blob) {
                  if (blob) {
                     var data = pako.inflate(blob);

                     // Convert gunzipped byteArray back to ascii string:
                     var strData = String.fromCharCode.apply(null, new Uint16Array(data));

                     // Output to console
                     console.log(strData);
                  }
               }
         );
         console.log(url);
      }
      else {
         table_ns.add_error_element("Please enter an UUID.");
      }
   },

   hideColumn: function() {
      var hideElement = $('#data-table').DataTable().columns(1);
      var toggle = hideElement.visible();
      hideElement.visible(!(toggle[0]));
   },

   toggleOptions: function() {
      $('#table-options-content').css();
   },

   safeString: function(string) {
      return string.replace(' ','-');
   }
};