// Copyright 2010 Google Inc. All Rights Reserved.

goog.require('goog.chrome.extensions.i18n');

var msgs = {};

/**
 * @desc The name of the extension.
 */
msgs.MSG_NAME = goog.getMsg('Google Calendar Checker (by Google)');

/**
 * @desc The title of the extension.
 */
msgs.MSG_TITLE = goog.getMsg('Google Calendar Checker');

/**
 * @desc Description of the extension.
 */
msgs.MSG_DESCRIPTION = goog.getMsg('Quickly see the time until your next' +
  ' meeting from any of your calendars. Click on the button to be taken to' +
  ' your calendar.');

/**
 * @desc Direction.
 */
msgs.MSG_DIRECTION = goog.getMsg('ltr');

/**
 * @desc Message shown when no title is given for the event.
 */
msgs.MSG_NOTITLE = goog.getMsg('(No Title)');

/**
 * @desc Title of options page.
 */
msgs.MSG_OPTIONSTITLE = goog.getMsg('Google Calendar Checker');

/**
 * @desc Minutes left in event.
 */
msgs.MSG_MINUTES = goog.getMsg('{$minutes}m', {'minutes': '$1'});

/**
 * @desc Hours left in event.
 */
msgs.MSG_HOURS = goog.getMsg('{$hours}h', {'hours': '$1'});

/**
 * @desc Days left in event.
 */
msgs.MSG_DAYS = goog.getMsg('{$days}d', {'days': '$1'});

/**
 * @desc Text shown in Multiple Calendar Support.
 */
msgs.MSG_MULTICALENDARTEXT = goog.getMsg('Multi Calendar Support');

/**
 * @desc extension name shown in options page.
 */
msgs.MSG_EXTENSIONNAME = goog.getMsg('Google Calendar Checker');

/**
 * @desc status saved message shown in options page.
 */
msgs.MSG_STATUS_SAVED = goog.getMsg('Settings Saved.');

/**
 * @desc saving status message shown in options page.
 */
msgs.MSG_STATUS_SAVING = goog.getMsg('Saving....');

/**
 * @desc tooltip appears on text in options page.
 */
msgs.MSG_MULTICALENDARTOOLTIP = goog.getMsg('Please check the box to enable' +
  ' multiple calendar support');

/**
 * @desc tooltip appears on image in options page.
 */
msgs.MSG_IMAGETOOLTIP = goog.getMsg('Google Calendar');

print(goog.chrome.extensions.i18n.messagesToJsonString(msgs));
