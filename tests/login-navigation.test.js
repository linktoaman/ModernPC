const assert = require('assert');
const fs = require('fs');
const path = require('path');

const workspace = path.resolve(__dirname, '..');
const loginSection = fs.readFileSync(
  path.join(workspace, 'theme/sections/main-login.liquid'),
  'utf8'
);
const settingsSchema = fs.readFileSync(
  path.join(workspace, 'theme/config/settings_schema.json'),
  'utf8'
);

function countMatches(source, pattern) {
  return (source.match(pattern) || []).length;
}

assert.strictEqual(
  countMatches(loginSection, /class="login-card__sso-button"/g),
  1,
  'login page must render exactly one SSO button'
);

assert.match(
  loginSection,
  /assign login_sso_provider_name = settings\.login_sso_provider_name \| strip/,
  'SSO provider display name must come from theme configuration'
);
assert.match(
  loginSection,
  /Continue with \{\{ login_provider_label \| escape \}\}/,
  'SSO button copy must include the configured provider label'
);

assert.match(
  loginSection,
  /assign login_sso_redirect_url = settings\.login_sso_redirect_url \| strip/,
  'SSO redirect URL must come from theme configuration'
);
assert.match(
  loginSection,
  /assign login_sso_redirect_url_prefix = login_sso_redirect_url \| slice: 0, 8/,
  'SSO redirect URL must be checked for an HTTPS prefix'
);
assert.match(
  loginSection,
  /if login_sso_href == blank or login_sso_redirect_url_prefix != 'https:\/\/'/,
  'invalid SSO destinations must not be wired as external navigation targets'
);
assert.match(
  loginSection,
  /<a class="login-card__sso-button" href="\{\{ login_sso_href \| escape \}\}">/,
  'SSO activation must use direct browser navigation to the configured URL'
);

assert.match(
  loginSection,
  /assign login_help_url = settings\.login_help_url \| strip/,
  'login help URL must come from theme configuration'
);
assert.match(
  loginSection,
  /assign login_help_url_prefix = login_help_url \| slice: 0, 8/,
  'login help URL must be checked for an HTTPS prefix'
);
assert.match(
  loginSection,
  /if login_help_href == blank or login_help_url_prefix != 'https:\/\/'/,
  'invalid help destinations must not be wired as external navigation targets'
);
assert.match(
  loginSection,
  /<a class="login-card__help-link" href="\{\{ login_help_href \| escape \}\}">/,
  'help activation must use direct browser navigation to the configured URL'
);

assert.doesNotMatch(
  loginSection,
  /\b(fetch|XMLHttpRequest|sendBeacon|FormData|localStorage|sessionStorage)\b/i,
  'login page must not call authentication endpoints or process browser-side authentication data'
);
assert.doesNotMatch(
  loginSection,
  /\{\{\s*(request\.params|customer|cart|checkout|form|token|assertion|callback)\b/i,
  'login page must not render authentication responses, credentials, tokens, or assertions'
);
assert.doesNotMatch(
  loginSection,
  /<form\b|<input\b|<textarea\b|<select\b/i,
  'login page must not collect user-entered data'
);
assert.doesNotMatch(
  loginSection,
  /\{\{\s*(request\.params|customer|cart|checkout|form)\b/i,
  'navigation URLs must not append user-entered or sensitive storefront data'
);

const parsedSettings = JSON.parse(settingsSchema);
const loginSettings = parsedSettings.find((group) => group.name === 'Login');
assert(loginSettings, 'Login settings group must exist');

const loginSettingIds = loginSettings.settings.map((setting) => setting.id).filter(Boolean);
assert(loginSettingIds.includes('login_sso_provider_name'), 'provider setting must exist');
assert(loginSettingIds.includes('login_sso_redirect_url'), 'SSO redirect setting must exist');
assert(loginSettingIds.includes('login_help_url'), 'help URL setting must exist');

console.log('login navigation contract passed');
