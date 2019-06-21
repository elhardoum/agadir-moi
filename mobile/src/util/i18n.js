const MESSAGES = {
  default: {
    fr: {
      name: 'nom'
    }
  },
}

class i18nUtil
{
  constructor( target_locale, origin_message, group )
  {
    this.target_locale = target_locale
    this.origin_message = origin_message
    this.group = group

    return this
  }

  toString()
  {
    let group = MESSAGES[ undefined !== this.group ? this.group : 'default' ]

    if ( group && this.target_locale in group && group[this.target_locale] ) {
      if ( this.origin_message in group[this.target_locale] && group[this.target_locale][this.origin_message] ) {
        return group[this.target_locale][this.origin_message]
      }
    }

    return this.origin_message
  }
}

export default i18n = (...args) => ((o=new i18nUtil('fr', ...args)), args[2] ? o : `${o}`)
