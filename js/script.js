/* global require */

var $ = require('jquery'),
  pryv = require('pryv');

var masterToken,
  localAuth,
  reclaDevel,
  lang,
  returnURL,
  console,
  registerUrlText,
  permissionsArea,
  oauthState,
  submitButton,
  toggleDev,
  permissionsViewInactive,
  usernameArea,
  tokenArea,
  domainArea,
  requestingAppId,
  registerHostname,
  pryvDomain;

var defaultPermissions = [{
  streamId : 'diary',
  defaultName : 'Journal',
  level : 'read'
}];

/**
 * Initialize access page
 */
window.onload = function () {
  // Load ressources
  masterToken = $('#masterToken');
  localAuth = $('#localAuth');
  reclaDevel = $('#reclaDevel');
  lang = $('#languageCode');
  returnURL = $('#returnURL');
  console = $('#console');
  registerUrlText = $('#registerUrlText');
  permissionsArea = $('#permissionsArea');
  oauthState = $('#oauthState');
  submitButton = $('#submitButton');
  toggleDev = $('#toggleDev');
  permissionsViewInactive = $('#permissionsViewInactive');
  usernameArea = $('#usernameArea');
  tokenArea = $('#tokenArea');
  domainArea = $('#domainArea');
  requestingAppId = $('#requestingAppId');

  permissionsAreaState(false);
  registerHostname = pryv.utility.urls.parseClientURL().parseQuery()['pryv-reg'] ||
    pryv.Auth.config.registerURL.host;
  pryvDomain = registerHostname.split('.').splice(1,3).join('.');
  registerUrlText.text(registerHostname);
  masterToken.prop('checked', false);
  permissionsArea.val(JSON.stringify(defaultPermissions, null, '  '));
  masterToken.click(masterTokenManagement);
  submitButton.click(requestAccess);

  // Toggle dev options
  toggleDevOptions();
  toggleDev.click(toggleDevOptions);

  // Local setup for auth popup
  localAuth.click(function() {
    reclaDevel.val(localAuth.is(':checked') ? ':4443/' + pryvDomain + '/access.html' : '');
  });

};

/**
 * Change view and permissions to fit a master token app access
 */
function masterTokenManagement() {
  var masterTokenPermissions = [{
      streamId: '*',
      level: 'manage'
    }];

  if (masterToken.is(':checked')) {
    try {
      defaultPermissions = JSON.parse(permissionsArea.val());
      permissionsArea.val(JSON.stringify(masterTokenPermissions, null, '  '));
      permissionsAreaState(true);
      permissionsViewInactive.css({'display': 'unset'});
    } catch (err) {
      logToConsole(err);
    }
  } else {
    permissionsViewInactive.css({'display': 'none'});
    permissionsAreaState(false);
    permissionsArea.val(JSON.stringify(defaultPermissions, null, '  '));
  }
}

/**
 * Disable/activate inputs for permissions area
 * @param state {Boolean}: activation state
 */
function permissionsAreaState(state) {
  permissionsArea.prop('disabled', state);
}

/**
 * Prints to console a message/error
 * @param text {String}: the message to print
 */
function logToConsole(text) {
  console.append(text + '\n');
  if(console.length) {
    console.scrollTop(console[0].scrollHeight - console.height());
  }
}

/**
 * Process the form and request access
 */
function requestAccess() {
  var customRegisterUrl = registerUrlText.text();

  if (customRegisterUrl) {
    pryv.Auth.config.registerURL = {host: customRegisterUrl, 'ssl': true};
  }

  var settings = {
    requestingAppId: false,
    languageCode: false,
    permissionsArea: false,
    returnURL: false,
    callbacks: {}
  };
  settings.requestingAppId = requestingAppId.val();

  if(settings.requestingAppId.length < 6) {
    return alert('RequestingAppId is invalid!');
  }

  // Dev and advanced settings
  settings.languageCode = lang.val();
  settings.returnURL = returnURL.val();
  settings.oauthState = oauthState.val();

  // Rec-la config for local dev
  pryv.Auth.config.reclaDevel = (reclaDevel.val().length > 0) ? reclaDevel.val() : false;

  try {
    settings.requestedPermissions = JSON.parse(permissionsArea.val());
    settings.spanButtonID = 'pryvButton';

    settings.callbacks.initialization = function () {
      logToConsole('Access Requested.');
    };
    settings.callbacks.needSignin = function () {
      logToConsole('Access parameters validated, please sign in.');
    };
    settings.callbacks.signedIn = function (connection) {
      logToConsole(
        'Access generation successful, please copy the token to be used with ' +
        'the associated username.');
      usernameArea.text(connection.username);
      tokenArea.text(connection.auth);
      domainArea.text(connection.domain);
    };
    settings.callbacks.refused = function (reason) {
      logToConsole('Access refused by user' + reason);
    };
    settings.callbacks.error = function (code, message) {
      logToConsole('Error: code=' + code + ', message: ' + message);
    };

    pryv.Auth.setup(settings);
  } catch (e) {
    logToConsole('Error in Access params: ' + e);
  }
}

/**
 * Hide/show advanced dev. options panel and reset to default values
 */
function toggleDevOptions() {
  returnURL.val('auto#');
  reclaDevel.val('');
  localAuth.prop('checked', false);
  lang.val('default');
  lang.parent().parent().toggle();
  returnURL.parent().parent().toggle();
  reclaDevel.parent().parent().toggle();
  oauthState.parent().parent().hide();
}