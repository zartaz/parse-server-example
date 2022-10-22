Parse.Cloud.define('hello', req => {
  req.log.info(req);
  return 'Hi';
});

Parse.Cloud.define('asyncFunction', async req => {
  await new Promise(resolve => setTimeout(resolve, 1000));
  req.log.info(req);
  return 'Hi async';
});

Parse.Cloud.beforeSave('Test', () => {
  throw new Parse.Error(9001, 'Saving test objects is not available.');
});

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

})
