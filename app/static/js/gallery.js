/*
 * Create gallery of body images for the filtered list of body IDs defined in the body table
 */
var n_gallery = {

  bodyMatrix: null,

  tableElem: null,

  // Create image gallery using Datatables
  createGallery(bodyIds, checked) {
    const myWindow = window.open();
    const doc = myWindow.document;

    // Set heading
    const head = doc.createElement('h3');
    head.appendChild(doc.createTextNode('Body Gallery'));
    head.style = 'margin-top: 20px';

    const headRow = doc.createElement('div');
    headRow.classList.add('row');
    headRow.appendChild(head);
    doc.body.append(headRow);

    const csses = new Array();
    csses.push(bodyExplorer.datatableCSS);
    csses.push(bodyExplorer.bootstrapCSS);
    csses.push(bodyExplorer.customCSS);

    let location = window.origin + bodyExplorer.myRoot;

    // Add stylesheets to gallery
    for (let i = 0; i < csses.length; i++) {
      const link = doc.createElement('link');
      link.rel = 'stylesheet';
      link.type = 'text/css';
      link.href = location + csses[i];
      doc.head.appendChild(link);
    }

    // Create gallery container
    const row = doc.createElement('div');
    row.classList.add('row');
    const galleryContainer = doc.createElement('div');
    galleryContainer.appendChild(row);
    this.tableElem = doc.createElement('table');
    this.tableElem.id = 'gallery-table';
    this.tableElem.classList.add('table', 'table-striped');

    const galleryHeader = ['Body ID', 'XY', 'XZ', 'YZ'];
    const tHead = doc.createElement('thead');
    const tRow = doc.createElement('tr');
    for (var j = 0; j < galleryHeader.length; j++) {
      const th = doc.createElement('th');
      const label = doc.createElement('label');
      if (j > 0) {
        const input = doc.createElement('input');
        input.type = 'checkbox';
        input.id = `col-${galleryHeader[j]}`;
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
    $(doc).ready(() => {
      // Initialize DataTable
      this.bodyMatrix = bodyIds.map(elem => ({
        bodyId: elem,
        showxy: false,
        showyz: false,
        showxz: false,
      }));

      const gallery_columns = [
        {
          width: '8%',
          data: 'bodyId',
          render(data, type, row, meta) {
            if (row) {
              const checkedxy = row.showxy ? ' checked ' : '';
              const checkedxz = row.showxz ? ' checked ' : '';
              const checkedyz = row.showyz ? ' checked ' : '';

              let checkboxes = `<label><input data-view="xy" type='checkbox'${checkedxy}/>XY</label>`;
              checkboxes += `<br/><label><input data-view="xz" type='checkbox'${checkedxz}/>XZ</label>`;
              checkboxes += `<br/><label><input data-view="yz" type='checkbox'${checkedyz}/>YZ</label>`;

              const result = `${row.bodyId}<br/><br/>${checkboxes}`;
              return result;
            }
          },
        },
      ];

      // Build columns object dependent on checkboxes checked
      gallery_columns.push({
        visible: true,
        width: '25%',
        data: null,
        class: 'column-xy',
        render(data, type, row, meta) {
          if (row.showxy) {
            if (table_data.data[meta.row]) {
              const offset = (table_data.data[meta.row]['dvid coord']).replace(/\,/g, '_');
              const url = bodyExplorer.galleryUrlBase + bodyExplorer.uuid + bodyExplorer.galleryUrlXY + offset;
              return `<img alt="" class="body-image" src="${url}"/></img>`;
            }
          }
          return '';
        },
      });

      gallery_columns.push({
        visible: true,
        width: '25%',
        data: null,
        class: 'column-xz',
        render(data, type, row, meta) {
          if (row.showxz) {
            if (table_data.data[meta.row]) {
              const offset = (table_data.data[meta.row]['dvid coord']).replace(/\,/g, '_');
              const url = bodyExplorer.galleryUrlBase + bodyExplorer.uuid + bodyExplorer.galleryUrlXZ + offset;
              return `<img alt="" class="body-image" src="${url}"/></img>`;
            }
          }
          return '';
        },
      });

      gallery_columns.push({
        visible: true,
        width: '25%',
        data: null,
        class: 'column-yz',
        render(data, type, row, meta) {
          if (row.showyz) {
            if (table_data.data[meta.row]) {
              const offset = (table_data.data[meta.row]['dvid coord']).replace(/\,/g, '_');
              const url = bodyExplorer.galleryUrlBase + bodyExplorer.uuid + bodyExplorer.galleryUrlYZ + offset;
              return `<img alt="" class="body-image" src="${url}"/></img>`;
            }
          }
          return '';
        },
      });

      $(this.tableElem).DataTable({
        autoWidth: false,
        data: n_gallery.bodyMatrix,
        pageLength: 50,
        width: '500px',
        columns: gallery_columns,
        responsive: true,
      }).on('change', 'input[data-view]', this.tableElem, function (e) {
        const tr = this.closest('tr');
        const dt = $(e.data).DataTable().row(tr);
        const data = dt.data();
        if (this.dataset.view === 'xy') {
          data.showxy = this.checked;
        } else if (this.dataset.view === 'xz') {
          data.showxz = this.checked;
        } else if (this.dataset.view === 'yz') {
          data.showyz = this.checked;
        }
        dt.invalidate();
      });
    });

    const scripts = new Array();
    // scripts.push(bodyExplorer.galleryJS);
    scripts.push(bodyExplorer.galleryTransformations);
    scripts.push(bodyExplorer.jquery);
    scripts.push(bodyExplorer.dataTablesJS);

    for (var j = 0; j < scripts.length; j++) {
      const script = doc.createElement('script');
      const path = `${location}${scripts[j]}`;
      script.src = path;
      doc.head.appendChild(script);
    }

    $('#col-XY', doc).on('click', function () {
      const tbl = $('#gallery-table', doc).DataTable();
      const dArray = tbl.rows().data();
      for (let i = 0, max = dArray.length; i < max; i++) {
        dArray[i].showxy = this.checked;
      }
      tbl.rows().invalidate().draw();
    });

    $('#col-XZ', doc).on('click', function () {
      const tbl = $('#gallery-table', doc).DataTable();
      const dArray = tbl.rows().data();
      for (let i = 0, max = dArray.length; i < max; i++) {
        dArray[i].showxz = this.checked;
      }
      tbl.rows().invalidate().draw();
    });

    $('#col-YZ', doc).on('click', function () {
      const tbl = $('#gallery-table', doc).DataTable();
      const dArray = tbl.rows().data();
      for (let i = 0, max = dArray.length; i < max; i++) {
        dArray[i].showyz = this.checked;
      }
      tbl.rows().invalidate().draw();
    });
  },
};
