jest.mock('../models/user') // 모듈 모킹
// jest.mock 메서드에 모듈의 경로를 인수로 넣고 그 모듈을 불러옴
// 해당 모듈(User)의 메서드는 전부 가짜 메서드가 됨
// 가짜 메서드에는 mockReturnValue 등의 메서드가 생성됨
const User = require('../models/user')

const { follow } = require('./user')
// ㄴ follow 컨트롤러 안에는 User라는 모델이 들어 있음.
// ㄴ 이 모델은 실제 DB와 연결되어 있으므로 테스트 환경에서는 사용할 수 없음
// ㄴ 따라서 User 모델로 모킹해야 함 -> 1,2번 줄

describe('follow', () => {
  const req = {
    user: { id: 1 },
    params: { id: 2 },
  }

  const res = {
    status: jest.fn(() => res),
    send: jest.fn(),
  }

  const next = jest.fn()

  test('사용자를 찾아 팔로잉을 추가하고 sucess를 응답해야 함', async () => {
    // User.findOne이 { addFollowing() } 객체를 반환하도록 함 : 사용자 찾음
    User.findOne.mockReturnValue({
      addFollowing(id) {
        return Promise.resolve(true)
      },
    })
    await follow(req, res, next)
    expect(res.send).toBeCalledWith('success')
  })
  test('사용자를 못 찾으면 res.status(404).send(no user)를 호출함', async () => {
    User.findOne.mockReturnValue(null) // null 반환 : 사용자 찾지 못 함
    await follow(req, res, next)
    expect(res.status).toBeCalledWith(404)
    expect(res.send).toBeCalledWith('no user')
  })
  test('DB에서 에러가 발생하면 next(error)를 호출함', async () => {
    const message = 'DB에러'
    User.findOne.mockReturnValue(Promise.reject(message)) // 에러 발생하도록
    await follow(req, res, next)
    expect(next).toBeCalledWith(message)
  })
})
