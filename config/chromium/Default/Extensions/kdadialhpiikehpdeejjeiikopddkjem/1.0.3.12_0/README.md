Any.DO client-server REST API Documentation
===========================================

Introduction & API Notes
------------------------

Clients use REST API calls over HTTP to synchronize tasks, categories, user preferences and sharing information with the server.

There are 5 types of requests: GET, POST, PUT, DELETE, and GET with a specific ID.

Here are the supported request types:

*GET* /endpoint

*GET* /endpoint/id

*POST* /endpoint

*PUT* /endpoint/id

*DELETE* /endpoint/id

* All API is currently placed under the "/state-manager" path.
* All JSON requests (all requests except the login) must have the *application/json* content type.
* The API supports sending the data in dictionary mode, with flattened tasks, called "flatDict".
  To return the data using a dictionary with the global ID as the key of every value, use *responseType=flatDict*
  as a GET parameter to every request.
* In JSON requests, all data sent using POST and PUT requests must be JSON encoded data in the body of the request.
* All requests use a globally unique identifier encoded with URL safe base64 encoded. The globally unique ID
  is a 16 byte random binary string. After base64 encoding, the ID will be a 24 byte string.
* in PUT, DELETE, and optionally GET requests, you need to add the 24 byte global ID to the URL.

Code to create the global ID:

	function encodeSafeBase64(str) {
		return str.replace("+", "-").replace("/","_")
	}

	function createGlobalId()  {
		var randomString = "";
		for(var i = 0; i < 16; i++) {
			randomString += String.fromCharCode(Math.random() * 256);
		}
		return encodeSafeBase64(encodeBase64(randomString));
	}

GET requests
------------

There are two types of GET requests - with or without the ID.
In flatDict mode, the response  is a dictionary with all of the tasks, using their UUID as the key and a dictionary
of the data as the value. If a GET request was done with the ID, the task dictionary is returned in the body as is.

POST requests
-------------

To create new objects, a *list* with dictionaries of objects is sent to the server. If you need to create only one
item, put a single entry in the list. Note that the global ID must be created by the client and not the server!

PUT requests
------------

To update an object, send a PUT request with the ID in the URL. The body should have the new object in the body.

DELETE requests
---------------

To delete an object, simply send a DELETE request with the ID in the URL.

Login
-----

* Right now, the only form encoding call done to the server is the login process.
* Only POST is supported.
* The parameter *_spring_security_remember_me* should always be specified.
* Password is not encoded/encrypted in the request.

Endpoint: /state-manager/j_spring_security_check

POST parameters:

	{
		j_username: <email>,
		j_password: <password>,
		_spring_security_remember_me: "on"
	}

Users
-----

The users table contains all user info and preferences.

Endpoint: /user

DTO:

	{
		name: <string>,
		username: <email>,
		password: <plaintext password>,
		emails: [<email>],
		phoneNumbers: [<string>, <string>, ...],
		instDetails: {
			version_code: <int>,
			widget_1x4: <boolean>,
			widget_4x4: <boolean>,
			current_view: <string>,
			gtasks_logged_in: <boolean>,
			versionSDK: <int>,
			country: <string>,
			language: <string>,
			c2dmReceiverId: <string>,
			additionalData: <string>,
			installationId: <string>,
			completed_tasks: <int>,
			platform: <string>,
			todo_tasks: <int>,
			done_tasks: <int>,
			shake: <boolean>,
			pnsToken: <string>
		}
	}

Tasks
-----

The tasks endpoint.

Endpoint: /me/tasks

DTO:

	{
		id: <uuid>,
		parentGlobalTaskId: <uuid>,
		ownerPuid: <uuid>,
		title : <string>,
		category: <string>,
		creationDate: <date>,
		dueDate: <date>,
		expanded: <boolean>,
		priority: "Normal" / "High",
		status: "UNCHECKED" / "CHECKED" / "DELETED" / "DONE",
		repeating: <boolean>,
		repeatingMethod: "TASK_REPEAT_OFF" / "TASK_REPEAT_DAY" / "TASK_REPEAT_WEEK" / "TASK_REPEAT_MONTH",
		latitude: <string>,
		longitude: <string>,
		shared: <boolean>,
		subTasks: [] # not used in flat mode
		sharedFriends: {
			{
				puid: <uuid>,
				name: <string>,
				status: "PENDING" / "ACCEPTED" / "REJECTED" / "NEW",
				sharedMethod: {
					shareMethod: "ANYDO" / "EMAIL" / "PHONE",
					value: <uuid>
				}
			},
			...
		}
	}

Categories
----------

The task categories endpoint.

Endpoint: /me/categories

DTO:

	{
		id : <uuid>,
		name : <string>,
		listPosition : <int>,
		isDefault : <boolean>
	}
