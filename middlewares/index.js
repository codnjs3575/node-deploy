// req: isAuthenticated 메서드 존재
// res : status, send, redirect 메서드 존재
// 코드가 성공적으로 실행되게 하려면 이것들을 모두 구현해야 함

// 그렇다면 테스트 환경에서는 어떻게 구현할 수 있을까?
// 가짜 객체와 함수를 만들어내면 됨. -> mocking (모킹)
exports.isLoggedIn = (req, res, next) => {
  if (req.isAuthenticated()) {
    next()
  } else {
    res.status(403).send('로그인 필요')
  }
}

exports.isNotLoggedIn = (req, res, next) => {
  if (!req.isAuthenticated()) {
    next()
  } else {
    const message = encodeURIComponent('로그인한 상태입니다.')
    res.redirect(`/?error=${message}`)
  }
}
