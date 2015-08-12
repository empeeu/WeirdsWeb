// This Line is needed but is also duplicated on the serverside for now
WeirdPlayersDB = new Mongo.Collection("weird_players");
GameRecordDB = new Mongo.Collection("weird_game_record");

// The number of players, and default player names
Session.setDefault('Record:nPlayers', 2)
Session.setDefault('Record:Players', [{'order' : 0, 'name' : ''}, {'order' : 1, 'name': ''}])
Session.setDefault('Record:Message', '')


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
  },
  // Messages to help user
  Message : function () {
    return Session.get('Record:Message');
  },
  // Active records
  activeRecords : function() {
    var activeRecords = GameRecordDB.find({active : true});
    return activeRecords
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
    }
    if (Players[i].name == '') {
      Players[i].error = " Pick a player or add a new one."
    }
    else if (checkDupName(Players, i)){
      Players[i].error = " Same player cannot play twice!"  
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
Template.recordActive.events({
  "click #ag_delete " : function(event) {
    event.preventDefault();
    var id = event.target.name;
    GameRecordDB.remove(id);
  }
});

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
    updatePlayers(nPlayers)
    var valid = true;
    for (i = 0; i < Players.length; i++){
      if (Players[i].error != null) {
        valid = false;
      }
      if (Players[i].name == '') {
        valid = false;
      }
      if (WeirdPlayersDB.findOne({name: Players[i].name}) == null) {
        WeirdPlayersDB.insert({name : Players[i].name});    
      }
    }
    Session.set('Record:Players', Players);
    if (valid){
      Session.set('Record:Message', "")
      var record;
      var n_rounds = 16; // default number of rounds
      // Make an empty score structure to initialize score for players
      empty_score = [];
      for (i=0; i<n_rounds; i++){
        empty_score.push(i);
      }
      for (i=0; i<Players.length; i++){
        Players[i].score = empty_score;
      }
      record_id = GameRecordDB.insert({
         'players' : Players,
         'n_players' : nPlayers,
         'date' : new Date(),
         'n_rounds' : n_rounds,
         'n_starting_cards' : 8,
         'n_cards_per_round' : [8, 7, 6, 5, 4, 3, 2, 1, 1, 2, 3, 4, 5, 6, 7, 8],
         'irregular' : false,
         'variation' : 'standard', 
         'n_jokers' : 6, 
         'active' : true, 
         'round_number' : 1})
      Router.go('record-update', {'_id' : record_id })
    }
    else {
      Session.set('Record:Message', "Please fix all errors before saving record")
    }
  }
});

Template.recordUpdate.helpers({
    round_num : function() {
      return _.range(this.n_rounds)
    },
    data: function(){
      return GameRecordDB.findOne(this._id);
    },
    check : function(){
      console.log(this) // how does one access the other helpers?
      return this.round_num
    }
});
Template.recordUpdate.events({
  "change input" : function(event) {
    var player_number = event.target.name
    var round = event.target.id
    record = GameRecordDB.findOne(this._id)
    record.players[player_number][round] = event.target.value
    GameRecordDB.update(this._id, {"players": record.players})
  }
});

Template.recordUpdate.events({
  "change #round_score": function(e, t){
     var done_round = true
     var round_number = t.data.round_number
     var scores = e.target.form['round_score']
     var Players = t.data.players
     console.log(scores)
     for (i=0; i<Players.length; i++){
       for (j=0; j<round_number; j++){
              Players[i].score[j] = Number(scores[j + i * round_number].value);
       }
       if (scores[j].value == '') {
         done_round = false
       }
       if (done_round & (round_number < t.data.n_rounds)){
         round_number += 1
       }
       GameRecordDB.update(t.data._id, {$set: {"round_number":round_number, 'players' : Players}})
     }
  }
})

