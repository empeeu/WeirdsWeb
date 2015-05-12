if (Meteor.isClient) {
  var Player = [];
  Session.setDefault('Record:nPlayers', 2)
  Template.record.helpers({
    nPlayers: function(){
      return Session.get('Record:nPlayers');
    },
    Players : function() {
      var nPlayers = Session.get('Record:nPlayers');
      return _.range(nPlayers)
    } 
  });
  Template.record.events({
    "change #NPlayers" : function(event) {
      var nPlayers = event.target.value;
      Session.set('Record:nPlayers', nPlayers)
    }
  })
}

if (Meteor.isServer) {
  Meteor.startup(function () {
    // code to run on server at startup
  });
}

