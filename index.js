var express = require('express');
var http = require('http');
var bodyParser = require('body-parser');
var cookieParser = require('cookie-parser');
var path = require('path');
var static = require('serve-static');
var session = require('express-session');

/* file upload */
var multer = require('multer');
var cors = require('cors');
var fs = require('fs');

var app = express();
var router = express.Router();
/* Definition */

/* Middleware Setting */
app.set('port', process.env.PORT || 3000);
app.use(cookieParser());
app.use(session({
    secret: 'my key',
    resave: true,
    saveUninitialized: true
}));
app.use(bodyParser.urlencoded({extended:false}));
app.use(bodyParser.json());
app.use('/public', static(path.join(__dirname, 'public')));

app.use('/upload', static(path.join(__dirname, 'upload')));
app.use(cors());

var storage = multer.diskStorage({
    destination: (request, file, callback) => {
        callback(null, 'upload');
    },
    filename: (request, file, callback) => {

        var basename = path.basename(file.originalname);
        var date = Date.now();

        console.log(date + "_" + basename);

        //callback(null, date + "_" + basename);
        callback(null, date + "_" + basename);
    }
});
var upload = multer({
    storage: storage,
    limits:{
        files: 10, /* 한번에 최대 업로드 파일 수 */
        fileSize: 1024 * 1024 * 10, /* 파일의 최대 사이즈 */
    }
});
/* Middleware Setting */
/*
app.get('/', (request, response) => {
    console.log('# GET /');

    response.send('<h1>Hello World!!</h1><a href="mypage">mypage</a>');
});*/

app.get('/', (request, response) => {
    // 업로드 안에 파일 이름 읽기
    fs.readdir("upload", (err, files) => {
        console.log(files.length);
        for(let i=0;i<files.length;i++){
            const directory = `upload/${files[i]}`
            try {
                fs.unlinkSync(directory)
              } catch(err) {
                console.error(err)
              }
        }
      });

    console.log('# GET /upload');

    fs.readFile(path.join(__dirname, '/upload.html'), 'utf8', (err, data) => {
        if(err) throw err;

        console.log('upload.html read');
        
        response.write(data);
        response.end();
    });
});

app.post('/', upload.array('uploadfile'), (request, response) => {
    console.log('# POST /upload');

     /* 업로드된 파일은 request에 담겨있다. */
    var files = request.files;

    console.log('files length : ' + files.length);

    var html = '<h1>파일 업로드 결과</h1>';

    if(files.length > 0){
        files.forEach((file, idx) => {
            console.log('idx : ' + idx);
            console.dir(file);

            html += `
                <div>
                    <img src="upload/${file.filename}">
                </div>
            `
        });
    }
    else{
        console.log('Upload files aren\'t exist');
        html += '<div>파일이 존재하지 않습니다.</div>';
    }

    response.send(html);
});
app.all('*', (request, response) => {

    var html = `
    <h1>Sorry. This page is 404 Error page. We can't take your request.</h1>
    <div><a href="/">return HOME</a></div>
    `;

    response.status(404).send(html);
});
app.use('/', router);

/* Create Server */
var server = http.createServer(app).listen(app.get('port'), () => {
    console.log('Express Server is Running on ' + app.get('port'));
});