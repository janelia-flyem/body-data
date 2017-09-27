/*
 * Create gallery of body images for the filtered list of body IDs defined in the body table
 */
var gallery_ns = {

   bodyMatrix: null,

   tableElem: null,

   toggleCellDisplay: function (row, metarow, metacol) {
      $(this.tableElem).DataTable().cell(':eq(0)').focus();
   },

   /*
    * Create image gallery using Datatables
    */
   createGallery: function (bodyIds, checked) {
      var myWindow = window.open();
      var doc = myWindow.document;
      // doc.location.origin = window.location.origin;
      // myWindow.history.replaceState({}, document.title, window.location.href);
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
      // if (location.includes('/bodyannotations/')){
      //    location = location.replace('/bodyannotations/','');
      // }

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

      var scripts = new Array();
      scripts.push(bodyExplorer.galleryJS);
      scripts.push(bodyExplorer.jquery);
      for (var j = 0; j < scripts.length; j++) {
         var script = doc.createElement('script');
         script.src = location + scripts[j];
         doc.head.appendChild(script);
      }

      // Create gallery container
      var row = doc.createElement('div');
      row.classList.add('row');
      var container = doc.createElement('div');
      container.appendChild(row);
      this.tableElem = doc.createElement('table');
      this.tableElem.id = 'gallery-table';
      this.tableElem.classList.add('table', 'table-striped');
      row.appendChild(this.tableElem);
      doc.body.append(container);

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
               title: 'Body ID',
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
                  class: 'column-xy',
                  title: 'XY',
                  visible: true,
                  width: '25%',
                  data: null,
                  render: function (data, type, row, meta) {
                     if (row.showxy) {
                        if (table_data.data[meta.row]) {
                           var offset = (table_data.data[meta.row]['dvid coord']).replace(/\,/g, '_');
                           var url = bodyExplorer.galleryUrlBase + bodyExplorer.uuid + bodyExplorer.galleryUrlXY + offset;
                           return '<img alt="N/A" class="body-image" src="' + url + '"/></img>';
                        }
                     }
                     return '';
                  }
               }
         );

         gallery_columns.push({
                  title: 'XZ',
                  visible: true,
                  width: '25%',
                  data: null,
                  render: function (data, type, row, meta) {
                     if (row.showxz) {
                        if (table_data.data[meta.row]) {
                           var offset = (table_data.data[meta.row]['dvid coord']).replace(/\,/g, '_');
                           var url = bodyExplorer.galleryUrlBase + bodyExplorer.uuid + bodyExplorer.galleryUrlXZ + offset;
                           return '<img alt="N/A" class="body-image" src="' + url + '"/></img>';
                        }
                     }
                     return '';
                  }
               }
         );

         gallery_columns.push({

                  class: 'column-yz',
                  title: 'YZ',
                  visible: true,
                  width: '25%',
                  data: null,
                  render: function (data, type, row, meta) {
                     if (row.showyz) {
                        if (table_data.data[meta.row]) {
                           var offset = (table_data.data[meta.row]['dvid coord']).replace(/\,/g, '_');
                           var url = bodyExplorer.galleryUrlBase + bodyExplorer.uuid + bodyExplorer.galleryUrlYZ + offset;
                           return '<img alt="N/A" class="body-image" src="' + url + '"/></img>';
                        }
                     }
                     return '';
                  }
               }
         );

         $(this.tableElem).DataTable({
               autoWidth: false,
               data: gallery_ns.bodyMatrix,
               pageLength: 50,
               width: '500px',
               columns: gallery_columns
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

      }).bind(this))
   }
};