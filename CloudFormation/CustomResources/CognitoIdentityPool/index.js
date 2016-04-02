var AWS = require("aws-sdk");
var _ = require("underscore");

exports.handler = function(event, context) {
  console.log("REQUEST RECEIVED:\n", JSON.stringify(event));

  var responseData = {};
  var responseStatus = "FAILED";  // Start out with response of FAILED until we confirm SUCCESS explicitly.

  // set the region to the same one as the CFN stack
  AWS.config.update({region: event.ResourceProperties.Region});

  // initialise the CognitoIdentiy object
  var cognitoidentity = new AWS.CognitoIdentity();

  // process the Delete event
  if (event.RequestType == "Delete") {

    // find the Identiy Pool Id from Identy Pool name. Set max results to the limit per account
    console.log("Listing Cognito Identity Pools");
    cognitoidentity.listIdentityPools({ MaxResults: 60 }, function(err, data) {
      if (err) {
        responseData = {Error: 'Failed to get list of Cognito Identity Pools.'};
        console.log(responseData.Error + ':\\n', err);
        sendResponse(event, context, responseStatus, responseData);
      } else {
        console.log(JSON.stringify(data));
        // Get the right identityPool from the list of all Identity Pools
        var identityPool = _.where(data.IdentityPools, { IdentityPoolName: event.ResourceProperties.IdentityPoolName })[0];
        console.log("Identity Pool is:\n", JSON.stringify(identityPool));

        // delete the Identity Pool based in Identity Pool Id
        console.log("Deleting Cognito Identity Pool");
        cognitoidentity.deleteIdentityPool({ IdentityPoolId: identityPool.IdentityPoolId }, function(err, data) {
          if (err) {
            responseData = {Error: 'Failed to delete Cognito Identity Pool.'};
            console.log(responseData.Error + ':\\n', err);
          } else {
            console.log(JSON.stringify(data));
            responseStatus = "SUCCESS";
          }
          sendResponse(event, context, responseStatus, responseData);
        });
      }
    });
  }
  else if (event.RequestType == "Create") { // if request type is CREATE we create a new Cognito Identity

    // find the Identiy Pool Id from Identy Pool name. Set max results to the limit per account
    console.log("Listing Cognito Identity Pools");
    cognitoidentity.listIdentityPools({ MaxResults: 60 }, function(err, data) {
      if (err) {
        responseData = {Error: 'Failed to get list of Cognito Identity Pools.'};
        console.log(responseData.Error + ':\\n', err);
        sendResponse(event, context, responseStatus, responseData);
      } else {
        console.log(JSON.stringify(data));
        // Get the right identityPool from the list of all Identity Pools
        var pools = _.where(data.IdentityPools, { IdentityPoolName: event.ResourceProperties.IdentityPoolName });
        // check that there are no identity pools that exist with the same name
        if (pools.length > 0) {
            var errorMsg = 'Cognito Identity Pool with name: ' + event.ResourceProperties.IdentityPoolName + ' already exists.';
            responseData = {Error: errorMsg };
            sendResponse(event, context, responseStatus, responseData);
        } else {
          console.log("Creating Cognito Identity Pool");
          var params = {
            AllowUnauthenticatedIdentities: false,
            IdentityPoolName: event.ResourceProperties.IdentityPoolName,
            DeveloperProviderName: event.ResourceProperties.DeveloperProviderName
          };

          // create the Cognito Identity Pool
          cognitoidentity.createIdentityPool(params, function(err, data) {
            if (err) {
              responseData = {Error: 'Failed to create new Cognito Identiy Pool.'};
              console.log(responseData.Error + ':\\n', err);
              sendResponse(event, context, responseStatus, responseData);
            } else {
              console.log(JSON.stringify(data));
              responseData = data;
              console.log("Setting Cognito Identity Roles");
              // call the set Identity pool rules with role arn provided as input to function
              cognitoidentity.setIdentityPoolRoles({ IdentityPoolId: data.IdentityPoolId, Roles: { 'authenticated': event.ResourceProperties.Role } }, function(err, data) {
                if (err) {
                  responseData = {Error: 'Failed to set Cognito Identiy Pool roles.'};
                  console.log(responseData.Error + ':\\n', err);
                } else {
                  console.log(JSON.stringify(data));
                  responseStatus = "SUCCESS";
                }
                sendResponse(event, context, responseStatus, responseData);
              });
            }
          });
        }
      }
    });
  }
  else {
      console.log("Update not supported.");
      sendResponse(event, context, "SUCCESS");
  }
};

function sendResponse(event, context, responseStatus, responseData) {

  var responseBody = JSON.stringify({
      Status: responseStatus,
      Reason: 'See the details in CloudWatch Log Stream: ' + context.logStreamName,
      PhysicalResourceId: context.logStreamName,
      StackId: event.StackId,
      RequestId: event.RequestId,
      LogicalResourceId: event.LogicalResourceId,
      Data: responseData
  });

  console.log('RESPONSE BODY:\n', responseBody);

  var https = require('https');
  var url = require('url');

  var parsedUrl = url.parse(event.ResponseURL);
  var options = {
      hostname: parsedUrl.hostname,
      port: 443,
      path: parsedUrl.path,
      method: 'PUT',
      headers: {
        "content-type": "",
        "content-length": responseBody.length
      }
  };

  console.log('SENDING RESPONSE...\n');

  var request = https.request(options, function(response) {
      console.log('STATUS: ' + response.statusCode);
      console.log('HEADERS: ' + JSON.stringify(response.headers));
      context.done();
  });

  request.on('error', function(error) {
    console.log('sendResponse Error:' + error);
    context.done();
  });

  request.write(responseBody);
  request.end();
}
