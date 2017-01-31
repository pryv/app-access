/* global require */

var $ = require('jquery'),
  pryv = require('pryv');

var defaultPermissions = [{
  streamId : 'diary',
  defaultName : 'Journal',
  level : 'read'
}];

window.onload = function () {
  var $masterToken = $('#masterToken');
  permissionsAreaState(false);
  var url = pryv.utility.urls.parseClientURL().hash;
  $('#registerUrlText').text(url.substring(url.lastIndexOf('#')+1,url.lastIndexOf('?')) ||
    pryv.Auth.config.registerURL.host);
  $masterToken.prop('checked', false);
  $('#permissionsArea').val(JSON.stringify(defaultPermissions, null, '  '));
  $masterToken.click(masterTokenManagement);
  $('#addPermission').click(addPermission);
  $('#submitButton').click(requestAccess);
  $('#clearPermissionArea').click(clearPermissions);

  // Toggle dev options
  toggleDevOptions();
  $('#toggleDev').click(toggleDevOptions);
};

/**
 * change view and permissions to fit a master token app access
 */
function masterTokenManagement() {
  var $permissionsViewInactive = $('#permissionsViewInactive'),
    $permissionsArea = $('#permissionsArea'),
    masterTokenPermissions = [{
      streamId: '*',
      level: 'manage'
    }];

  if ($('#masterToken:checked').length === 1) {
    try {
      defaultPermissions = JSON.parse($permissionsArea.val());
      $permissionsArea.val(JSON.stringify(masterTokenPermissions, null, '  '));
      permissionsAreaState(true);
      $permissionsViewInactive.css({'display': 'unset'});
    } catch (err) {
      logToConsole(err);
    }
  } else {
    $permissionsViewInactive.css({'display': 'none'});
    permissionsAreaState(false);
    $permissionsArea.val(JSON.stringify(defaultPermissions, null, '  '));
  }
}

/**
 * disable/activate inputs for permissions area
 * @param state {Boolean}
 */
function permissionsAreaState(state) {
  var $addPermission = $('#addPermission'),
    $permissionsArea = $('#permissionsArea'),
    $clearButton= $('#clearPermissionArea'),
    $streamId = $('#streamId'),
    $level = $('#level'),
    $name = $('#name');

  $permissionsArea.prop('disabled', state);
  $addPermission.prop('disabled', state);
  $clearButton.prop('disabled', state);
  $streamId.prop('disabled', state);
  $level.prop('disabled', state);
  $name.prop('disabled', state);
}

/**
 * manage the add permission button
 */
function addPermission() {
  var $permissionsArea = $('#permissionsArea'),
    $streamId = $('#streamId'),
    $level = $('#level option:selected'),
    $name = $('#name'),
    permission;

  if (!$streamId.val()) {
    return logToConsole('Error: A streamId is required to submit a permission.');
  }
  if (!$level.val()) {
    return logToConsole('Error: A level is required to submit a permission.');
  }

  if ($name.val()) {
    permission = [{
      streamId: $streamId.val(),
      defaultName: $name.val(),
      level: $level.val()
    }];
  } else {
    permission = [{
      streamId: $streamId.val(),
      level: $level.val()
    }];
  }

  if ($permissionsArea.val()) {
    $permissionsArea.val(
      $permissionsArea.val().addNewPermission(JSON.stringify(permission, null, '  '))
    );
  } else {
    $permissionsArea.val(JSON.stringify(permission, null, '  '));
  }

  if ($permissionsArea.length) {
    $permissionsArea.scrollTop($permissionsArea[0].scrollHeight - $permissionsArea.height());
  }
}

String.prototype.addNewPermission = function(newPermission) {
  return this.replace('\n]', ',\n' + newPermission.substring(2, newPermission.length ));
};


/**
 * manage the clear permissions button
 */
function clearPermissions() {
  var $permissionsArea = $('#permissionsArea');

  $permissionsArea.val('');
}


/**
 * prints to console a message/error
 * @param text {String}
 */
function logToConsole(text) {
  var $console = $('#console');

  $console.append(text + '\n');
  if($console.length) {
    $console.scrollTop($console[0].scrollHeight - $console.height());
  }
}

/**
 * process the form and request access
 */
function requestAccess() {
  var customRegisterUrl = $('#registerUrlText').text(),
    $username = $('#usernameArea'),
    $token = $('#tokenArea');

  if (customRegisterUrl) {
    pryv.Auth.config.registerURL = {host: customRegisterUrl, 'ssl': true};
  }

  // Rec-la config, only for dev
  if ($('#reclaDevel').val().length > 0) {
    pryv.Auth.config.reclaDevel = $('#reclaDevel').val();
  } else {
    pryv.Auth.config.reclaDevel = false;
  }

  var settings = {
    requestingAppId: false,
    languageCode: false,
    permissionsArea: false,
    returnURL: false,
    callbacks: {}
  };
  settings.requestingAppId = $('#requestingAppId').val();

  if(settings.requestingAppId.length < 6) {
    return alert('RequestingAppId is invalid!');
  }

  // Dev and advanced settings
  settings.languageCode = $('#languageCode option:selected').val();
  settings.returnURL = $('#returnURL').val();
  settings.oauthState = $('#oauthState').val();
  settings.forcePolling = $('#forcePolling').attr('checked') === 'checked';

  try {
    settings.requestedPermissions = JSON.parse($('#permissionsArea').val());
    settings.spanButtonID = 'pryvButton';

    settings.callbacks.initialization = function () {
      logToConsole('Access Requested.');
    };
    settings.callbacks.needSignin = function () {
      logToConsole('Access parameters validated, please sign in.');
    };
    settings.callbacks.accepted = function (username, appToken) {
      logToConsole(
        'Access generation successful, please copy the token to be used with ' +
        'the associated username.');
      $username.text(username);
      $token.text(appToken);
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

function toggleDevOptions() {
  $('#languageCode').parent().parent().toggle();
  $('#returnURL').parent().parent().toggle();
  $('#oauthState').parent().parent().hide();
  $('#forcePolling').parent().parent().toggle();
  $('#reclaDevel').parent().parent().toggle();
  }