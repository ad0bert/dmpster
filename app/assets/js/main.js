requirejs.config({
  paths: {
    'jquery': '../lib/jquery/jquery',
    'jquery.ui.widget': '../jQuery-File-Upload-8.8.5/js/vendor/jquery.ui.widget',
    'jquery.fileupload': '../jQuery-File-Upload-8.8.5/js/jquery.fileupload',
    'react': '../lib/react/react-with-addons',
    'tagging': '../jsx/tagging',
    'tags': '../jsx/tags',
    'Bucket': '../jsx/bucket',
    'buckets': '../jsx/buckets',
    'view-bucket': '../jsx/viewBucket',
    'details': '../jsx/details'
  }
});

require(['mainIndex', 'mainDetails', 'mainBucket'], function(index, details, bucket) {

});
