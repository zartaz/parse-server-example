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
  const query = new Parse.Query("Landmark").ascending("order");
  const landmarks = await query.find();
  return landmarks;
})
