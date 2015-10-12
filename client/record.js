// This Line is needed but is also duplicated on the serverside for now
WeirdPlayersDB = new Mongo.Collection("weird_players");
GameRecordDB = new Mongo.Collection("weird_game_record");
WeirdsVariantsDB = new Mongo.Collection("weird_game_variants");

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
  },
  // Inactive records
  inactiveRecords : function() {
    var inactiveRecords = GameRecordDB.find({active : false});
    return inactiveRecords
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
        empty_score.push('');
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
         'variation' : 'Classic', 
         'n_jokers' : 6, 
         'active' : true, 
         'edited' : false,
         'round_number' : 1})
      Router.go('record-update', {'_id' : record_id })
    }
    else {
      Session.set('Record:Message', "Please fix all errors before saving record")
    }
  }
});

// WEIRDPLAYERS_DATALIST template
Template.wgvariant_datalist.helpers({
  WeirdVariant : function() {
    return WeirdsVariantsDB.find();
  } 
});

Template.recordUpdate.helpers({
    disabled_function : function(active_var){
      if (active_var){
        return ''
      }      
      else
      {
        return 'disabled'
      }
    },
    round_num : function() {
      return _.range(this.n_rounds)
    },
    round_num_card : function() {
      data = []
      for (i=0; i<this.round_number; i++) {
        data.push({number : i + 1, cards: this.n_cards_per_round[i]})
      }
      return data
    },
    player_score : function(number) {
      return this.score[number - 1]
    },
    data: function(){
      return GameRecordDB.findOne(this._id);
    },
    check : function(){
//       console.log(this) // how does one access the other helpers?
//       answer, it is not possible. Create another function, and call 
//       that function in both helpers
      return this.round_num
    }
});
Template.recordUpdate.events({
  "change #numberOfJokers": function(event, t) {
    var n_jokers = event.target.value;
    GameRecordDB.update(t.data._id, {$set: 
      {n_jokers: n_jokers}});
  },
  "change #startingNumberCards": function(event, t) {
    var n_starting_cards = event.target.value;
    var n_rounds = n_starting_cards * 2;
    var n_cards_per_round = [];
    for (i=n_starting_cards; i>0; i--){
      n_cards_per_round.push(i);
    }
    for (i=1; i<=n_starting_cards; i++){
      n_cards_per_round.push(i);
    }
//     if (t.data.players[0].score.length < n_rounds){
      for (i=0; i < n_rounds - t.data.players[0].score.length; i++){
        for (j=0; j < t.data.players.length; j++){
          t.data.players[j].score.push('');
        }
      }
//     }
    var round_number = t.data.round_number;
    if (round_number > n_rounds){
      round_number = n_rounds;
    }
    GameRecordDB.update(t.data._id, {$set: 
      {n_rounds: n_rounds,
      n_starting_cards: n_starting_cards,
      n_cards_per_round: n_cards_per_round,
      round_number: round_number
       }});
  },
  "change #variant" : function(event, t) {
      var variant = event.target.value;
      GameRecordDB.update(t.data._id, {$set: {'variation': variant}});
      if (WeirdsVariantsDB.findOne({name: variant}) == undefined) {
        WeirdsVariantsDB.insert({name: variant})
      }
  },
  "change .player_score_input" : function(event, t) {
    var player_number = event.target.name;
    var round = event.target.id;
    record = GameRecordDB.findOne(t.data._id)    ;
    t.data.players[player_number].score[round - 1] = event.target.value;
    GameRecordDB.update(t.data._id, {$set: {"players": t.data.players}});

    var done_round = true
    var round_number = t.data.round_number
    var Players = t.data.players
//     console.log(Players)
    for (i=0; i<Players.length; i++){
        for (j=0; j<round_number; j++){
          if (Players[i].score[j] == '') {
            done_round = false
          }
        }
    }
    if (done_round & (round_number < t.data.n_rounds)){
        round_number += 1
    }    
    GameRecordDB.update(t.data._id, {$set: {"round_number":round_number}})
  },
  "click .finish_game" : function(event, t) {
      event.preventDefault()
      GameRecordDB.update(t.data._id, {$set: {"active": false}})
  },
  "click .edit_game" : function(event, t) {
      event.preventDefault()
      GameRecordDB.update(t.data._id, {$set: {"active": true, "edited": true}})
  }
});