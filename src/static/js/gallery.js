/*
 * Create gallery of body images for the filtered list of body IDs defined in the body table
 */
var n_gallery = {

   bodyMatrix: null,

   tableElem: null,

   // Create image gallery using Datatables
   createGallery: function (bodyIds, checked) {
      var myWindow = window.open();
      var doc = myWindow.document;

      // Set heading
      var head = doc.createElement('h3');
      head.appendChild(doc.createTextNode('Body Gallery'));
      head.style = 'margin-top: 20px';

      var headRow = doc.createElement('div');
      headRow.classList.add('row');
      headRow.appendChild(head);
      doc.body.append(headRow);

      var csses = new Array();
      csses.push(bodyExplorer.datatableCSS);
      csses.push(bodyExplorer.bootstrapCSS);
      csses.push(bodyExplorer.customCSS);

      var location = window.location.origin;

      if (location[location.length - 1] == '/') {
         location = location.substr(0, location.length - 1);
      }

      // Add stylesheets to gallery
      for (var i = 0; i < csses.length; i++) {
         var link = doc.createElement('link');
         link.rel = 'stylesheet';
         link.type = 'text/css';
         link.href = location + csses[i];
         doc.head.appendChild(link)
      }

      // Create gallery container
      var row = doc.createElement('div');
      row.classList.add('row');
      var galleryContainer = doc.createElement('div');
      galleryContainer.appendChild(row);
      this.tableElem = doc.createElement('table');
      this.tableElem.id = 'gallery-table';
      this.tableElem.classList.add('table', 'table-striped');

      var galleryHeader = ['Body ID', 'XY', 'XZ', 'YZ'];
      var tHead = doc.createElement('thead');
      var tRow = doc.createElement('tr');
      for (var j = 0; j < galleryHeader.length; j++){
         var th = doc.createElement('th');
         var label = doc.createElement('label');
         if (j > 0){
            var input = doc.createElement('input');
            input.type = "checkbox";
            input.id = 'col-' + galleryHeader[j];
            label.appendChild(input);
         }
         label.append(galleryHeader[j]);
         th.append(label);
         tRow.appendChild(th);
      }
      tHead.appendChild(tRow);
      this.tableElem.appendChild(tHead);
      row.appendChild(this.tableElem);
      doc.body.appendChild(galleryContainer);

      // Set Datatable
      $(doc).ready((function () {
         // Initialize DataTable
         this.bodyMatrix = bodyIds.map(function (elem) {
            return {
               bodyId: elem,
               showxy: false,
               showyz: false,
               showxz: false
            };
         });

         var gallery_columns = [
            {
               width: '8%',
               data: 'bodyId',
               render: function (data, type, row, meta) {
                  if (row) {
                     var checkedxy = row.showxy ? ' checked ' : '';
                     var checkedxz = row.showxz ? ' checked ' : '';
                     var checkedyz = row.showyz ? ' checked ' : '';

                     var checkboxes = '<label><input data-view="xy" type=\'checkbox\'' + checkedxy + '/>XY</label>';
                     checkboxes += '<br/><label><input data-view="xz" type=\'checkbox\'' + checkedxz + '/>XZ</label>';
                     checkboxes += '<br/><label><input data-view="yz" type=\'checkbox\'' + checkedyz + '/>YZ</label>';

                     var result = row.bodyId + '<br/><br/>' + checkboxes;
                     return result;
                  }
               }
            }
         ];

         // Build columns object dependent on checkboxes checked
         gallery_columns.push({
                  visible: true,
                  width: '25%',
                  data: null,
                  class: 'column-xy',
                  render: function (data, type, row, meta) {
                     if (row.showxy) {
                        if (table_data.data[meta.row]) {
                           var offset = (table_data.data[meta.row]['dvid coord']).replace(/\,/g, '_');
                           var url = bodyExplorer.galleryUrlBase + bodyExplorer.uuid + bodyExplorer.galleryUrlXY + offset;
                           return '<img alt="'+ offset +'" class="body-image" src="' + url + '"/></img>';
                        }
                     }
                     return '';
                  }
               }
         );

         gallery_columns.push({
                  visible: true,
                  width: '25%',
                  data: null,
                  class: 'column-xz',
                  render: function (data, type, row, meta) {
                     if (row.showxz) {
                        if (table_data.data[meta.row]) {
                           var offset = (table_data.data[meta.row]['dvid coord']).replace(/\,/g, '_');
                           var url = bodyExplorer.galleryUrlBase + bodyExplorer.uuid + bodyExplorer.galleryUrlXZ + offset;
                           return '<img alt="'+ offset +'" class="body-image" src="' + url + '"/></img>';
                        }
                     }
                     return '';
                  }
               }
         );

         gallery_columns.push({
                  visible: true,
                  width: '25%',
                  data: null,
                  class: 'column-yz',
                  render: function (data, type, row, meta) {
                     if (row.showyz) {
                        if (table_data.data[meta.row]) {
                           var offset = (table_data.data[meta.row]['dvid coord']).replace(/\,/g, '_');
                           var url = bodyExplorer.galleryUrlBase + bodyExplorer.uuid + bodyExplorer.galleryUrlYZ + offset;
                           return '<img alt="'+ offset +'" class="body-image" src="' + url + '"/></img>';
                        }
                     }
                     return '';
                  }
               }
         );

         $(this.tableElem).DataTable({
               autoWidth: false,
               data: n_gallery.bodyMatrix,
               pageLength: 50,
               width: '500px',
               columns: gallery_columns,
               responsive: true
            }).on('change', 'input[data-view]', this.tableElem, function (e) {
               var tr = this.closest('tr');
               var dt = $(e.data).DataTable().row(tr);
               var data = dt.data();
               if (this.dataset.view === "xy") {
                  data.showxy = this.checked;
               }
               else if (this.dataset.view === "xz") {
                  data.showxz = this.checked;
               }
               else if (this.dataset.view === "yz") {
                  data.showyz = this.checked;
               }
               dt.invalidate();
            })

      }).bind(this));

      var scripts = new Array();
      // scripts.push(bodyExplorer.galleryJS);
      scripts.push(bodyExplorer.galleryTransformations);
      scripts.push(bodyExplorer.jquery);
      scripts.push(bodyExplorer.dataTablesJS);

      for (var j = 0; j < scripts.length; j++) {
         var script = doc.createElement('script');
         script.src = location + '/' + scripts[j];
         doc.head.appendChild(script);
      }

      $('#col-XY',doc).on('click', function(){
         // n_gallery.bodyMatrix.map(function (elem){
         //    elem.showxy = this.checked;
         // }, this);
         var tbl = $('#gallery-table',doc).DataTable();
         var dArray = tbl.rows().data();
         for (var i = 0, max = dArray.length; i < max; i++) {
            dArray[i].showxy = this.checked;
         }
         tbl.rows().invalidate().draw();
      });

      $('#col-XZ',doc).on('click', function(){
         // n_gallery.bodyMatrix.map(function (elem){
         //    elem.showxz = this.checked;
         // }, this);
         var tbl = $('#gallery-table',doc).DataTable();
         var dArray = tbl.rows().data();
         for (var i = 0, max = dArray.length; i < max; i++) {
            dArray[i].showxz = this.checked;
         }
         tbl.rows().invalidate().draw();
      });

      $('#col-YZ',doc).on('click', function(){
         var tbl = $('#gallery-table',doc).DataTable();
         var dArray = tbl.rows().data();
         for (var i = 0, max = dArray.length; i < max; i++) {
            dArray[i].showyz = this.checked;
         }
         // tbl.rows().data().forEach(function(elem){
         //    elem.showyz = this.checked;
         // }, this);
         // n_gallery.bodyMatrix.map(function (elem){
         //    elem.showyz = this.checked;
         // }, this);
         tbl.rows().invalidate().draw();
      });
   }
};