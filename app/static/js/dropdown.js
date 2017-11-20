var dropdown = dropdown || {};

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
   if (keys.length > 0) {
    keys.forEach(function(server){
      // Build second level
      var d = doc.createElement('option');
      var content = document.createTextNode(server);
      d.classList.add('dropdown-item');
      d.appendChild(content);
      select1.append(d);
    });
    this.fillPort(keys[0], true);
    // this.fillThirdLevel();
   }
};

// fill the ports available for the selected server into 2. dropdown
dropdown.fillPort = function(server, initial) {
   var doc = window.document;
   var select2 = $('#select-port');
   select2.empty();
   var subObj = dropdown.repos[server];
   var ports = Object.keys(subObj);
   ports.forEach(function(port) {
      var d = doc.createElement('option');
      var content = document.createTextNode(port);
      d.appendChild(content);
      select2.append(d);
   });

   if (initial) {
      select2[0].value = "8700"; 
   }
   dropdown.fillName(select2[0].value);
};

dropdown.fillName = function (port) {
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
      var content = document.createTextNode(name);
      oName.appendChild(content);
      selectName.append(oName);

      var oUUID = doc.createElement('option');
      var content = document.createTextNode(uuid);
      oUUID.appendChild(content);
      selectUUID.append(oUUID);
    }
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
   }
};

// display information about environment (name and UUID)
dropdown.fillThirdLevel = function() {
   var server = $('#select-server')[0].value;
   var port = $('#select-port')[0].value;
   var div3 = $('#level3');
   div3.empty();
   var env = dropdown.repos[server][port];
   var content1 = '<h5>UUID: ' + env.UUID + '</h5>';
   var content2 = '<p>' + env.name + '</p>';
   var content3 = '<p>' + env.description + '</p>';
   var d = $('#level3');
   d.append(content1);
   d.append(content2);
   d.append(content3);
   div3.append(d);
   var new_location = '/server/' + server + '/port/' + port + '/uuid/' + env.UUID;
   if (window.location.pathname !== new_location) {
      window.location.pathname = new_location;
   }
};