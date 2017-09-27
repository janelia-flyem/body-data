/**
 * Functions used to create table of body information
 */
var table_ns = {

   //Show an error string which disappears on its own
   add_error_element: function (errormsg) {
      $('body').prepend('<div id="error-msg">' + errormsg + '</div>');
      setTimeout(function(){
         $('#error-msg').remove();
      }, 2000);
   },

   generate_url_neuroglancer: function (row) {
      var segmentId = 137144;
      var url = "http://<server>/neuroglancer/#!" +
          "{'layers':" +
          "{'<layer>':" +
          "{'type':'image'_'source':'dvid://http://<server>/<uuid>/<layer>'}_'pb26-27-2-trm-eroded32_ffn-20170216-2_celis_cx2-2048_r10_0_seeded_64blksz':" +
          "{'type':'segmentation'_'source':'dvid://http://<server>/<uuid>/pb26-27-2-trm-eroded32_ffn-20170216-2_celis_cx2-2048_r10_0_seeded_64blksz'}" +
          "}_'navigation':" +
          "{'pose':" +
          "{'position':" +
          "{'voxelSize':[8_8_8]_'voxelCoordinates':[<dvid_coord>]}" +
          "}_'zoomFactor':8" +
          "}_'perspectiveOrientation':[-0.12320887297391891_0.2175416201353073_-0.00949245784431696_0.9681968092918396]_'perspectiveZoom':64" +
          "_'segments': <segments> }";

      url = url.replace(/<layer>/g, table_data.metadata.grayscale);
      url = url.replace(/<server>/g, table_data.metadata['dvid server']);
      url = url.replace(/<uuid>/g, table_data.metadata['dvid uuid']);
      url = url.replace(/<dvid_coord>/g, row['dvid coord']);
      url = url.replace(/<segmentation>/g, table_data.metadata['segmentation']);
      url = url.replace(/<segments>/g, segmentId);

      var link = "<a target=\"_blank\" class=\"neuroglancer-icon glyphicon glyphicon-picture\" href=\"" + url + "\">" +
          "</a>";
      return link;
   },

   getSharkviewerUrl: function(bodyId) {
      var url_datainstance = bodyExplorer.sharkUrl;
      return url_datainstance + '/key/' + bodyId + '_swc';
   },

   showShark: false,

   generateSharkRequest: function(bodyId) {
         // Test if currently there is a shark displayed
         if (!table_ns.showShark) {
            var url = table_ns.getSharkviewerUrl(bodyId);
            var swcRequest = new Request(url, {method: 'GET'});

            fetch(swcRequest)
                .then(function (resp) {
                       if (resp.status == '200') {
                          return resp.text();
                       }
                       else {
                          table_ns.add_error_element("No SharkView for this body available, sorry!");
                       }
                    }
                ).then (
                function (data) {
                   if (data) {
                      // Just do it two times
                      $('#shark-container-bbox').css('display', 'block');
                      $('#shark-container').css('display', 'block');
                      var swc = swc_parser(data);
                      var s = new SharkViewer({
                           swc: swc,
                           dom_element: 'shark-container',
                           center_shape: true,
                           center_coords: true,
                           coords_dom_element: 'shark-coords',
                           draw_coords: true,
                           coords_width: 80,
                           coords_height: 80,
                           WIDTH: window.innerWidth / 1.5,
                           HEIGHT: window.innerHeight / 1.5
                      });
                      s.init();
                      s.animate();
                      table_ns.showShark = true;
                   }
                }
            );
         } else { //If there is a Shark visible, empty the DOM elements
            $('#shark-container').empty();
            $('#shark-coords').empty();
            table_ns.showShark = false;
            table_ns.generateSharkRequest(bodyId);
         }
   },

   hide_shark: function () {
      $('#shark-container').empty();
      $('#shark-coords').empty();
      $('#shark-container-bbox').css('display', 'none');
      table_ns.showShark = false;
   },

   get_filtered_ids: function () {
      var data = $('#data-table').DataTable().rows({filter: 'applied'}).data();
      var length = $('#data-table').DataTable().rows({filter: 'applied'}).nodes().length;

      var bodyIds = [];
      var col = 'body ID';

      for (var i = 0; i < data.length; i++) {
         bodyIds.push(data[i][col]);
      }
      return bodyIds;
   },

   selected_bodyIds: null,

   open_image_gallery: function (checked) {
      selected_bodyIds = table_ns.get_filtered_ids();
      gallery_ns.createGallery(selected_bodyIds, checked);
   },

   resetFilter: function (){
      $('#show-name').prop('checked', false);
      table_ns.showNamesOnly = false;

      $('.body-search').val('');

      var table = $('#data-table').DataTable({
         retrieve: true
      });
      table.draw();
   },

   showNamesOnly: null,

   bodyIds: null,

   updateSearch: function(){
      var table = $('#data-table').DataTable();
      table.search(this.value,
            $('#global_regex').prop('checked'),
            $('#global_smart').prop('checked')
      );
      table.draw();
   }
};


$(document).ready(function () {
   var currRow = null;

   // Add simple search field
   $('#data-table tfoot th.default').each(function () {
      var title = $(this).text();
      var name = this.getAttribute('name');

      $(this).html('<input class="text-search body-search" name="' + name + '" type="text" title="Use \'/\' to search with regex" placeholder="Search ' + title + '" />');
   });

   // Add simple search but number field for the body ID
   $('#data-table tfoot th.default-num').each(function () {
      var title = $(this).text();
      var name = this.getAttribute('name');

      $(this).html('<input class="text-search body-search" name="' + name + '" type="number" placeholder="Search ' + title + '" />');
   });

   // Add Min / Max input fields
   $('#data-table tfoot th.number').each(function () {
      var name = this.getAttribute('name');
      $(this).html('<div class="minmax">' +
          '<input placeholder=\"Min\" type="number" id="min' + name + '" class="min table-search body-search" name="' + name + '">' +
          '<input placeholder=\"Max\" type="number" id="max' + name + '" class="max table-search body-search" name="' + name + '">' +
          '</div>'
      );
   });

   // Add checkbox to filter for named bodies only
   $("th.default[name='1']").append('<div class="checkbox"><label><input id="show-name" class="body-search" type="checkbox" value="">Named bodies only</label></div>');

   if (table_data) {

      var table = $('#data-table').DataTable({
         responsive: true,
         autoWidth: false,
         data: table_data.data,
         pageLength: 10,
         columns: [{
            className: "bodyId text",
            title: 'Body ID',
            name: 'id',
            data: 'body ID',
            width: '3%'
         },
         {
            title: 'Name',
            data: 'name',
            name: 'nane',
            width: '10%',
            className: "text",
            render: function (data, type, row, meta) {
               return row.name ? row.name : '';
            }
         },
         {
            title: 'Status',
            data: 'status',
            name: 'status',
            className: "text",
            render: function (data, type, row, meta) {
               return row.status ? row.status : '';
            },
            width: '6%'
         },
         {
            title: 'PreSyn',
            data: 'PreSyn',
            name: 'presyn',
            type: 'num',
            width: '6%',
            className: "number"
         },
         {
            title: 'PostSyn',
            data: 'PostSyn',
            name: 'postsyn',
            type: 'num',
            width: '6%',
            className: "number"
         },
         {
            title: 'Assigned',
            data: 'assigned',
            name: 'assigned',
            className: "text",
            render: function (data, type, row, meta) {
               return row.assigned ? row.assigned : '';
            },
            width: '6%'
         },
         {
            title: 'User',
            data: 'user',
            name: 'user',
            className: "text",
            render: function (data, type, row, meta) {
               return row.user ? row.user : '';
            },
            width: '6%'
         },
         {
            title: 'Size',
            data: 'size',
            type: 'num',
            name: 'size',
            className: "number",
            render: function (data, type, row, meta) {

               return row.size ? row.size : '';
            },
            width: '5%'
         },
         {
            title: 'Comment',
            data: 'comment',
            name: 'comment',
            width: '15%',
            className: "text",
            render: function (data, type, row, meta) {
               return row.comment ? row.comment : '';
            }
         },
         {
            className: "shark",
            name: 'shark',
            orderable: false,
            render: function (data, type, row, meta) {
               var ng = table_ns.generate_url_neuroglancer(row);
               var bId = row['body ID'];
               var sharkLink = '<a onclick="table_ns.generateSharkRequest(' + bId + ')") ><img class="shark-logo" src="' + bodyExplorer.sharklogo + '" /> </a>';
               var sharkImg = '<img src="/static/files/shark.png" class="shark-logo" onclick="table_ns.generateSharkRequest(' + bId + ')") \>';
               return ng + sharkLink;
            },
            width: '5%'
         }]
      });
   }

   var mins = document.getElementsByClassName('min');
   var maxs = document.getElementsByClassName('max');

   // Custom filtering function which will search data in column four between two values
   $.fn.dataTable.ext.search.push (
       function (settings, data, dataIndex, myobject, row) {

          if (settings.nTable.id === 'gallery-table') {
             return true;
          }
          // check if showNamesOnly is checked
          if (table_ns.showNamesOnly && data[1] == "") {
             return false;
          }

          var result = true;
          for (var i = 0; i < mins.length; i++) {
             var min = mins[i].value;
             var max = maxs[i].value;

             var value = parseInt(data[mins[i].name], 10); // use data for the age column

             if (isNaN(min) || min === "" || min === undefined) {
                min = -Infinity;
             }
             if (isNaN(max) || max === "" || max === undefined) {
                max = Infinity;
             }
             result = result && (min <= value && value <= max);
          }

          return result;
       }
   );


   // Search functionality for text input fields
   if (table) {
      table.columns('.text').every(
            function () {
               var column = this;
               $('input', this.footer()).on('keyup change', function (key) {
                  if (this.value.startsWith('/')) {
                     column.search(this.value.substr(1),
                           true, // regex search
                           false // no smart search
                     ).draw();
                  }
                  else {
                     column.search(this.value,
                           false, // no regex search
                           true // but smart search
                     ).draw();
                  }
               });
            });

      // Search functionality for the two range filtering inputs to redraw on input
      $('.min, .max').keyup(function () {
         table.draw();
      });

      // If checked, filter for named bodies only
      $('#show-name').change(function () {
         table_ns.showNamesOnly = this.checked;
         table.draw();
      });
   }
});

/*
 * Make sure shark container stays at the top when scrolling because of a big table
 */
window.onscroll = function() {
   $('#shark-container-bbox').css('top', window.scrollY);
};

