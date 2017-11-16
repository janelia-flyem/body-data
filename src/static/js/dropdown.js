var dropdown = dropdown || {};

dropdown.showLevel = function(id, level){
  $('.dropdown-' + level).each(function(){
      $(this).css('display','none');
    }
  );
  var item = $('#div-' + id); 
  // item.css('display','block');
  item.css('display','block');
};

dropdown.hideLevel = function(id){
  var item = $('#div-' + id);
  // item.css('display','block');
  item.css('display','none');
};

dropdown.repos = null;

// aggregate json information / put informaition about same servers into second level object
dropdown.initializeRepo = function(){
   var result = {}
   repos.repos.forEach(function(elem){
      if (Object.keys(result).indexOf(elem.server) == -1) {
         result[elem.server] = {};
      }
      if (Object.keys(result[elem.server]).indexOf(elem.port) == -1) {
         result[elem.server][elem.port] = {};
      }
      result[elem.server][elem.port]['UUID'] = elem.UUID;
      result[elem.server][elem.port]['name'] = elem.name;
      result[elem.server][elem.port]['description'] = elem.description;
   });
   dropdown.repos = result;
};

// initialize first dropdown with servers available from repos.js
dropdown.initializeSelect = function() {
   var doc = window.document;
   var select1 = $('#select-level1');
   select1.empty();
   var keys = Object.keys(dropdown.repos);
   keys.forEach(function(server){
      // Build second level
      var d = doc.createElement('option');
      var content = document.createTextNode(server);
      d.classList.add('dropdown-item');
      d.onclick = function() {
         // show third level
         select1.css('display','block');
      };
      d.appendChild(content);
      select1.append(d);
   })
};

// fill the ports available for the selected server into 2. dropdown
dropdown.fillSecondLevel = function(value){
   var doc = window.document;
   var select2 = $('#select-level2');
   select2.empty();
   var subObj = dropdown.repos[value];
   console.log(subObj);
   var ports = Object.keys(subObj);
   ports.forEach(function(port) {
      var d = doc.createElement('option');
      var content = document.createTextNode(port);
      d.appendChild(content);
      select2.append(d);
   })
};

// display information about environment (name and UUID)
dropdown.fillThirdLevel = function(port){
   var server = $('#select-level1')[0].value;
   var div3 = $('#level3');
   var name = dropdown.repos[server][port].name;
   var uuid = dropdown.repos[server][port].UUID;
   var content1 = document.createTextNode(name);
   var content2 = document.createTextNode(uuid);
   var d = $('#level3');
   d.append(content1);
   d.append('<br/>');
   d.append(content2);
   div3.append(d);
};


dropdown.getJSON = function(value){
  console.log(value);
  var doc = window.document;

  var mydiv1 = $('#select-level1');
  var mydiv2 = $('#select-level2');
  var mydiv3 = $('#select-level3');

  mydiv1.empty();
  mydiv2.empty();
  mydiv3.empty();

  // Rearrange JSON
  var keys = Object.keys(result);
  keys.forEach(function(server){
    // Build second level
    var d = doc.createElement('option');
    var content = document.createTextNode(server);
    d.classList.add('dropdown-item');
    d.onclick = function() {
        // show third level
        mydiv2.css('display','block');
    };
    d.appendChild(content);
    mydiv1.append(d);

    // Build third levelv
    var ports = Object.keys(result[server]);
  })

  

};