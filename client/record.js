WeirdPlayersDB = new Mongo.Collection("weird_players");

var Player = [];
Session.setDefault('Record:nPlayers', 2)
Template.record.helpers({
  nPlayers: function(){
    return Session.get('Record:nPlayers');
  },
  Players : function() {
    var nPlayers = Session.get('Record:nPlayers');
    var Players = [];
    for (i=0; i < nPlayers; i++) {
      Players[i] = {order : i, name : ""};
    }
    return Players
  }
});
Template.record.events({
  "change #NPlayers" : function(event) {
    var nPlayers = event.target.value;
    Session.set('Record:nPlayers', nPlayers)
  },
  "submit #PlayerId " : function(event) {
    event.preventDefault();
    var nPlayers = Session.get('Record:nPlayers');
    console.log(event.target.player)
    var Players = event.target.player
    for (i = 0; i < Players.length; i++){
      WeirdPlayersDB.insert({name : Players[i].value});  
    }
    
  }
});
Template.weirdplayers_datalist.helpers({
  WeirdPlayer : function() {
    return WeirdPlayersDB.find({});
  } 
});


