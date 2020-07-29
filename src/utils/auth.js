const access_token_key = 'access_token'

export function getAccessToken() {
  return localStorage.getItem(access_token_key)
}

export function setAccessToken(access_token) {
  return localStorage.setItem(access_token_key, access_token)
}

export function removeAccessToken() {
  return localStorage.removeItem(access_token_key)
}

// export function getAccessToken() {
//   return sessionStorage.getItem(access_token_key)
// }

// export function setAccessToken(access_token) {
//   return sessionStorage.setItem(access_token_key,access_token)
// }

// export function removeAccessToken() {
//   return sessionStorage.removeItem(access_token_key)
// }
