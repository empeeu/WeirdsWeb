if (Meteor.isClient) {
  Session.setDefault('record:nPlayers', 2)
  Template.record.helpers({
    nPlayers: function(){
      return Session.get('Record:nPlayers');
    } 
  });
  Template.record.events({
    "change #n-players" : function(event) {
      var nPlayers = event.target.value;
      
      Session.set('Record:nPlayers', nPlayers);
    }
  })
}

if (Meteor.isServer) {
  Meteor.startup(function () {
    // code to run on server at startup
  });
}

