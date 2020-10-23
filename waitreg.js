var fs = require("fs");
function regfile_tep(regdata){
	

	//	console.log("准备写入文件");
	let fileName=__dirname+'/file/input.txt';

	fs.open(fileName, "a+", function(err, fd){
		if (err) {
			return console.error(err);
		}
		fs.writeFile(fd, '\n'+regdata, function(err){
			if (err){
				return console.error(err);
				}
			});
	});
}
module.exports={regfile_tep}