const { createLogger, format, transports } = require('winston')

const logger = createLogger({
  level: 'info', // 로그의 심각도 // (심한 순서) error, warn, info, verbose, debug, silly
  format: format.json(), // 로그의 형식 // json(기본), label, timestamp(로그 기록 시간 표시에 유용), printf, simple, combine(여러 형식을 혼합해서 사용)
  transports: [
    // 로그의 저장 방식
    // new transports.File : 파일로 저장하는 메서드
    // ㄴ level, format 등 설정 가능
    new transports.File({ filename: 'combined.log' }),
    new transports.File({ filename: 'error.log', level: 'error' }),
  ],
})

if (process.env.NODE_ENV !== 'production') {
  // new transports.Console : 콘솔에 출력
  logger.add(new transports.Console({ format: format.simple() }))
}

module.exports = logger
