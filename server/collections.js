WeirdPlayersDB = new Mongo.Collection("weird_players");
GameRecordDB = new Mongo.Collection("weird_game_record");
WeirdsVariantsDB = new Mongo.Collection("weird_game_variants");

if (WeirdsVariantsDB.findOne() == undefined) {
    WeirdsVariantsDB.insert({name: "Classic"})
    WeirdsVariantsDB.insert({name: "Wacky"})
}
