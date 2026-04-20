// authToken
// - Purpose: Module-level JWT token shared across all API modules.
// - Exports: getToken(), setToken(t), getAuthHeaders()

let _token = null;

export function setToken(t) {
  _token = t;
}

export function getToken() {
  return _token;
}

export function getAuthHeaders() {
  return _token ? { Authorization: `Bearer ${_token}` } : {};
}
