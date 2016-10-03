function requireGroup(group1, group2) {
  return function(req, res, next) {
    console.log('req.session.group : ' + req.session.group);
    if (req.session.group == undefined) {
      res.redirect('/');
    }
    else if (req.session.group == group1 || (req.session.group == group2 && group2 != undefined)) {
      console.log("group correct");
      next();
    } else {
      if (req.session.group == 'organism') {
        res.redirect('/organism/dashboard');
      } else if (req.session.group == 'volunteer') {
        res.redirect('/volunteer/map');
      } else if (req.session.group == 'admin') {
        res.redirect('/admin/classes');
      } else {
        res.redirect('/');
      }
    }
  }
}

module.exports = {
  requireGroup: requireGroup
};