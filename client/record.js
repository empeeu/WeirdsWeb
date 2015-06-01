// This Line is needed but is also duplicated on the serverside for now
WeirdPlayersDB = new Mongo.Collection("weird_players");

// The number of players, and default player names
Session.setDefault('Record:nPlayers', 2)
Session.setDefault('Record:Players', [{'order' : 0, 'name' : ''}, {'order' : 1, 'name': ''}])


// Template helpers to expose variables to the record.html file
// RECORD template
Template.record.helpers({
  nPlayers: function(){
    return Session.get('Record:nPlayers');
  },
  // This records the active players
  Players : function() {
    var Players = Session.get('Record:Players');
    return Players
  }
});
// WEIRDPLAYERS_DATALIST template
Template.weirdplayers_datalist.helpers({
  WeirdPlayer : function() {
    var Players = Session.get('Record:Players');
    pnlist = []
    for (i=0; i<Players.length; i++){
      pnlist.push(Players[i].name)
    }
    return WeirdPlayersDB.find({name: {$nin : pnlist}});
  } 
});


// Helper Functions
function updatePlayers(nPlayers) {
  var Players = Session.get('Record:Players');
  var formPlayers = document.getElementsByName('player');

  var i = Players.length;
  while (Players.length < nPlayers) {
    Players.push({'order' : i, 'name' : ''});
    i++;
  }
  for (i=0; i < Players.length; i++){
    if (formPlayers.length > i) {
      Players[i] = {'order': i, 'name' : formPlayers[i].value}
      if (checkDupName(Players, i)){
        Players[i].error = "Same player cannot play twice!"
      }
    }
  }
  while (Players.length > nPlayers) {
    Players.pop()
  }
  Session.set('Record:Players', Players)
}

function checkDupName(array, i){
  for (ii=0; ii < i; ii++) {
    if (array[ii].name == array[i].name){
      return true;
    }
  }
  return false;
}

// Handle events by the user
Template.record.events({
  "change #NPlayers" : function(event) {
    var nPlayers = event.target.value;
    Session.set('Record:nPlayers', nPlayers);
    updatePlayers(nPlayers)
    
  },
  "change #player" : function(event) {
    updatePlayers(Session.get('Record:nPlayers'))
  },
  "submit #PlayerId " : function(event) {
    event.preventDefault();
    var nPlayers = Session.get('Record:nPlayers');
    var Players = Session.get('Record:Players');
    for (i = 0; i < Players.length; i++){
      if (WeirdPlayersDB.findOne({name: Players[i].name}) == null) {
        WeirdPlayersDB.insert({name : Players[i].name});    
      }
    }
    Session.set('Record:Players', Players);
  }
});


