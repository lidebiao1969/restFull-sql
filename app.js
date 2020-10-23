var express = require("express");
const cors = require("cors");

var wreg=require('./waitreg.js')


var app = express();
var bodyParser = require("body-parser");
var jwt = require("jsonwebtoken");
var secretkey = "secretkey";

//获取数据库连接对象
var connection = require("./mysql/db");
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
			//用户登录
		app.post("/user/login", (req, res) => {
			console.log("req.body login: ");
			console.log(req.body);
			console.log((new Date()).toLocaleString());
			var name = req.body.username;
			var passwd = req.body.password;
			if (!name || !passwd) {
				res.status = "404";
				res.send({
					message: "用户名或密码错误",
					resultCode: 1,
				});
				return;
			}
			var userStr = `select * from tabletest where username="${name}" and password="${passwd}"`;
			connection.query(userStr, function(err, result) {
				console.log({result:result})
				if (err) {
					throw err;
					}
				if(result==''){
					res.send({msg:"注册错误"})
				}else {
					var token = jwt.sign({ username: name }, secretkey, {
						expiresIn: 3600000 * 72,
					});
					res.json({
						message: "请求成功",
						token: token,
					});
					/* console.log({
						message: "请求成功",
						token: token,
					}); */
				}
			});
		});

//获取用户列表，查所有
		app.post("/user/getList", (req, res) => {
			var listStr = `select * from tabletest`;
			console.log("listStr : " + listStr)
			connection.query(listStr, function(err, result) {
				if (err) throw err;
				res.json({
					message: "请求成功",
					resultCode: 1,
					info: result,
				});
			});
		});
		
	//根据用户名查找	SELECT * FROM `tabletest` WHERE `username` LIKE '小张'
	//联合查找   SELECT * FROM `tabletest` WHERE `sex` = '男' AND `age` = 13
	app.post("/user/getbyusername", (req, res) => {
		var name = req.body.username;
		var listStr = `SELECT * FROM tabletest WHERE username LIKE "${name}"`;
		console.log("listStr : " + listStr)
		connection.query(listStr, function(err, result) {
			if (err) throw err;
			if(result==''){
				res.send({msg:"没有找到此用户"})
			}else {
			res.json({
				message: "请求成功",
				resultCode: 1,
				info: result,
				});
			}
		});
	});
	
		
		
	//用户注册
 		app.post("/user/register", (req, res) => {
			var name = req.body.username;
			var passwd = req.body.password;
			var sex = req.body.sex;
			var age = req.body.age;
			var hobby = req.body.hobby;

			if (!name || !passwd) {
				res.send({
					message: "用户名或密码错误",
					resultCode: 1,
				});
				return;
			}

			var json = {};
			var userStr = `select * from tabletest 
				  where username="${name}" and password="${passwd}"`;
			connection.query(userStr, function(err, result) {
				if (err) throw err;
				if (result.length > 0) {
					json.message = "请求失败用户已经存在";
					json.resultCode = 1;
				} else {
					json.message = "请求成功";
					json.resultCode = 0;
					var insertStr = `insert into tabletest (username, password,sex,age,hobby) values ("${name}", "${passwd}","${sex}","${age}","${hobby}")`;
					console.log(insertStr);
					connection.query(insertStr, function(err, res) {
						if (err) throw err;
					});
				}
				res.send(JSON.stringify(json));
			});
		}); 
		
		//准备注册数据
		
	app.post("/user/wreg", (req, res) => {
				var name = req.body.username;
				var passwd = req.body.password;
				var sex = req.body.sex;
				var age = req.body.age;
				var hobby = req.body.hobby;
	
				if (!name || !passwd) {
					res.send({
						message: "用户名或密码错误",
						resultCode: 1,
					});
					return;
				}	
				var data=JSON.stringify(req.body);
				//写入
				wreg.regfile_tep(data);
				res.send({msg:"ok!"})
				});
		

/* ----------------插入数据----------------------------------- */

app.post("/user/addData", (req, res) => {
	var name = req.body.username;
	var passwd = req.body.password;
	var sex = req.body.sex;
	var age = req.body.age;
	var hobby = req.body.hobby;
	
	var  addSql = 'INSERT INTO tabletest (id,username, password,sex,age,hobby) VALUES(0,?,?,?,?,?)';
	var  addSqlParams =[name, passwd,sex,age, hobby ];
	connection.query(addSql,addSqlParams,function (err, result) {
	        if(err){
	         console.log('[INSERT ERROR] - ',err.message);
	         return  res.send({msg:"error"});
	        }        
	 
	       console.log('--------------------------INSERT----------------------------');
	            res.send(JSON.stringify(result));
	       console.log('INSERT ID:',result);        
	       console.log('-----------------------------------------------------------------\n\n');  
	});
	
});

		/* 更新 主要是忘记密码。须修改*/
		 app.post("/user/updateData", (req, res) => {
			var username = req.body.username;
			var passwd= req.body.password;
			
			var modSql = 'UPDATE tabletest SET password = ? WHERE username = ?';
			var modSqlParams = [passwd, username];
			//改
			connection.query(modSql,modSqlParams,function (err, result) {
			   if(err){
			         console.log('[UPDATE ERROR] - ',err.message);
			         return;
			   }        
			  console.log('--------------------------UPDATE----------------------------');
			  console.log('UPDATE affectedRows',result.affectedRows);
			   res.send({'UPDATE affectedRows':result.affectedRows});
			  console.log('-----------------------------------------------------------------\n\n');
			});
			
			});
			
			/* 删除某用户 */
 	app.post("/user/deluser", (req, res) => {
		var username = req.body.username;
		var delSql = `DELETE FROM  tabletest where username="${username}"`;
		console.log("delSql",delSql);
		connection.query(delSql,function (err, result) {
		        if(err){
		          console.log('[DELETE ERROR] - ',err.message);
		          return;
		        }        
		 
		       console.log('--------------------------DELETE----------------------------');
			   
		       console.log('DELETE affectedRows',result.affectedRows);
			   res.send({'DELETE affectedRows':result.affectedRows})
		       console.log('-----------------------------------------------------------------\n\n');  
		});
		   
		
		
	});

//替换UPDATE `mydb`.`tabletest` SET `username` = REPLACE(`username`, '小王', '王') WHERE `username` LIKE '%小王%' COLLATE utf8mb4_bin
//根据某索引查找并替换查找内容，如根据用户名查找并修改用户名








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