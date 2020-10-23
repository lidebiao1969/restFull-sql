var express = require("express");
const cors = require("cors");
var app = express();
var bodyParser = require("body-parser");

var loginsql =require('./common/loginsql')


//处理post字段请求
		app.use(bodyParser.json());
		app.use(bodyParser.urlencoded({ extended: true }));
		app.use(cors());

		
	
// 网站正在维护ismaintain = true;
		app.use((req, res, next) => {
			let ismaintain = false;
			if (ismaintain) {
				res.send("网站正在维护");
			} else {
				next();
			}
		});
		
	
	//路由处理	
	app.use("/user",loginsql);	
		
		
	// ----------除/user/login及/user/register 路径外，其余均需token 验证。--无论get或post------------------------------	
	app.use(function(req, res, next) {
			// console.log("req.url :  " + req.url);
			console.log("req.headers : ");
			console.log(req.headers);
			console.log("req.body : ");
			console.log(req.body);
		if (req.url != "/user/login" && req.url != "/user/register") {
        //token可能存在post请求和get请求
			let token = req.body.token || req.query.token || req.headers.token;
			// console.log("token : ");
			// console.log(token);
        jwt.verify(token, secretkey, function(err, decode) {
            if (err) {
                res.json({
                    message: "token过期，请重新登录",
                    resultCode: "403",
                });
					} else {
						//res.json({msg:'ok'});  // 不知加这一句会短路不？
						next();
					}
				});
			} else {
				console.log('向下走');
				next();
			}
		});
		/* get首页 */
		app.get("/", function(req, res) {
			res.send("请求home成功");
		});
			/* post 首页 */
		app.post("/", function(req, res) {
			res.send("请求post home成功");
		});
/* --------------------------------------------------- */
		

	//报错处理，不会死机。
				app.use((err, req, res, next) => {
							if (err) {
							  return  res.status(500).send(err.message);
							}
				});

// 放在最后
		app.use((req, res, next) => {
			res.status(404).send("当前页面不存在。404");
		});

		app.listen(3000);
		console.log("服务器已运行:http://localhost:3000");
		console.log((new Date()).toLocaleString());