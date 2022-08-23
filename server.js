// Node.js, Express FW를 활용하여 간단한 Backend 서버 구성

const express = require('express'); // express 패키지 import

const dotenv = require('dotenv');
dotenv.config();

const app = express();

const clientId = process.env.CLIENT_ID;
const clientSecret = process.env.CLIENT_SECRET;

const request = require('request');

// express의 static 미들웨어 활용
app.use(express.static('public')); //express한테 static 파일들의 경로가 어디에 있는지 명시

// express의 json 미들웨어 활용
app.use(express.json());

// 일반적으로 /를 root 경로라고 함
// root url: 127.0.0.1:3000/
// IP주소: 127.0.0.1, Port: 3000
// 127.0.0.1의 Domain name: localhost -> http://localhost:3000
// app.get() -> 첫 번째 인수로 지정한 경로로 클라이언트로부터 요청(request)이 들어왔을 때
// 두 번째 인수로 작성된 콜백함수가 호출되면서 동작함
// 그 콜백함수는 2개의 인수(arguments)를 받음, 1. request(줄여서 req), response(res)
// HTTPServletRequest, HTTPServletResponse정도 개념
app.get('/', (req, res) => {
    // res.send('응답 완료!'); // 동작 확인용
    // root url, 즉, 메인 페이지로 접속했을 때, 우리가 만든 Node 서버는 papago의 메인 화면인 public/index.html을 응답해줘야 함
    res.sendFile('index.html');
});

//localhost:3000/detectLangs 경로로 요청했을 때
app.post('/detectLangs', (req, res) => {
    console.log('/detectLangs로 요청됨');
    console.log(req.body);
    //request.getParameter('name');

    // text프로퍼티에 있는 값을 query라는 이름의 변수에 담고 싶고, targetLanguage는 그 이름 그대로 동일한 이름의 변수로 담고 싶음

    const { text: query, targetLanguage } = req.body;

    console.log(query, targetLanguage); // query: 입력한 테스트, targetLanguage: en, ko 등

    // 실제 papago 서버에 요청 전송
    const url = 'https://openapi.naver.com/v1/papago/detectLangs'; // 택배를 보낼 주소
    const options = { // options: 택배를 보낼 물건
        url,
        form: { query: query },
        headers: {
            'X-Naver-Client-Id': clientId,
            'X-Naver-Client-Secret': clientSecret,
        },
    };

    // 실제 언어감지 서비스 요청 부분
    // options라는 변수에 요청 전송 시 필요한 데이터 및 보낼 주소를 동봉한다(enclose)
    // () =? {}: 요청에 따른 응답 정보를 확인하는 부분
    request.post(options, (error, response, body) => {
        if (!error && response.statusCode === 200) { // 응답이 성공적으로 완료되었을 경우
            // body를 parsing처리
            const parsedData = JSON.parse(body); // {"langCode":"ko"}
            //papago 번역 url('/translate')로 redirect(요청 재지정)
            res.redirect(`translate?lang=${parsedData['langCode']}&targetLanguage=${targetLanguage}&query=${query}`);

        }else { // 응답이 실패했을 경우
            console.log(`error = ${response.statusCode}`);
        }
    });

})

// papago 번역 요청 부분
app.get('/translate', (req, res) => {
    const url = 'https://openapi.naver.com/v1/papago/n2mt';
    console.log(req.query);
    
    options = { // options: 택배를 보낼 물건
        url,
        form: { 
            source: req.query.lang, // 원본 언어 코드
            target: req.query.targetLanguage, // 번역하고자 하는 언어의
            text: req.query.query, // 번역하고자 하는 텍스트
        },
        headers: {
            'X-Naver-Client-Id': clientId,
            'X-Naver-Client-Secret': clientSecret,
        },
    };

    // 실제 번역 요청 전송부분
    request.post(options, (error, response, body) => {
        if (!error && response.statusCode === 200) { // 응답이 성공적으로 완료되었을 경우
            // body를 parsing처리
            // const data = JSON.parse(body);
            res.send(body); // front에 해당하는 app.js에 papago로부터 받은 응답 데이터(body)를 app.js로 응답함
            

        }else { // 응답이 실패했을 경우
            console.log(`error = ${response.statusCode}`);
        }
    });
})

//서버가 실행되었을 때 몇 번 포트에서 실행시킬 것인지
app.listen(3000, () => console.log('http://127.0.0.1:3000/ app listening on port 3000'));

 // Node.js기반의 js파일 실행 시에는 node로 시작하는 명령어에 파일명까지 작성하면 됨
 // ex) node server.js -> 노드야 server.js 파일 좀 실행해줘
 // 이 맥락에서는 server.js는 express fw로 구성한 백엔드 서버 실행 코드가 담겨있음