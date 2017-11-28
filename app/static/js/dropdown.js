var dropdown = dropdown || {};

dropdown.status = function (response) {
  if (response.status >= 200 && response.status < 300) {
    return Promise.resolve(response);
  }
  return Promise.reject(new Error(response.statusText));
};

dropdown.json = function (response) {
  return response.json();
};

dropdown.env = null;

dropdown.explore = function (server, port, rootUUID, initial) {
  const infoURL = `http://${
    server
  }:${
    port
  }/api/repo/${
    rootUUID
  }/info`;
  const infoRequest = new Request(infoURL, {
    method: 'GET',
  });

  const branchElem = $('#select-branch');
  branchElem.empty();
  const uuidElem = $('#select-datauuid');
  uuidElem.empty();

  const cFetch = fetch(infoRequest).then(dropdown.status)
    .then(dropdown.json)
    .then((data) => {
      dropdown.env = data.DAG.Nodes;
      const versions = Object.keys(dropdown.env);
      return versions;
    })
    .catch((error) => {
      branchElem.selectpicker('refresh');
      uuidElem.selectpicker('refresh');
      console.log('Request failed: ', error);
    })
    .then((result) => {
      if (result && Array.isArray(result) && result.length > 0) {
        const branches = new Set();

        for (var j = 0, len = result.length; j < len; j++) {
          dropdown.addOption(uuidElem, result[j]);
          branches.add(dropdown.env[result[j]].Branch);
        }
        const branchArray = Array.from(branches).sort();
        for (var i = 0, len = branchArray.length; i < len; i++) {
          dropdown.addOption(branchElem, branchArray[i]);
        }
        if (initial) {
          uuidElem[0].value = dropdown.init.dataUUID;
          var node = dropdown.env[dropdown.init.dataUUID];
          if (node) {
            branchElem[0].value = node.Branch;
          }
        }
        uuidElem.selectpicker('refresh');
        branchElem.selectpicker('refresh');
      }
    });
};

dropdown.showLevel = function (id, level) {
  $(`.dropdown-${level}`).each(function () {
    $(this).css('display', 'none');
  });
  const item = $(`#div-${id}`);
  // item.css('display','block');
  item.css('display', 'block');
};

dropdown.hideLevel = function (id) {
  const item = $(`#div-${id}`);
  // item.css('display','block');
  item.css('display', 'none');
};

dropdown.repos = null;

dropdown.current = {
  server: null,
  port: null,
  root: null,
};

// aggregate json information / put informaition about same servers into second level object
dropdown.initializeRepo = function () {
  const result = {};
  repos.repos.forEach((elem) => {
    // check if server has been added yet
    if (Object.keys(result).indexOf(elem.server) == -1) {
      result[elem.server] = {};
      result[elem.server][elem.port] = [];
    }
    if (Object.keys(result[elem.server]).indexOf(elem.port.toString()) == -1) {
      result[elem.server][elem.port] = [];
    }
    const instance = {};
    instance.UUID = elem.UUID;
    instance.name = elem.name;
    instance.description = elem.description;
    instance.datainstance = elem.datainstance;
    instance.key = elem.key;
    instance.skeleton = elem.skeleton
    result[elem.server][elem.port].push(instance);
  });
  dropdown.repos = result;
};

// initialize dropdown with servers available from repos.js
dropdown.initializeSelect = function () {
  const selectServer = $('#select-server');
  selectServer.empty();
  const keys = Object.keys(dropdown.repos);
  // fill in the values for the server dropdown
  if (keys.length > 0) {
    keys.forEach((server) => {
      dropdown.addOption(selectServer, server);
    });
    const serv = dropdown.init.server;
    dropdown.current.server = serv;
    selectServer[0].value = serv;
    selectServer.selectpicker('refresh');
    this.fillPort(serv, true); // add the ports for init server
  }
};

// fill the ports available for the selected server into 2. dropdown
dropdown.fillPort = function (server, initial) {
  dropdown.current.server = server;
  const selectPort = $('#select-port');
  selectPort.empty();
  const subObj = dropdown.repos[server];
  const ports = Object.keys(subObj);
  if (ports.length > 0) {
    ports.forEach((port) => {
      dropdown.addOption(selectPort, port);
    });
    if (initial) {
      const port = dropdown.init.port;
      dropdown.current.port = port;
      selectPort[0].value = port;
      this.fillName(port, initial);
      this.updateDataUUIDs(dropdown.init.UUID, initial);
    } else {
      this.fillName(ports[0], initial);
      const selectuuid = $('#select-uuid');
      this.updateDataUUIDs(selectuuid[0].value, initial);
    }
  }
  selectPort.selectpicker('refresh');
};

dropdown.fillName = function (port, initial) {
  const server = dropdown.current.server;
  dropdown.current.port = port;
  if (dropdown.repos[server][port] && dropdown.repos[server][port].length > 0) {
    const selectName = $('#select-name');
    selectName.empty();
    const selectUUID = $('#select-uuid');
    selectUUID.empty();

    const realRepos = dropdown.repos[server][port];
    for (let j = 0; j < realRepos.length; j++) {
      // populate dropdown to choose an UUID
      const uuid = realRepos[j].UUID;
      dropdown.current.root = uuid;
      dropdown.addOption(selectUUID, uuid);

      // populate dropdown to choose a name
      const name = realRepos[j].name;
      dropdown.addOption(selectName, name);
    }
    if (initial) { // set intial value for the name field
      selectName[0] = dropdown.init.name;
    }
    selectName.selectpicker('refresh');
    selectUUID.selectpicker('refresh');
  }
};

dropdown.updateName = function (uuid) {
  const server = dropdown.current.server;
  const port = dropdown.current.port;
  
  if (server && port) {
    const envs = dropdown.repos[server][port];
    const nameControl = $('#select-name');
    const name = nameControl[0];
    for (let i = 0; i < envs.length; i++) {
      if (envs[i].UUID === uuid) {
        name.value = envs[i].name;
        break;
      }
    }
    nameControl.selectpicker('refresh');
  }
};

dropdown.updateUUID = function (name) {
  const server = dropdown.current.server;
  const port = dropdown.current.port;
  const uuidControl = $('#select-uuid');
  const uuid = uuidControl[0];

  if (server && port) {
    const envs = dropdown.repos[server][port];
    for (let i = 0; i < envs.length; i++) {
      if (envs[i].name === name) {
        uuid.value = envs[i].UUID;
        dropdown.current.root = envs[i].UUID;
        break;
      }
    }
    $('#select-name').selectpicker('refresh');
    uuidControl.selectpicker('refresh');
  }
};

dropdown.updateDataUUIDs = function (rootUUID, initial) {
  const server = dropdown.current.server;
  const port = dropdown.current.port;
  this.explore(server, port, rootUUID, initial);
};

dropdown.onChangeRootUUID = function (rootUUID) {
  this.updateName(rootUUID);
  this.updateDataUUIDs(rootUUID);
  $('#select-name').selectpicker('refresh');
  $('#select-uuid').selectpicker('refresh');
};


dropdown.onChangeRootName = function (rootName) {
  this.updateUUID(rootName);
  const server = dropdown.current.server;
  const port = dropdown.current.port;
  const uuid = $('#select-uuid')[0].value;
  this.explore(server, port, uuid);

  $('#select-name').selectpicker('refresh');
  $('#select-uuid').selectpicker('refresh');
};

// change the current branch when a different data uuid is selected
dropdown.onChangeDataUUID = function (dataUUID) {
  if (dropdown.env) {
    const branchControl = $('#select-branch');
    const branch = dropdown.env[dataUUID].Branch;
    branchControl[0].value = branch;
    branchControl.selectpicker('refresh');
  }
};

dropdown.addOption = function (selectControl, value) {
  const o = window.document.createElement('option');
  const content = window.document.createTextNode(value);
  o.appendChild(content);
  selectControl.append(o);
};

// first implementation: show first uuid in datauuid dropdown, which has this branch value
dropdown.onChangeBranch = function (branch) {
  if (dropdown.env) {
    const versions = Object.keys(dropdown.env);
    for (let v = 0, len = versions.length; v < len; v++) {
      if (dropdown.env[versions[v]].Branch === branch) {
        const datauuidControl = $('#select-datauuid');
        datauuidControl[0].value = versions[v];
        datauuidControl.selectpicker('refresh');
        break;
      }
    }
  }
};

// display information about environment (name and UUID)
dropdown.loadData = function () {
  const server = $('#select-server')[0].value;
  const port = $('#select-port')[0].value;
  const uuid = $('#select-datauuid')[0].value;
  const envs = dropdown.repos[server][port];
  let new_location = null;
  for (let k = 0; k < envs.length; k += 1) {
    if (envs[k].UUID === dropdown.current.root) {
      const instance = envs[k].datainstance;
      const key = envs[k].key;
      const skeleton = envs[k].skeleton
      new_location = `/server/${server}/port/${port}/uuid/${uuid}/instance/${instance}/key/${key}/skeletons/${skeleton}`;
      break;
    }
  }

  if (new_location && window.location.pathname !== new_location) {
    window.location.pathname = new_location;
  }
};
