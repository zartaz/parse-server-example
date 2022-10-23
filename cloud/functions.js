const { parse } = require("dotenv");

Parse.Cloud.define('login', async req => {
  const user = await Parse.User.logIn(req.params.username, req.params.password);
  const sessionToken = user.getSessionToken();
  const userId = user.id;
  const data = {
    "objectId": userId,
    "sessionToken": sessionToken
  }
  return data;
});

Parse.Cloud.define('fetchLandmarks', async req => {
  if (req.params.objectId) {
    const query = new Parse.Query('Landmark');
    query.equalTo('objectId', req.params.objectId);
    const results = await query.find();
    return results;
  }

  // https://github.com/parse-community/parse-server/issues/7281 based on that issue, i cant exlude in database level some fields,this will be done in api level

  const query = new Parse.Query("Landmark").ascending("order");
  query.select("title", "short_info", "photo_thumb", "photo");
  const landmarks = await query.find();
  const results = landmarks.map(landmark => {
    // using map to exclude some fields with parse.object.attributes to filter more
    const { title, short_info, photo_thumb, photo } = landmark.attributes;
    return { title, short_info, photo_thumb, photo };
  });
  return results;

});

Parse.Cloud.define('saveLandmark', async req => {
  if (!req.headers['x-parse-session-token']) {
    throw new Parse.Error(Parse.Error.INVALID_SESSION_TOKEN, 'Session token required.');
  }
  if (!req.params.objectId) {
    throw new Parse.Error('objectId required.');
  }
  const sessionToken = req.headers['x-parse-session-token'];
  const query = new Parse.Query(Parse.Session);
  query.equalTo('sessionToken', sessionToken);
  const result = await query.find({ useMasterKey: true });
  userObjectId = result[0].get('user').id;

  const queryroles = new Parse.Query(Parse.Role);
  queryroles.equalTo('users', { __type: 'Pointer', className: '_User', objectId: userObjectId });
  const roles = await queryroles.find({ useMasterKey: true });
  const userRole = roles[0].get('name');

  if (userRole !== 'administrator') {
    throw new Parse.Error(Parse.Error.OPERATION_FORBIDDEN, 'You are not authorized to perform this action.');
  }

  const queryLandmark = new Parse.Query('Landmark');
  queryLandmark.equalTo('objectId', req.params.objectId);
  const landmark = await queryLandmark.first();
  landmark.set('title', req.params.title);
  return landmark.save({}, { useMasterKey: true });
});

