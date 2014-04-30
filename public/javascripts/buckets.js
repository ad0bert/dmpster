/**
 * @jsx React.DOM
 */

var BucketList = React.createClass({
  getInitialState: function() {
    return {analyzingDumps: this.props.analyzingDumps};
  },

  componentWillReceiveProps: function(nextProps) {
    this.setState({analyzingDumps: nextProps.analyzingDumps});
  },

  onFileUploaded: function(fileName) {
    var analyzing = this.state.analyzingDumps;
    if(!analyzing.some(function(a) { return a === fileName; })) {
      var newAnalyzing = analyzing.concat([fileName]);
      this.setState({analyzingDumps: newAnalyzing});
    }
  },

  render: function() {
    var bucketNodes = this.props.dumps.map(function (bucketAndDumps) {
      var bucket = bucketAndDumps[0];
      var dumps = bucketAndDumps[1];
      return (<Bucket 
          key={bucket.id} 
          name={bucket.name} 
          url={bucket.url} 
          tagging={bucket.tagging} 
          dumps={dumps}>
        </Bucket>);
    });
    return (
      <div className="bucketList">
        <UploadingFiles onFileUploaded={this.onFileUploaded} />
        <AnalyzingBuckets analyzingDumps={this.state.analyzingDumps}></AnalyzingBuckets>
        {bucketNodes}
      </div>
    );
  }
});

var UploadingFiles = React.createClass({
  getInitialState: function() {
    return {uploads: []};
  },
  
  componentDidMount: function() {
    var uploading = this;
    var url = '/uploadAsync';
    $('#holder').fileupload({
        url: url,
        dataType: 'json',
        submit: function(e, data) {
          var newUploads = uploading.state.uploads.concat(
            [{name: data.files[0].name, progress: 0}]);
          uploading.setState({uploads: newUploads});

          $(window).on('beforeunload', function() {
            return "There are files being uploaded to the server.";
          });
          return true;
        },

        progress: function(e, data) {
          var progress = parseInt(data.loaded / data.total * 100, 10);
          var newUploads = uploading.state.uploads.map(function(entry) { 
            if(entry.name === data.files[0].name) {
              return {name: entry.name, progress: progress};
            }
            else {
              return entry;
            }
          });
          uploading.setState({uploads: newUploads});
        },

        done: function (e, data) {
          var finishedFile = data.files[0].name;
          var newUploads = uploading.state.uploads.filter(
            function(upload) { return upload.name !== finishedFile; });
          uploading.setState({uploads: newUploads});
          uploading.props.onFileUploaded(finishedFile);

          if($('#holder').fileupload('active') === 1) {
            $(window).off('beforeunload');
          }
        }
    }).prop('disabled', !$.support.fileInput)
        .parent().addClass($.support.fileInput ? undefined : 'disabled');
    
  },
  
  render: function() {
    var uploadingNodes = this.state.uploads.map(function(entry) {
      var width = {width: entry.progress + '%'};
      return (
        <section key={entry.name} className="dmp">
          <h1>{entry.name}</h1>
          <div id="progress">
            <div className="bar" style={width}></div>
          </div>
        </section>
      );
    });
    return (
      <article id="uploading" className={this.state.uploads.length ? '' : 'hidden'}>
        <h1>
          Uploading...
          <br/>
        </h1>
        {uploadingNodes}
      </article>
    );
  }
});

var AnalyzingBuckets = React.createClass({
  render: function() {
    var dumpNodes = this.props.analyzingDumps.map(function(dump) {
      return (
        <section key={dump} className="dmp processing">
          <h1>
          {dump}
          </h1>
          <img src="assets/images/spinner.gif" />
        </section>
      );
    });
    
    return (
      <article id="processing" className={this.props.analyzingDumps.length ? '' : 'hidden'}>
        <h1>
          Currently processing...
          <br/>
        </h1>
        {dumpNodes}
      </article>
    );
  }
});

var Bucket = React.createClass({
  mixins: [TaggingMixin], 
  
  render: function() {
    var dumpNodes = this.props.dumps.map(function(dump) {
      return <Dump key={dump.id} dump={dump} tagging={dump.tagging}></Dump>;
    });
    return (
      <article id={this.props.id}>
        <h1>
          <a href={this.props.url}>
            {this.props.name}<br/>
          </a>
          <Tags 
          tags = {this.state.tags} 
          handleAddTag = {this.handleAddTag}
          handleRemoveTag = {this.handleRemoveTag} />
        </h1>
        {dumpNodes}
      </article>
    );
  }
});

var Dump = React.createClass({
  mixins: [TaggingMixin],
  
  render: function() {
    var cx = React.addons.classSet;
    var classes = cx({
      'dmp': true,
      'new': this.props.dump.isNew
    });
    return (
        <section className={classes}>
          <h1>
            <a href={this.props.dump.dmpUrl} download={this.props.dump.filename}>
              <img src="assets/images/download.svg" title={'download ' + this.props.dump.filename}></img>
            </a>
            <a href={"dmpster/dmp/" + this.props.dump.id + "/details"}>
              {this.props.dump.filename}
            </a>
          </h1>
          <Tags 
            tags = {this.state.tags} 
            handleAddTag = {this.handleAddTag}
            handleRemoveTag = {this.handleRemoveTag} />
          <time>{this.props.dump.ageLabel}</time>
          <span className="side-menu">
            <a 
              className="remove-dump" 
              href="javascript: void(0);"
              onClick={this.handleClickOnRemove} >
              <img src="assets/images/delete.svg" title="mark for deletion"></img>
            </a>
            <a 
              className="archive-dump" 
              href="javascript: void(0);"
              onClick={this.handleClickOnArchive} >
              <img src="assets/images/archive.svg" title="keep forever"></img>
            </a>
          </span>
        </section>
    );
  }
});

var Buckets = React.createClass({
  getInitialState: function() {
    return {dumps: [], analyzingDumps: []};
  },

  loadBucketsFromServer: function() {
    $.ajax({
      url: this.props.url,
      dataType: 'json',
      success: function(data) {
        this.setState({ dumps: data.buckets, analyzingDumps: data.analyzing });
      }.bind(this),
      error: function(xhr, status, err) {
        console.error(this.props.url, status, err.toString());
      }.bind(this)
    });
  },

  componentWillMount: function() {
    this.loadBucketsFromServer();
    setInterval(this.loadBucketsFromServer, this.props.pollInterval);
  },
  render: function() {
    return (
      <div className="buckets">
        <BucketList dumps={this.state.dumps} analyzingDumps={this.state.analyzingDumps} />
      </div>
    );
  }
});

React.renderComponent(
  <Buckets url="dmpster/buckets.json" pollInterval={2000}/>,
  document.getElementById('content')
);