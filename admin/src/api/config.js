const LIVE_MODE = false

module.exports = {
  PG_CONNECTION_URI: {
    password: 'agadirmoi',
    user: 'agadirmoi',
    database: 'agadirmoi',
    host: 'postgres',
  },

  SITE_URL: 'http://localhost:9090/',

  COOKIES_SALT: ';*Ks|}6Z^J{v?FI;~*J&G{HfZ5Z1+iG5(pCVN!/)>B*7O.67u=h&',

  ROOT_DIR: '/app',

  // email SMTP settings
  SMTP: {
    host: 'smtp.zoho.com',
    port: 465,
    secure: 'ssl',
    auth: {
      user: process.env.SMTP_AUTH_USER,
      pass: process.env.SMTP_AUT_PASSWORD,
    }
  },

  USER_ROLES: ['super-admin', 'admin', 'moderator'],

  MAIL_DEFAULTS: {
    from: 'Agadir & Moi <info@elh.solutions>',
  },

  // milliseconds
  PASSWORD_RESET_TOKEN_TTL: 60*60*24*1000, // 1 day

  /**
    * Password Reset email
    *
    * This email is sent to users with a password-reset link to update their passwords
    */
  PASSWORD_RESET_SUBJECT: '[Agadir & Moi] Your Password Reset Link',
  PASSWORD_RESET_BODY: `Dear {user.first_name},

Somebody has requested a password-reset link for your account. To reset your password, follow below link:

{link}

If this was not you, then please disregard this email.

Regards,
Agadir & Moi`,
  PASSWORD_RESET_BODY_HTML: false,

  /**
    * Password Update notice email
    *
    * This email is sent to users after they have updated their passwords
    * To disable this email, set the body to null or remove the variable declaration
    */
  PASSWORD_CHANGE_NOTICE_SUBJECT: '[Agadir & Moi] Notice of Password Change',
  PASSWORD_CHANGE_NOTICE_BODY: `Dear {user.first_name},

This notice confirms that your password was changed on our platform.

Regards,
Agadir & Moi`,
  PASSWORD_CHANGE_NOTICE_BODY_HTML: false,
}
