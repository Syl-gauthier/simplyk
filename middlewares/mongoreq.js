Opp.find({oName: req.user.customData.oname}, function(err, opps){
	if(err){
		console.log(err);
		res.render('dashboard.jade', {session: req.session});
	}
	//Create opps list
	else{
		res.render('dashboard.jade', {opps: opps, session: req.session});
	}
});