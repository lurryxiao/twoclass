var querystring = require("querystring");
function login(response,postData) {
	console.log("Request handler 'login' was called.");
	if(postData){
		console.log("data is ." + querystring.parse(postData).name);
		var mq = require("mysql");
	  var mc = mq.createConnection({
		host: "localhost",
		user: "root",
		password: "",
		database: "trynodejs"
	  });
	  mc.connect();
	  mc.query("select id,username from user limit 1", function(err, rs, fields){
		if(err){
			console.log(err);
			response.writeHead(200, {"Content-Type": "text/html"});
			response.write('database connected wrong<a href="/login">·µ»ØµÇÂ½</a>');
			response.end();
		}else{
			console.log(rs[0]['username']+'ok');
			if(querystring.parse(postData).name == rs[0]['username']){
				var infobody = '<html>'+
    '<head>'+
    '<meta http-equiv="Content-Type" content="text/html; '+
    'charset=utf-8" />'+
    '</head>'+
    '<body>'+
    '<table width="100%">'+
    '<tr><th>old</th><th>new</th><th>time</th></tr>';
    mc.query("select * from content where uid = " + rs[0]['id'], function(err, rs1, fields){
		console.log(rs1);
		for(var i = 0;i < rs1.length;i ++){
			infobody += '<tr><td>'+rs1[i]['content'] + '</td><td>' + rs1[i]['result']+ '</td><td>' + rs1[i]['dotime'] + '</td></tr>';
		}
		response.writeHead(200, {"Content-Type": "text/html"});
				response.write(infobody + '</table><div><form method="post" action="/start"><input type="hidden" name="uid" value="' + rs[0]['id'] + '" /><input type="submit" value="Getrank" /></form></div>'+
    '</body>'+
    '</html>');
			response.end();
	});
			}else{
				response.writeHead(200, {"Content-Type": "text/html"});
			    response.write('<script>alert("It is wrong name");history.go(-1);</script>');
			    response.end();
			}
		}
	  });
	  return false;
	}
	var body = '<html>'+
    '<head>'+
    '<meta http-equiv="Content-Type" content="text/html; '+
    'charset=utf-8" />'+
    '</head>'+
    '<body>'+
    '<form action="/login" method="post">'+
    '<input name="name" />'+
    '<input type="submit" value="login" />'+
    '</form>'+
    '</body>'+
    '</html>';
    response.writeHead(200, {"Content-Type": "text/html"});
    response.write(body);
    response.end();
}
function start(response, postData) {
  console.log("Request handler 'start' was called."+querystring.parse(postData).uid);
  var uid = querystring.parse(postData).uid;
  var body = '<html>'+
    '<head>'+
    '<meta http-equiv="Content-Type" content="text/html; '+
    'charset=UTF-8" />'+
    '</head>'+
    '<body>'+
    '<form action="/upload" method="post">'+
    '<input name="uid" type="hidden" value="'+uid+'" /><textarea name="text" rows="20" cols="60"></textarea>'+
    '<input type="submit" value="Submit text" />'+
    '</form>'+
    '</body>'+
    '</html>';
    response.writeHead(200, {"Content-Type": "text/html"});
    response.write(body);
    response.end();
}
var co1 = 0;
var co2 = 0;

function upload(response, postData) {
  console.log("Request handler 'upload' was called.");
  response.writeHead(200, {"Content-Type": "text/plain"});
  var str = querystring.parse(postData).text;
  var strs = str.split(',');
  var string = new Array();
  for(var i = 0;i < strs.length;i ++){
	 string.push(parseInt(strs[i]));
  }
  var startTime = new Date().getTime();
  var newstr = rank(string);
  var c1 = co1;var c2 = co2;
  var endTime = new Date().getTime();
  var dotime = endTime - startTime;
  var uid = querystring.parse(postData).uid;
  var mq = require("mysql");
  var mc = mq.createConnection({
	host: "localhost",
    user: "root",
    password: "",
	database: "trynodejs"
  });
  mc.connect();
  mc.query("INSERT INTO content SET uid="+uid+",content='"+querystring.parse(postData).text+"',result='"+newstr+"',len="+strs.length+",co1="+c1+",co2="+c2+",dotime="+dotime, function(err, rs, fields){
    if(err){
		console.log(err);
		response.writeHead(200, {"Content-Type": "text/html"});
	    response.write('<script>alert("something is wrong!");history.go(-1);</script>');
	    response.end();
	}else{
		console.log(rs);
		response.writeHead(200, {"Content-Type": "text/html"});
	    response.write('<script>alert("success!The result is '+newstr+'");window.location.href="/login"</script>');
	    response.end();
	}
  });
}

 function rank(arrs){
	 console.log(co1);
	if(arrs.length <= 1){
		co2 ++ ;
		return arrs;
	}
	var len = arrs.length;
	var m = parseInt((len - 1) / 2);
	var left = new Array();
	var right = new Array();
	for(var i = 0;i < len;i ++){
		if(arrs[i] < arrs[m]){
			left.push(arrs[i]);
		}else if(arrs[i] != arrs[m]){
			right.push(arrs[i]);
		}
	}
	co1 ++;
	return rank(left).concat([arrs[m]],rank(right));
}

exports.start = start;
exports.upload = upload;
exports.login = login;