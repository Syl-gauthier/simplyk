
function requireGroup(group){
  return function(req, res, next){
    console.log('req.session.group : ' + req.session.group);
    if(req.session.group == group){
      console.log("group correct");
      next();
    }
    else{
      if(req.session.group=='organism'){
        res.redirect('/organism/dashboard');
      }
      else if (req.session.group=='volunteer'){
        res.redirect('/volunteer/map');
      }
      else {
        res.redirect('/');
      }
    }
  }
}

module.exports = {requireGroup: requireGroup};
