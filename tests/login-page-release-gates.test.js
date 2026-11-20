const assert = require('assert');
const fs = require('fs');
const path = require('path');

const workspace = path.resolve(__dirname, '..');

function read(relativePath) {
  return fs.readFileSync(path.join(workspace, relativePath), 'utf8');
}

function countMatches(source, pattern) {
  return (source.match(pattern) || []).length;
}

function assertInOrder(source, labels) {
  let cursor = -1;

  labels.forEach((label) => {
    const next = source.indexOf(label);
    assert(
      next > cursor,
      `${label} must appear after the previous login-card element`
    );
    cursor = next;
  });
}

function cssRule(source, selector) {
  const escaped = selector.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const match = source.match(new RegExp(`${escaped}\\s*\\{([\\s\\S]*?)\\}`, 'm'));
  assert(match, `${selector} CSS rule must exist`);
  return match[1];
}

function hexToRgb(hex) {
  const normalized = hex.replace('#', '');
  const value = parseInt(normalized, 16);

  return {
    r: (value >> 16) & 255,
    g: (value >> 8) & 255,
    b: value & 255
  };
}

function channelToLinear(value) {
  const channel = value / 255;
  return channel <= 0.03928
    ? channel / 12.92
    : Math.pow((channel + 0.055) / 1.055, 2.4);
}

function luminance(hex) {
  const rgb = hexToRgb(hex);
  return (
    0.2126 * channelToLinear(rgb.r) +
    0.7152 * channelToLinear(rgb.g) +
    0.0722 * channelToLinear(rgb.b)
  );
}

function contrastRatio(foreground, background) {
  const fg = luminance(foreground);
  const bg = luminance(background);
  const lighter = Math.max(fg, bg);
  const darker = Math.min(fg, bg);
  return (lighter + 0.05) / (darker + 0.05);
}

const startedAt = process.hrtime.bigint();
const loginSection = read('theme/sections/main-login.liquid');
const loginConfiguration = read('theme/snippets/login-configuration.liquid');
const settingsSchema = read('theme/config/settings_schema.json');
const themeCss = read('theme/assets/theme.css');
const loginTemplate = JSON.parse(read('theme/templates/customers/login.json'));

assert.strictEqual(
  loginTemplate.sections.main.type,
  'main-login',
  'customer login route must render the main-login section'
);
assert.deepStrictEqual(
  loginTemplate.order,
  ['main'],
  'customer login route smoke coverage must include the login page as the only ordered section'
);

assert.match(
  loginSection,
  /assign login_page_title = settings\.login_page_title \| strip/,
  'page title must come from theme configuration'
);
assert.match(
  loginSection,
  /assign login_logo = settings\.login_logo/,
  'logo must come from theme configuration'
);
assert.match(
  loginSection,
  /image_tag:[\s\S]*class: 'login-card__logo'[\s\S]*alt: login_logo_alt/,
  'configured logo must render with the expected class and alt text'
);
assert.match(
  loginSection,
  /class="login-card__logo login-card__logo--unconfigured" aria-label="Login logo"/,
  'reserved logo area must remain present while the approved logo is unconfigured'
);
assert.match(
  loginSection,
  /<h1 class="login-card__title" id="LoginPageTitle">\{\{ login_title \| escape \}\}<\/h1>/,
  'configured page title must render as the page h1'
);
assert.strictEqual(
  countMatches(loginSection, /class="login-card__sso-button"/g),
  1,
  'login page must render exactly one SSO button'
);
assert.strictEqual(
  countMatches(loginSection, /class="login-card__help-link"/g),
  1,
  'login page must render exactly one help link'
);
assert.match(
  loginSection,
  /<div class="login-card__status" role="status" aria-live="polite" aria-label="Login status"><\/div>/,
  'reserved status region must render empty with status semantics'
);
assert.doesNotMatch(
  loginSection,
  /<div class="login-card__status"[\s\S]*?>(?:\s|&nbsp;)*(undefined|placeholder|todo|error|failed|invalid)[\s\S]*?<\/div>/i,
  'empty status area must not expose undefined, placeholder, or fabricated error text'
);

assert.match(
  loginSection,
  /assign login_sso_redirect_url = settings\.login_sso_redirect_url \| strip/,
  'SSO redirect URL must come from configuration'
);
assert.match(
  loginSection,
  /assign login_sso_redirect_url_prefix = login_sso_redirect_url \| slice: 0, 8/,
  'SSO redirect URL must be checked for HTTPS'
);
assert.match(
  loginSection,
  /if login_sso_href == blank or login_sso_redirect_url_prefix != 'https:\/\/'/,
  'SSO redirect must be disabled unless the configured destination is HTTPS'
);
assert.match(
  loginSection,
  /<a class="login-card__sso-button" href="\{\{ login_sso_href \| escape \}\}">/,
  'SSO button must use direct browser navigation without testing real authentication'
);
assert.match(
  loginSection,
  /assign login_help_url = settings\.login_help_url \| strip/,
  'help URL must come from configuration'
);
assert.match(
  loginSection,
  /if login_help_href == blank or login_help_url_prefix != 'https:\/\/'/,
  'help link must be disabled unless the configured destination is HTTPS'
);
assert.match(
  loginSection,
  /<a class="login-card__help-link" href="\{\{ login_help_href \| escape \}\}">/,
  'help link must use direct browser navigation to the configured URL'
);

const parsedSettings = JSON.parse(settingsSchema);
const loginSettings = parsedSettings.find((group) => group.name === 'Login');
assert(loginSettings, 'Login settings group must exist');
const settingIds = loginSettings.settings.map((setting) => setting.id).filter(Boolean);
[
  'login_page_title',
  'login_logo',
  'login_sso_provider_name',
  'login_sso_redirect_url',
  'login_help_url'
].forEach((settingId) => {
  assert(settingIds.includes(settingId), `${settingId} setting must exist`);
});
loginSettings.settings
  .filter((setting) => setting.id && /url/i.test(setting.id))
  .forEach((setting) => {
    assert.match(
      setting.info,
      /absolute HTTPS URL/,
      `${setting.id} must document the HTTPS destination requirement`
    );
  });

assert.doesNotMatch(
  loginSection,
  /<form\b|<input\b|<textarea\b|<select\b|name=["'][^"']*(username|user|email|password|passcode|registration|register|recovery|recover|payment|card|financial|health|ssn|social|dob|date_of_birth|phone|address)[^"']*["']/i,
  'login page must not render username, password, registration, account recovery, payment, financial, health, or sensitive personal data fields'
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

assert.match(
  loginSection,
  /window\.setTimeout\(function \(\) \{[\s\S]*trackLoginPageInitialRender\(\);[\s\S]*\}, 0\);/,
  'render telemetry must be deferred until after DOMContentLoaded and must not block initial render'
);
assert.doesNotMatch(
  loginSection,
  /<script[^>]+src=|<link[^>]+rel=["']preload["'][^>]+href=["']https?:/i,
  'login page must not add blocking external assets before initial render'
);

assert.match(
  cssRule(themeCss, '.login-card__sso-button'),
  /background: #c9182b;[\s\S]*color: #ffffff;/,
  'SSO button must keep readable red-theme foreground/background colors'
);
assert(
  contrastRatio('#ffffff', '#c9182b') >= 4.5,
  'SSO button text contrast must meet WCAG AA normal-text contrast'
);
assert(
  contrastRatio('#9d1022', '#ffffff') >= 4.5,
  'help link contrast must meet WCAG AA normal-text contrast'
);
assert(
  contrastRatio('#5f0712', '#ffffff') >= 3,
  'focus indicator contrast must be visible against the card background'
);
assert.match(
  themeCss,
  /\.login-card__sso-button:focus-visible,\s*\.login-card__help-link:focus-visible\s*\{[\s\S]*outline: 3px solid #5f0712;[\s\S]*outline-offset: 3px;/,
  'SSO button and help link must expose visible keyboard focus styles'
);

assertInOrder(loginSection, [
  'login-card__brand',
  'login-card__title',
  'login-card__intro',
  'login-card__status',
  'login-card__sso-button',
  'login-card__help-link',
  'login-card__scope-note'
]);
assert.match(
  cssRule(themeCss, '.login-page__shell'),
  /display: grid;[\s\S]*grid-template-columns: minmax\(0, 0\.95fr\) minmax\(360px, 480px\);/,
  'visual layout contract must keep the login context and card in the approved two-column structure'
);
assert.match(
  cssRule(themeCss, '.login-card'),
  /border-radius: 8px;[\s\S]*display: grid;[\s\S]*gap: 18px;[\s\S]*padding: 40px;/,
  'visual layout contract must keep the login card spacing and shape stable'
);

assert.match(
  loginConfiguration,
  /SSO redirect URL must be an absolute HTTPS URL before release\./,
  'configuration release gate must block non-HTTPS SSO destinations'
);
assert.match(
  loginConfiguration,
  /Login help URL must be an absolute HTTPS URL before release\./,
  'configuration release gate must block non-HTTPS help destinations'
);

const lockfiles = [
  'package-lock.json',
  'npm-shrinkwrap.json',
  'yarn.lock',
  'pnpm-lock.yaml',
  'Gemfile.lock'
].filter((relativePath) => fs.existsSync(path.join(workspace, relativePath)));
assert.deepStrictEqual(
  lockfiles,
  [],
  'repository-managed theme currently has no package lockfiles; dependency/CVE and SBOM gates must be recorded as CI/platform evidence or not-applicable for this frontend-only task'
);

const durationMs = Number(process.hrtime.bigint() - startedAt) / 1e6;
assert(
  durationMs < 5000,
  `source-level initial render contract validation must complete under 5 seconds, actual ${durationMs.toFixed(2)}ms`
);

console.log(`login page release gate contract passed in ${durationMs.toFixed(2)}ms`);
