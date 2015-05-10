if (Meteor.isClient) {
  Session.setDefault('Record:nPlayers', 2)
  Template.record.helpers({
    nPlayers: function(){
      return Session.get('Record:nPlayers');
    } 
  });
  Template.record.events({
    "change #NPlayers" : function(event) {
      var nPlayers = event.target.value;
      Session.set('Record:nPlayers', nPlayers)
      var container = document.getElementById("PlayerId")
      // Clear the previous contents of the container
      while (container.hasChildNodes()){
        container.removeChild(container.lastChild);
      }
      for (i=0; i < nPlayers; i++){
        // Append a node with a random text
        container.appendChild(document.createTextNode("Player " + (i+1)));
        // Create an <input> element, set its type and name attributes
        var input = document.createElement("input");
        input.type = "text";
        input.name = "member" + i;
        container.appendChild(input);
        // Append a line break 
        container.appendChild(document.createElement("br"));
      }
    }
  })
}

if (Meteor.isServer) {
  Meteor.startup(function () {
    // code to run on server at startup
  });
}

