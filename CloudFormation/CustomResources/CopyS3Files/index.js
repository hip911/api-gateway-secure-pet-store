var aws = require("aws-sdk");

exports.handler = function(event, context) {
  console.log("REQUEST RECEIVED:\n", JSON.stringify(event));
  aws.config.update({
    region: event.ResourceProperties.S3Region
  });
  var responseData = {};
  var responseStatus = "FAILED";  // Start out with response of FAILED until we confirm SUCCESS explicitly.

  var s3 = new aws.S3();
  var srcS3Bucket = event.ResourceProperties.SourceBucketName;  // S3 bucket where AWS has hosted the lab content
  var dstS3Bucket = event.ResourceProperties.DestinationWebsiteBucket; // Bucket name that is passed in from CloudFormation.
  var keys = [
    "S3/apiGateway-js-sdk/lib/apiGatewayCore/apiGatewayClient.js",
    "S3/apiGateway-js-sdk/lib/apiGatewayCore/sigV4Client.js",
    "S3/apiGateway-js-sdk/lib/apiGatewayCore/simpleHttpClient.js",
    "S3/apiGateway-js-sdk/lib/apiGatewayCore/utils.js",
    "S3/apiGateway-js-sdk/lib/axios/dist/axios.standalone.js",
    "S3/apiGateway-js-sdk/lib/CryptoJS/components/enc-base64.js",
    "S3/apiGateway-js-sdk/lib/CryptoJS/components/hmac.js",
    "S3/apiGateway-js-sdk/lib/CryptoJS/rollups/hmac-sha256.js",
    "S3/apiGateway-js-sdk/lib/CryptoJS/rollups/sha256.js",
    "S3/apiGateway-js-sdk/lib/url-template/url-template.js",
    "S3/controller.js",
    "S3/index.html",
    "S3/login.html",
    "S3/pets.html"
  ];  // Objects that are copied from AWS to user's bucket

  // CloudFormation cannot delete S3 bucket if there are objects in it.
  // If DELETE request type is sent, delete the objects out of bucket, then log SUCCESS so Cloudformation can proceed.
  if (event.RequestType == "Delete") {
    var params = {
      Bucket: dstS3Bucket
    };

    s3.listObjects(params, function(err, data) {
      if (err) {
        responseData = {Error: 'Failed to get objects from bucket for deletion.'};
        console.log(responseData.Error + ':\\n', err);
      }

      params = {Bucket: dstS3Bucket};
      params.Delete = {};
      params.Delete.Objects = [];

      data.Contents.forEach(function(content) {
        params.Delete.Objects.push({Key: content.Key});
      });

      s3.deleteObjects(params, function(err, data) {
        if (err) {
          responseData = {Error: 'Failed to delete an object from bucket.'};
          console.log(responseData.Error + ':\\n', err);
        }
        else {
          console.log(data);
          responseStatus = "SUCCESS";
        }
        sendResponse(event, context, responseStatus, responseData);
      });
    });
  }

  else { // if request type is CREATE or UPDATE, we get files into user's S3 bucket.
    for (var i = 0; i < keys.length; ++i) {
      var srcS3Key = keys[i];
      var dstS3Key = srcS3Key.slice(3); // remove the 'S3/' prefix of the source key

      // Post status message out.
      console.log("Copying '" + srcS3Key + "' from '" + srcS3Bucket + "' to '" + dstS3Bucket + "'");

      var params = {
        Bucket: dstS3Bucket,
        Key: dstS3Key,
        CopySource: (srcS3Bucket + '/' + srcS3Key),
        MetadataDirective: 'COPY'
      };
      // Copy the object from the source bucket
      s3.copyObject(params, function (err, data) {
        if (err) {
          responseData = {Error: 'Object ' + srcS3Key + ' failed to transfer to your bucket.'};
          console.log(responseData.Error + ':\\n', err);
        }
        else {
          console.log(data);
          sendResponse(event, context, "SUCCESS");
        }
      });
    }
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
