if (Meteor.isClient) {
  Template.game.helpers({
    room_name: function(){
      var currentRoute = Router.current();
      if (currentRoute) {
        return currentRoute.params._id
      } else {
        return ""
      }
    } 
  });
}

if (Meteor.isServer) {
  Meteor.startup(function () {
    // code to run on server at startup
  });
}

