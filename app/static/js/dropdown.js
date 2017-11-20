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

dropdown.init = {
  server : 'emdata1',
  port : '8700',
  UUID : '18979',
  name : 'pb26-27-2-trm-eroded32_ffn-20170216-2_celis_cx2-2048_r10_0_seeded_64blksz'
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
    this.fillPort(dropdown.init.server, true); // add the ports for init server
    select1[0].value = dropdown.init.server;
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
   
   // dropdown.fillName(select2[0].value);
   $('#select-server').selectpicker('refresh');
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
      oName.title = realRepos[j].description;
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
    $('#select-name').selectpicker('refresh');
    $('#select-uuid').selectpicker('refresh');
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