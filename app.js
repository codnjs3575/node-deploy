const express = require('express')
const cookieParser = require('cookie-parser')
const morgan = require('morgan')
const path = require('path')
const session = require('express-session')
const nunjucks = require('nunjucks')
const dotenv = require('dotenv')
const passport = require('passport')
const helmet = require('helmet')
const hpp = require('hpp')
const redis = require('redis')
const ReidsStore = require('connect-redis')(session) // session을 인수로 넣어서 호출. connect-redis는 express-session에 의존성이 있음

dotenv.config() // -> process.env 객체 값들을 불러올 수 있음
// redis 패키지의 createClient 메서드로 redisClient 객체 생성
const redisClient = redis.createClient({
  url: `redis://${process.env.REDIS_HOST}:${process.env.REDIS_PORT}`,
  password: process.env.REDIS_PASSWORD,
  legacyMode: true,
})
redisClient.connect().catch(console.error)
const pageRouter = require('./routes/page')
const authRouter = require('./routes/auth')
const postRouter = require('./routes/post')
const userRouter = require('./routes/user')
const { sequelize } = require('./models')
const passportConfig = require('./passport')
const logger = require('./logger')

const app = express()
passportConfig() // 패스포트 설정
app.set('port', process.env.PORT || 8001)
app.set('view engine', 'html')
nunjucks.configure('views', {
  express: app,
  watch: true,
})
sequelize
  .sync({ force: false })
  .then(() => {
    console.log('데이터베이스 연결 성공')
  })
  .catch((err) => {
    console.error(err)
  })

// 15-1. 배포용 설정) morgan
if (process.env.NODE_ENV === 'production') {
  app.use(morgan('combined'))
  app.use(
    helmet({
      contentSecurityPolicy: false,
      crossOriginEmbedderPolicy: false,
      crossOriginResourcePolicy: false,
    })
  )
  app.use(hpp())
} else {
  app.use(morgan('dev'))
}

// app.use(morgan('dev'))
app.use(express.static(path.join(__dirname, 'public')))
app.use('/img', express.static(path.join(__dirname, 'uploads')))
app.use(express.json())
app.use(express.urlencoded({ extended: false }))
app.use(cookieParser(process.env.COOKIE_SECRET))

// 15-1. 배포용 설정) express-sesion
const sessionOption = {
  resave: false,
  saveUninitialized: false,
  secret: process.env.COOKIE_SECRET,
  cookie: {
    httpOnly: true,
    secure: false,
  },
  // 메모리가 아닌 ReidsStore에 세션을 저장함 -> 서버를 껐다켜도 로그인 유지 가능
  store: new ReidsStore({ client: redisClient }),
}
if (process.env.NODE_ENV === 'production') {
  sessionOption.proxy = true // https 적용을 위해 노드 서버 앞에 다른 서버를 뒀을 때에만 사용
  // sessionOption.cookie.secure = true // https 적용할 때에만 true
}

app.use(session(sessionOption))
app.use(passport.initialize())
app.use(passport.session())

app.use('/', pageRouter)
app.use('/auth', authRouter)
app.use('/post', postRouter)
app.use('/user', userRouter)

app.use((req, res, next) => {
  const error = new Error(`${req.method} ${req.url} 라우터가 없습니다.`)
  error.status = 404
  logger.info('hello')
  logger.error(error.message)
  next(error)
})

app.use((err, req, res, next) => {
  res.locals.message = err.message
  res.locals.error = process.env.NODE_ENV !== 'production' ? err : {}
  res.status(err.status || 500)
  res.render('error')
})

module.exports = app

// app.listen(app.get('port'), () => {
//   console.log(app.get('port'), '번 포트에서 대기중')
// })
