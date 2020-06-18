/* global require */

var $ = require('jquery'),
  Pryv = require('pryv');

var masterToken,
  lang,
  returnURL,
  referer,
  console,
  serviceInfoUrlArea,
  permissionsArea,
  clientDataArea,
  oauthState,
  submitButton,
  toggleDev,
  permissionsViewInactive,
  apiEndpointArea,
  tokenArea,
  domainArea,
  requestingAppId,
  pryvServiceInfoUrl;

var defaultPermissions = [{
  streamId: 'diary',
  defaultName: 'Journal',
  level: 'read'
}];

/**
 * Initialize access page
 */
window.onload = function () {
  // Load ressources
  masterToken = $('#masterToken');
  lang = $('#languageCode');
  referer = $('#referer');
  returnURL = $('#returnURL');
  console = $('#console');
  serviceInfoUrlArea = $('#serviceInfoUrlArea');
  permissionsArea = $('#permissionsArea');
  clientDataArea = $('#clientDataArea');
  oauthState = $('#oauthState');
  submitButton = $('#submitButton');
  toggleDev = $('#toggleDev');
  permissionsViewInactive = $('#permissionsViewInactive');
  apiEndpointArea = $('#apiEndpointArea');
  tokenArea = $('#tokenArea');
  domainArea = $('#domainArea');
  requestingAppId = $('#requestingAppId');

  permissionsAreaState(false);
  pryvServiceInfoUrl = Pryv.Browser.serviceInfoFromUrl() || 'https://reg.pryv.me/service/info';
  serviceInfoUrlArea.val(pryvServiceInfoUrl);
  masterToken.prop('checked', false);
  permissionsArea.val(JSON.stringify(defaultPermissions, null, '  '));
  masterToken.click(masterTokenManagement);
  submitButton.click(requestAccess);

  // Toggle dev options
  toggleDevOptions();
  toggleDev.click(toggleDevOptions);



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
      permissionsViewInactive.css({ 'display': 'unset' });
    } catch (err) {
      logToConsole(err);
    }
  } else {
    permissionsViewInactive.css({ 'display': 'none' });
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
  if (console.length) {
    console.scrollTop(console[0].scrollHeight - console.height());
  }
}

/**
 * Process the form and request access
 */
function requestAccess() {

  var settings = {};
  var authRequest = {
    requestingAppId: false,
    referer: null,
    languageCode: false,
    permissionsArea: false,
    returnURL: false,
    callbacks: {}
  };
  authRequest.requestingAppId = requestingAppId.val();

  if (authRequest.requestingAppId.length < 6) {
    return alert('RequestingAppId is invalid!');
  }

  // Dev and advanced settings
  authRequest.languageCode = lang.val();
  if (authRequest.languageCode === 'default') { delete authRequest.languageCode; }


  authRequest.returnURL = returnURL.val();
  authRequest.oauthState = oauthState.val();
  authRequest.referer = referer.val() || null;

  try {
    authRequest.requestedPermissions = JSON.parse(permissionsArea.val());

    // Add clientData if any
    var clientData = clientDataArea.val();
    if (clientData.length > 0) {
      authRequest.clientData = JSON.parse(clientData);
    }

    settings.spanButtonID = 'pryvButton';

    settings.onStateChange = function (state) {
      logToConsole('##pryvAuthStateChange \t ' + JSON.stringify(state));
      if (state.id === Pryv.Browser.AuthStates.AUTHORIZED) {
        apiEndpointArea.text(state.apiEndpoint);
        logToConsole('# Auth succeeded for user ' + state.apiEndpoint);
      }
      if (state.id === Pryv.Browser.AuthStates.LOGOUT) {
        logToConsole('# Logout');
      }
    };

    settings.authRequest = authRequest;

    Pryv.Browser.setupAuth(settings, serviceInfoUrlArea.val());
  } catch (e) {
    logToConsole('Error in Access params: ' + e);
  }
}

/**
 * Hide/show advanced dev. options panel and reset to default values
 */
function toggleDevOptions() {
  returnURL.val('auto#');
  lang.val('default');
  lang.parent().parent().toggle();
  referer.parent().parent().toggle();
  returnURL.parent().parent().toggle();
  oauthState.parent().parent().hide();
}