// Namespace with helpful variables and functions for the body explorer
var bodyExplorer = {

   jquery: 'static/components/jquery/dist/jquery.min.js',

   // gallery only
   galleryUrlXY: '/grayscale/isotropic/0_1/256_256/',
   galleryUrlXZ: '/grayscale/isotropic/0_2/256_256/',
   galleryUrlYZ: '/grayscale/isotropic/1_2/256_256/',

   // custom scripts
   galleryJS: 'static/js/gallery.js',

   // store some column information
   columns: {
      'bodyId': {
            visible: true,
            title: 'Body ID'
         },
      'name': {
            visible: true,
            title: 'Name'
         },
      'status': {
            visible: true,
            title: 'Status'
         },
      'presyn': {
            visible: true,
            title: 'PreSyn'
         },
      'postsyn': {
            visible: true,
            title: 'PostSyn'
         },
      'assigned': {
            visible: true,
            title: 'Assigned'
         },
      'user': {
            visible: true,
            title: 'User'
         },
      'size': {
            visible: true,
            title: 'Size'
         },
      'comment': {
            visible: true,
            title: 'Comment'
         }
   },

   textColumns: ['Body ID', 'Name', 'Status', 'Assigned', 'User', 'Comment'],

   openGallery: function() {
      var checked = {
         xy: true,
         xz: false,
         yz: false
      };
      table_ns.open_image_gallery(checked);
   },

   hideColumn: function() {
      var hideElement = $('#data-table').DataTable().columns(1);
      var toggle = hideElement.visible();
      hideElement.visible(!(toggle[0]));
   }
};