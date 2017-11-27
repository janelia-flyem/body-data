// Namespace with helpful variables and functions for the body explorer
const bodyExplorer = {

  jquery: 'static/components/jquery/dist/jquery.min.js',

  // gallery only
  galleryUrlXY: '/grayscale/isotropic/0_1/256_256/',
  galleryUrlXZ: '/grayscale/isotropic/0_2/256_256/',
  galleryUrlYZ: '/grayscale/isotropic/1_2/256_256/',

  // custom scripts
  galleryJS: 'static/js/gallery.js',
  dataTablesJS: 'static/components/datatables.net/js/jquery.dataTables.js',
  galleryTransformations: 'static/js/galleryTransformations.js',

  // store some column information
  columns: {
    bodyId: {
      visible: true,
      title: 'Body ID',
    },
    name: {
      visible: true,
      title: 'Name',
    },
    status: {
      visible: true,
      title: 'Status',
    },
    presyn: {
      visible: true,
      title: 'PreSyn',
    },
    postsyn: {
      visible: true,
      title: 'PostSyn',
    },
    assigned: {
      visible: true,
      title: 'Assigned',
    },
    user: {
      visible: true,
      title: 'User',
    },
    size: {
      visible: true,
      title: 'Size',
    },
    comment: {
      visible: true,
      title: 'Comment',
    },
  },

  textColumns: ['Body ID', 'Name', 'Status', 'Assigned', 'User', 'Comment'],

  openGallery() {
    const checked = {
      xy: true,
      xz: false,
      yz: false,
    };
    n_table.open_image_gallery(checked);
  },

  hideColumn() {
    const hideElement = $('#data-table').DataTable().columns(1);
    const toggle = hideElement.visible();
    hideElement.visible(!(toggle[0]));
  },
};
