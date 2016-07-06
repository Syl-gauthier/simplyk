
function requireGroup(group){
  return function(req, res, next){
    console.log(req.session.group);
    if(req.session.group == group){
      console.log("group correct");
      next();
    }
    else{
      res.sendStatus(403);
    }
  }
}

module.exports = {requireGroup: requireGroup};
