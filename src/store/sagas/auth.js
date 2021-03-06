import { delay } from 'redux-saga'
import { put, call } from 'redux-saga/effects'

import axios from 'axios'
import * as actions from '../auth/actions'

const API_KEY = 'AIzaSyDS6ROlvggkPNK1k-cw9M4CNggWdrl6CqQ'
const AUTH_URL = 'https://www.googleapis.com/identitytoolkit/v3/relyingparty'

export function* logoutSaga (action) {
  yield call([localStorage, 'removeItem'], 'token')
  yield call([localStorage, 'removeItem'], 'expirationDate')
  yield call([localStorage, 'removeItem'], 'userId')
  yield put(actions.logoutSucceed())
}

export function* checkAuthTimeoutSaga (action) {
  yield delay(action.expirationTime * 1000)
  yield put(actions.logout())
}

export function* authUserSaga (action) {
  yield put(actions.authStart())
  const authData = {
    email: action.email,
    password: action.password,
    returnSecureToken: true
  }
  let url = `${AUTH_URL}/signupNewUser?key=${API_KEY}`
  if (!action.isSignup) {
    url = `${AUTH_URL}/verifyPassword?key=${API_KEY}`
  }
  try {
    const response = yield axios.post(url, authData)
    const expirationDate = yield new Date(new Date().getTime() + response.data.expiresIn * 1000)
    yield localStorage.setItem('token', response.data.idToken)
    yield localStorage.setItem('userId', response.data.localId)
    yield localStorage.setItem('expirationDate', expirationDate)
    yield put(actions.authSuccess(response.data.idToken, response.data.localId))  
    yield put(actions.checkAuthTimeout(response.data.expiresIn))

  } catch (err) {
    yield put(actions.authFail(err.response.data.error))
  }
}

export function* authCheckStateSaga (params) {
  const token = yield localStorage.getItem('token')
  if (!token) {
    yield put(actions.logout())
  } else {
    const expirationDate = yield new Date(localStorage.getItem('expirationDate'))
    if (expirationDate >= new Date()) {
      const userId = localStorage.getItem('userId')
      yield put(actions.authSuccess(token, userId))
      yield put(actions.checkAuthTimeout((expirationDate.getTime() - new Date().getTime()) / 1000))
    } else {
      yield put(actions.logout())
    }
  }
}