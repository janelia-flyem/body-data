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

dropdown.explore = function(server, port, rootUUID, initial){
    var infoURL = 'http://'
         + server
         + ':'
         + port
         + '/api/repo/'
         + rootUUID
         + '/info';
    var infoRequest = new Request(infoURL, {
       method: 'GET'
    });

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
                  var uuidElem = $('#select-datauuid');
                  var branchElem = $('#select-branch');
                  var branches = new Set();
                  uuidElem.empty();
                  branchElem.empty();
                  for (var j = 0, len = result.length; j < len; j++) {
                    dropdown.addOption(uuidElem, result[j]);
                    branches.add(dropdown.env[result[j]].Branch)
                  }
                  var branchArray = Array.from(branches).sort();
                  for (var i = 0, len = branchArray.length; i < len; i++) {
                     dropdown.addOption(branchElem, branchArray[i]);
                  }
                  if (initial) {
                     $('#select-datauuid')[0].value = dropdown.init.dataUUID;
                     $('#select-branch')[0].value = dropdown.env[dropdown.init.dataUUID].Branch;
                  }
                  $('#select-datauuid').selectpicker('refresh');
                  $('#select-branch').selectpicker('refresh');
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
  dataUUID: '18979088f9d248d6ac428df4cea022fe',
  name: 'pb26-27-2-trm-eroded32_ffn-20170216-2_celis_cx2-2048_r10_0_seeded_64blksz'
};

dropdown.current = {
   server: null,
   port: null
};

// aggregate json information / put informaition about same servers into second level object
dropdown.initializeRepo = function() {
   var result = {};
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
   var selectServer = $('#select-server');
   selectServer.empty();
   var keys = Object.keys(dropdown.repos);
   // fill in the values for the server dropdown
   if (keys.length > 0) {
    keys.forEach(function(server){
      dropdown.addOption(selectServer, server);
    });
    var serv = dropdown.init.server;
    dropdown.current.server = serv;
    selectServer[0].value = serv;
    $('#select-server').selectpicker('refresh');
    this.fillPort(serv, true); // add the ports for init server
   }
};

// fill the ports available for the selected server into 2. dropdown
dropdown.fillPort = function(server, initial) {
   var selectPort = $('#select-port');
   selectPort.empty();
   var subObj = dropdown.repos[server];
   var ports = Object.keys(subObj);
   if (ports.length > 0) {
      ports.forEach(function(port) {
        dropdown.addOption(selectPort, port);
      });
      if (initial) {
        var port = dropdown.init.port;
        dropdown.current.port = port;
        selectPort[0].value = port;
        this.fillName(port, initial);
        this.updateDataUUIDs(dropdown.init.UUID, initial);
      }
      else {
        this.fillName(ports[0], initial);
      }
   }
   $('#select-port').selectpicker('refresh');
};

dropdown.fillName = function (port, initial) {
  var server = dropdown.current.server;
  if (dropdown.repos[server][port] && dropdown.repos[server][port].length > 0) {
    var selectName = $('#select-name');
    selectName.empty();
    var selectUUID = $('#select-uuid');
    selectUUID.empty();

    var realRepos = dropdown.repos[server][port];
    for (var j = 0; j < realRepos.length; j++) {
      // populate dropdown to choose an UUID
      var uuid = realRepos[j].UUID;
      dropdown.addOption(selectUUID, uuid);

      // populate dropdown to choose a name
      var name = realRepos[j].name;
      dropdown.addOption(selectName, name);
    }
    if (initial) { //set intial value for the name field
      $('#select-name')[0] = dropdown.init.name;
    }
    $('#select-name').selectpicker('refresh');
    $('#select-uuid').selectpicker('refresh');
  }
};

dropdown.updateName = function (uuid) {
   var server = dropdown.current.server;
   var port = dropdown.current.port;
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
   var server = dropdown.current.server;
   var port = dropdown.current.port;
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

dropdown.updateDataUUIDs = function(rootUUID, initial){
   var server = dropdown.current.server;
   var port = dropdown.current.port;
   this.explore(server, port, rootUUID, initial);
};

dropdown.fillBranches = function(rootUUID) {
   var server = dropdown.current.server;
   var port = dropdown.current.port;
   var uuids = dropdown.repos[server][port];
};

dropdown.onChangeRootUUID = function(rootUUID) {
  this.updateName(rootUUID);
  this.updateDataUUIDs(rootUUID);
  this.fillBranches(rootUUID);
  $('#select-name').selectpicker('refresh');
  $('#select-uuid').selectpicker('refresh');
};

dropdown.onChangeRootName = function(rootName) {
  this.updateUUID(rootName);
   var server = dropdown.current.server;
   var port = dropdown.current.port;
  var uuid = $('#select-uuid')[0].value;
  this.explore(server, port, uuid);

  $('#select-name').selectpicker('refresh');
  $('#select-uuid').selectpicker('refresh');
};

dropdown.onChangeDataUUID = function(dataUUID) {
  if (dropdown.env) {
    var branchControl = $('#select-branch');
    var branch = dropdown.env[dataUUID].Branch;
    branchControl[0].value = branch;
    branchControl.selectpicker('refresh');
  }
};

dropdown.addOption = function(selectControl, value) {
  var o = window.document.createElement('option');
  var content = window.document.createTextNode(value);
  o.appendChild(content);
  selectControl.append(o);
};

// first implementation: show first uuid in datauuid dropdown, which has this branch value
dropdown.onChangeBranch = function(branch) {
   if (dropdown.env) {
      var versions = Object.keys(dropdown.env);
      for (var v = 0, len = versions.length; v < len; v++) {
         if (dropdown.env[versions[v]].Branch === branch) {
            $('#select-datauuid')[0].value = versions[v];
            $('#select-datauuid').selectpicker('refresh');
            break;
         }
      }
   }
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