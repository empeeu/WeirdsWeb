Router.map( function() {
  this.route('home', {
    path: '/'
  });
});

Router.map( function() {
  this.route('rules');
  this.route('record');
  this.route('lobby');
  this.route('game', {
    path: '/game/:_id',
    data: function(){
      template_data = {
        _id : this.params._id
      };
      return template_data;
    }
  });
});
