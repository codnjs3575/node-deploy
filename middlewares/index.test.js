const { isLoggedIn, isNotLoggedIn } = require('./')

// describe : test를 그룹화해주는 역할
// ㄴ 첫 번째 인수 : 그룹에 대한 설명
// ㄴ 두 번째 인수 : 함수, 그룹에 대한 내용
describe('isLoggedIn', () => {
  // mocking) 가짜 res 객체 만듦.(+ status, send, redirect)
  const res = {
    status: jest.fn(() => res), // 메서드체이닝이 가능하도록 res 반환
    send: jest.fn(),
  }

  // mocking) 가짜 next 함수도 만듦.
  const next = jest.fn()

  // isLoggedIn 테스트 1 -> req(응답)가 true일 때
  test('로그인되어 있으면 isLoggedIn이 next를 호출해야 함', () => {
    // mocking) 가짜 req 객체 만듦.
    // ㄴ 왜 test 함수 안에 선언?
    // ㄴ res는 여러 테스트에서도 사용하는 모양이 같으므로 재활용 가능하지만,
    // ㄴ req는 내부 내용이 다르므로 각각의 test에서 따로 선언해야 함.
    const req = {
      // mocking) isAuthenticated이 true를 반환하도록
      //  ㄴ isAuthenticated : 로그인 여부를 알려주는 함수
      isAuthenticated: jest.fn(() => true),
    }
    isLoggedIn(req, res, next)
    expect(next).toBeCalledTimes(1)
    // toBeCalledTimes : 정확하게 몇 번 호출되었는지를 체크하는 메서드
  })

  // isLoggedIn 테스트 2 ->  req(응답)가 false일 때
  test('로그인되어 있지 않으면 isLoggedIn이 에러를 응답해야 함', () => {
    // mocking) 가짜 req 객체 만듦.
    const req = {
      // mocking) isAuthenticated이 false를 반환하도록
      isAuthenticated: jest.fn(() => false),
    }
    isLoggedIn(req, res, next)
    expect(res.status).toBeCalledWith(403)
    // toBeCalledWith(인수) : 특정 인수와 함께 호출되었는지 체크하는 메서드
    expect(res.send).toBeCalledWith('로그인 필요')
  })
})

describe('isNotLoggedIn', () => {
  const res = {
    redirect: jest.fn(),
  }
  const next = jest.fn()
  test('로그인되어 있으면 isNotLoggedIn이 에러를 응답해야 함', () => {
    const req = {
      isAuthenticated: jest.fn(() => true),
    }
    isNotLoggedIn(req, res, next)
    const message = encodeURIComponent('로그인한 상태입니다.')
    expect(res.redirect).toBeCalledWith(`/?error=${message}`)
  })

  test('로그인되어 있지 않으면 isNotLoggedIn이 next를 호출해야 함', () => {
    const req = {
      isAuthenticated: jest.fn(() => false),
    }
    isNotLoggedIn(req, res, next)
    expect(next).toHaveBeenCalledTimes(1)
  })
})
