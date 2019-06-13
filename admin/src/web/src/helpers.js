import * as _configs from './config'

export const config = (key, _default=null) =>
{
  return key in _configs ? _configs[key] : _default
}

export const title = ( title ) =>
{
  document.title = `${title} — Agadir & Moi`
}

export const is_email = email =>
  /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/.test(email)
