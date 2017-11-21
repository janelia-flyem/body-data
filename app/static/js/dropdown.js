var dropdown = dropdown || {};

dropdown.status = function(response) {
  if (response.status >= 200 && response.status < 300) {
    return Promise.resolve(response)
  } else {
    return Promise.reject(new Error(response.statusText))
  }
};

dropdown.json = function(response) {
  return response.json()
};

dropdown.env = null;

dropdown.explore = function(server, port, rootUUID){
    var infoURL = 'http://'
         + server
         + ':'
         + port
         + '/api/repo/'
         + rootUUID
         + '/info';

    var infoRequest = new Request(infoURL, {
       method: 'GET'
    })

    var cFetch = fetch(infoRequest).then(dropdown.status)
            .then(dropdown.json)
            .then(function(data) {
                dropdown.env = data.DAG.Nodes;
                var versions = Object.keys(dropdown.env);
                return versions;
            }).catch(function(error) {
                console.log('Request failed', error);
            }).then( function(result) {
                if (result && Array.isArray(result) && result.length > 0) {
                  var elem = $('#select-datauuid');
                  elem.empty();
                  var doc = window.document;
                  for (var j = 0; j < result.length; j++) {
                    var d = doc.createElement('option');
                    var content = document.createTextNode(result[j]);
                    d.appendChild(content);
                    elem.append(d);
                  }
                  $('#select-datauuid').selectpicker('refresh');
                }
            });
};

dropdown.showLevel = function(id, level) {
  $('.dropdown-' + level).each(function(){
      $(this).css('display','none');
    }
  );
  var item = $('#div-' + id); 
  // item.css('display','block');
  item.css('display','block');
};

dropdown.hideLevel = function(id) {
  var item = $('#div-' + id);
  // item.css('display','block');
  item.css('display','none');
};

dropdown.repos = null;

dropdown.init = {
  server: 'emdata1',
  port: '8700',
  UUID: '18979',
  name: 'pb26-27-2-trm-eroded32_ffn-20170216-2_celis_cx2-2048_r10_0_seeded_64blksz'
};

// aggregate json information / put informaition about same servers into second level object
dropdown.initializeRepo = function() {
   var result = {}
   repos.repos.forEach(function(elem){
      // check if server has been added yet
      if (Object.keys(result).indexOf(elem.server) == -1) {
         result[elem.server] = {};
         result[elem.server][elem.port] = [];
      }
      if (Object.keys(result[elem.server]).indexOf(elem.port.toString()) == -1) {
         result[elem.server][elem.port] = [];
      }
      var instance = {};
      instance['UUID'] = elem.UUID;
      instance['name'] = elem.name;
      instance['description'] = elem.description;
      result[elem.server][elem.port].push(instance);
   });
   dropdown.repos = result;
};

// initialize dropdown with servers available from repos.js
dropdown.initializeSelect = function() {
   // initialize first dropdown
   var doc = window.document;
   var select1 = $('#select-server');
   select1.empty();
   var keys = Object.keys(dropdown.repos);
   // fill in the values for the select dropdown
   if (keys.length > 0) {
    keys.forEach(function(server){
      // Build second level
      var d = doc.createElement('option');
      var content = document.createTextNode(server);
      d.classList.add('dropdown-item');
      d.appendChild(content);
      select1.append(d);
    });
    select1[0].value = dropdown.init.server;
    $('#select-server').selectpicker('refresh');
    this.fillPort(dropdown.init.server, true); // add the ports for init server
   }
};

// fill the ports available for the selected server into 2. dropdown
dropdown.fillPort = function(server, initial) {
   var select2 = $('#select-port');
   var doc = window.document;
   select2.empty();
   var subObj = dropdown.repos[server];
   var ports = Object.keys(subObj);
   if (ports.length > 0) {
      ports.forEach(function(port) {
        var d = doc.createElement('option');
        var content = document.createTextNode(port);
        d.appendChild(content);
        select2.append(d);
      });
      if (initial) {
        select2[0].value = dropdown.init.port; 
        this.fillName(dropdown.init.port, initial);
      }
      else {
        this.fillName(ports[0], initial);  
      }
   }
   $('#select-port').selectpicker('refresh');
};

dropdown.fillName = function (port, initial) {
  var doc = window.document;
  var server = $('#select-server')[0].value;
  if (dropdown.repos[server][port] && dropdown.repos[server][port].length > 0) {
    var selectName = $('#select-name');
    selectName.empty();
    var selectUUID = $('#select-uuid');
    selectUUID.empty();

    var realRepos = dropdown.repos[server][port];
    for (var j = 0; j < realRepos.length; j++) {
      var uuid = realRepos[j].UUID;
      // populate dropdown to choose an UUID
      var name = realRepos[j].name;
      // populate dropdown to choose a name
      var oName = doc.createElement('option');
      oName.title = realRepos[j].name;
      var content = document.createTextNode(name);
      oName.appendChild(content);
      selectName.append(oName);

      var oUUID = doc.createElement('option');
      var content = document.createTextNode(uuid);
      oUUID.appendChild(content);
      selectUUID.append(oUUID);
    }
    if (initial) { //set intial value for the name field
      $('#select-name')[0] = dropdown.init.name;
    }
    $('#select-name').selectpicker('refresh');
    $('#select-uuid').selectpicker('refresh');
  }
};

dropdown.updateName = function (uuid) {
   var server = $('#select-server')[0].value;
   var port = $('#select-port')[0].value;
   var name = $('#select-name')[0];

   if (server && port) {
     var envs = dropdown.repos[server][port];
     for (var i = 0; i < envs.length; i++) {
        if (envs[i].UUID === uuid) {
          name.value = envs[i].name;
        }
     }
   }
};

dropdown.updateUUID = function (name) {
   var server = $('#select-server')[0].value;
   var port = $('#select-port')[0].value;
   var uuid = $('#select-uuid')[0];

   if (server && port) {
     var envs = dropdown.repos[server][port];
     for (var i = 0; i < envs.length; i++) {
        if (envs[i].name === name) {
          uuid.value = envs[i].UUID;
        }
     }
     $('#select-name').selectpicker('refresh');
     $('#select-uuid').selectpicker('refresh');
   }
};

dropdown.onChangeRootUUID = function(rootUUID) {
  this.updateName(rootUUID);
  this.updateDataUUIDs(rootUUID);
  $('#select-name').selectpicker('refresh');
  $('#select-uuid').selectpicker('refresh');
};

dropdown.onChangeRootName = function(rootName) {
  this.updateUUID(rootName);
  var server = $('#select-server')[0].value;
  var port = $('#select-port')[0].value;
  var uuid = $('#select-uuid')[0].value
  this.explore(server, port, uuid);

  $('#select-name').selectpicker('refresh');
  $('#select-uuid').selectpicker('refresh');
};

dropdown.onChangeDataUUID = function(dataUUID) {
  // update branch
  var server = $('#select-server')[0].value;
  var port = $('#select-port')[0].value;
  var rootUUID = $('#select-uuid')[0].value

  if (dropdown.env) {
    var branchControl = $('#select-branch');
    branchControl.empty();
    var branch = dropdown.env[dataUUID].Branch;
    dropdown.addOption(window.document, branchControl, branch);
    branchControl[0].value = branch;
    branchControl.selectpicker('refresh');
  }
};

dropdown.updateDataUUIDs = function(rootUUID){
  var server = $('#select-server')[0].value;
  var port = $('#select-port')[0].value;
  this.explore(server, port, rootUUID);
};

dropdown.addOption = function(docm, selectControl, value) {
  var o = docm.createElement('option');
  var content = docm.createTextNode(value);
  o.appendChild(content);
  selectControl.append(o);
};

dropdown.onChangeBranch = function() {
  console.log('Branch chaanged');
};

// display information about environment (name and UUID)
dropdown.loadData = function() {
   var server = $('#select-server')[0].value;
   var port = $('#select-port')[0].value;
   var uuid = $('#select-datauuid')[0].value;
   var new_location = '/server/' + server + '/port/' + port + '/uuid/' + uuid;
   if (window.location.pathname !== new_location) {
      window.location.pathname = new_location;
   }
};