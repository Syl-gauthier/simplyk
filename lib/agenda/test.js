module.exports = function(agenda){
	agenda.define('testJob', function(job, done){
		console.info('The job testJob has been trigerred and job.attrs.data.text is : ' + job.attrs.data.text);
	})
};