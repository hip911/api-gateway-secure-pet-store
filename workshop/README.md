# API Gateway Pet Store: Lab Guide

## All Labs must be performed in eu-west-1 (Ireland)

## Prerequisites
This workshop requires the following software to be installed on your laptop including:
*   **Java 1.8**  
    This lab requires Java version 1.8 to be installed on your laptop. Find out more on installing Java on your Mac at the following link: https://java.com/en/download/
*   **Maven**  
    This lab requires a Maven to build the Lambda function codebase. If you haven't installed Maven already please follow the steps from the link: https://maven.apache.org/install.html. If you are using Homebrew you can install Maven with the command:
        brew install maven
*   **AWS Command Line Interface (CLI)**  
    This lab requires the AWS CLI to perform the Swagger Import API calls to the AWS API Gateway service. It needs to be at least version 1.10.18 or higher.
    For more information on installing the AWS CLI please following the instructions here: http://docs.aws.amazon.com/cli/latest/userguide/installing.html

If there are any issues installing any of these then don't worry, we have a CloudFormation template ready to setup a CLI instance to run the commands of the workshop.

## Overview
This workshop has a few exercises to show you to how to create and deploy your API Gateway backed by a Lambda function performing the business logic of the application. It will start with a CloudFormation template that will create the following resources including:
* An S3 website bucket for the front-end application
* A Cognito Identity Pool to authenticate the users
* IAM roles for the Lambda function and API Gateway
* DynamoDB 'pets' table to store the user login information
* DynamoDB 'users' table to store the pets information per user

Optionally there is another CloudFormation template that can be used to create a CLI instance to run the AWS CLI and Maven commands via Docker.

1\. To begin this workshop, click the 'Deploy to AWS' button below.

[![Launch Pet Store Workshop Stack into Ireland with CloudFormation](/Images/deploy-to-aws.png)](https://console.aws.amazon.com/cloudformation/home?region=eu-west-1#/stacks/new?stackName=PetStoreWorkshopStack&templateURL=https://s3-eu-west-1.amazonaws.com/apigw-pet-store-workshop/CreatePetStoreWorkshop.template)

When this is complete you should should see a page like the following with the output parameters that will be required in the following steps:

![](/Images/cfn-stack-output.png)

2\. If you do not have Java 1.8, Maven or the AWS ClI installed on your laptop then click the 'Deploy to AWS' button below to deploy a CLI instance to your account. Once the stack is created SSH into the instance.

[![Launch Pet Store Workshop CLI Instance into Ireland with CloudFormation](/Images/deploy-to-aws.png)](https://console.aws.amazon.com/cloudformation/home?region=eu-west-1#/stacks/new?stackName=PetStoreWorkshopCLIInstance&templateURL=https://s3-eu-west-1.amazonaws.com/apigw-pet-store-workshop/CreateCLIInstance.template)

3\. From your laptop or the CLI instance, install the source code of the workshop by cloning the git repository from Github.

    git clone https://github.com/mattmcclean/api-gateway-secure-pet-store.git

4\. The next step is to configure the application to utilize the correct Cognito Identity Pool created in the CloudFormation template in Step 1. The app reads the configuration from static variable named `IDENTITY_POOL_ID` declared in the `CognitoConfiguration` class in the `com.amazonaws.apigatewaydemo.configuration` package. Set the value to be the value of the Output Key `CognitoIdentityPool` from the CloudFormation stack output.

5\. Compile the source code for the Lambda function by running the following command.

    cd ~/api-gateway-secure-pet-store

    mvn package

If you are running the command from the CLI Instance then run the following docker command which will install the Maven image and package the software.

    cd ~/api-gateway-secure-pet-store

    docker run -it -v "$PWD":/usr/src/mymaven -v /tmp/.m2:/root/.m2 \
    -w /usr/src/mymaven maven:3.3-jdk-8 mvn package

6\. Create the Lambda function by running the AWS CLI command below. You will need to replace the text *<YOUR_IAM_ROLE_ARN>* with the IAM role ARN found in the Cloudformation output parameter name: **PetStoreLambdaRole**.

    aws lambda create-function --function-name PetStoreFunction \
    --zip-file fileb://target/api-gateway-secure-pet-store-1.0-SNAPSHOT.jar \
    --role <YOUR_IAM_ROLE_ARN> --runtime java8 --handler \
    "com.amazonaws.apigatewaydemo.RequestRouter::lambdaHandler" \
    --description "API Gateway Pet Store demo function" \
    --timeout 15 --memory-size 512

7\. Now that the Lambda function is ready we can setup the API structure in Amazon API Gateway. To easily create the entire API we are going to use the [Swagger Importer Tool](https://github.com/awslabs/aws-apigateway-swagger-importer). The tool depends on having Maven installed to build it so if you have problems installing Maven use the CLI instance. Download and build the Swagger Importer tool following the instructions in its README.md file.

8\. Open the Swagger definition in the `src/main/resources/Swagger.yaml` file. Search the file for `x-amazon-apigateway-integration`. This tag defines the integration points between API Gateway and the backend, our Lambda function. Make sure that the `uri` for the Lambda function is correct, it should look like this:

    arn:aws:apigateway:eu-west-1:lambda:path/2015-03-31/functions/<YOUR LAMBDA FUNCTION ARN>/invocations

For the `/users` and `/login` (the first 2 paths in the file) you will also have to specify the invocation role API Gateway should use to call the Lambda function. You can specify the role ARN in the `credentials` field of the Swagger file, next to the `uri` field. The `/pets` methods use a special role: `arn:aws:iam::*:user/*`. This tells API Gateway to invoke the Lambda function using the caller credentials.

A role has already been created for the `/users` and `/login` methods. Copy the **Role ARN** from the CloudFormation Output field name: **PetStoreLambdaRole** and paste it in the `credentials` field of the `/users` and `/login` methods of the Swagger file.

9\. Now that the Swagger file is up to date run the following AWS CLI command to import the API from the Swagger file definition from the `api-gateway-secure-pet-store` directory.

    aws apigateway import-rest-api --body file://src/main/resources/swagger.yaml --region eu-west-1

10\. Now go into the AWS Management Console and select the API Gateway service that was created. You should see something like the following.

![]](/Images/api-create.png?raw=true)

You should see an API called **API Gateway Secure Pet Store**. Select the API and click the button **Deploy API**. Create a new Deployment Stage (e.g. Prod) and description and deploy the API like the screenshot below.

![]](/Images/deploy-api.png?raw=true)

You should now see the endpoint URL created for the stage like the screenshot below.

![]](/Images/get-api-link.png?raw=true)

11\. The final step we need to do is to generate an SDK for JavaScript so that our web application can invoke the API Endpoint for the Pet Store application. From the same AWS Management Console, select the API endpoint **API Gateway Secure Pet Store** and the stage created previously. Select the tab named **SDK Generation** and select the platform **JavaScript** and download the zip file. Extract the zip file locally and run the following commands to copy the API Gateway client to the S3 website bucket.

    aws s3 cp apiGateway-js-sdk/apigClient.js s3://<S3BucketForWebsiteContent>/apiGateway-js-sdk/apigClient.js

Note: you can get the S3 bucket name from the CloudFormation output parameter named **S3BucketForWebsiteContent**.

You should see the following login page:

![]](/Images/pet-store-login-page.png)
* * *
