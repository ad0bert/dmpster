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

require([
  'jquery',
  'jquery.ui.widget',
  'jquery.fileupload',
  'jquery.balloon',
  'react',
  'tagging',
  'tags',
  'Bucket',
  'buckets',
  'view-bucket'

  ], function (
  jQuery,
  jQueryUiWidget,
  jQueryFileUpload,
  jQueryBalloon,
  React,
  Tagging,
  Tags,
  Bucket,
  Buckets,
  ViewBucket
  ) {
  React.renderComponent(
    ViewBucket({url:"/dmpster/bucket/" + bucketId + "/Json", pollInterval:5000}),
    document.getElementById('content')
    );
});
