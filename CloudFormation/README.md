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
    This lab requires the AWS CLI to perform the Swagger Import API calls to the AWS API Gateway service. For more information on installing the AWS CLI please following the instructions here: http://docs.aws.amazon.com/cli/latest/userguide/installing.html
*   **Xcode (optional)**  
    To run the example mobile application you need to have Xcode installed which relies on you having a Mac OSX laptop. To install Xcode follow the instructions outlined here: https://developer.apple.com/xcode/download/

If there are any issues installing any of these then don't worry, we have a CloudFormation template ready to setup a CLI instance to run the commands of the workshop.

## Overview
This workshop has a couple of exercises

1\. To begin this workshop, click the 'Deploy to AWS' button below.
[![Launch Pet Store Workshop Stack into Ireland with CloudFormation](/Images/deploy-to-aws.png)](https://console.aws.amazon.com/cloudformation/home?region=eu-west-1#/stacks/new?stackName=PetStoreWorkshopStack&templateURL=https://s3-eu-west-1.amazonaws.com/apigw-pet-store-workshop/CreatePetStoreWorkshop.template)

2\. If you do not have Java 1.8, Maven or the AWS ClI installed on your laptop then click the 'Deploy to AWS' button below to deploy a CLI instance to your account. Once the stack is created SSH into the instance.
[![Launch Pet Store Workshop CLI Instance into Ireland with CloudFormation](/Images/deploy-to-aws.png)](https://console.aws.amazon.com/cloudformation/home?region=eu-west-1#/stacks/new?stackName=PetStoreWorkshopCLIInstance&templateURL=https://s3-eu-west-1.amazonaws.com/apigw-pet-store-workshop/CreateCLIInstance.template)

3\. From your laptop or the CLI instance, install the source code of the workshop and the swagger import tool to your CLI instance:

    ''Pet Store Workshop source''
    git clone https://github.com/mattmcclean/api-gateway-secure-pet-store.git

    API Gateway Swagger Importer tool
    git clone https://github.com/awslabs/aws-apigateway-importer.git

4\. The next step is to configure the application to utilize the correct Cognito Identity Pool created in the CloudFormation template in Step 1. The app reads the configuration from static variable named `IDENTITY_POOL_ID` declared in the `CognitoConfiguration` class in the `com.amazonaws.apigatewaydemo.configuration` package. Set the value to be the value of the Output Key `CognitoIdentityPool` from the CloudFormation stack output.

5\. Compile the source code for the Lambda function by running the following command.

    cd ~/api-gateway-secure-pet-store

    mvn package

If you are running the command from the CLI Instance then run the following docker command which will install the Maven image and package the software.

    cd ~/api-gateway-secure-pet-store

    docker run -it -v "$PWD":/usr/src/mymaven -v /tmp/.m2:/root/.m2 -w /usr/src/mymaven maven:3.3-jdk-8 mvn package

6\. Create the Lambda function by running the AWS CLI command:

    aws lambda create-function --function-name PetStoreFunction --zip-file fileb://target/api-gateway-secure-pet-store-1.0-SNAPSHOT.jar --role arn:aws:iam::934676248949:role/PetStoreDemo-PetStoreLambdaRole-18653PNMW2NV7 --runtime java8 --handler "com.amazonaws.apigatewaydemo.RequestRouter::lambdaHandler" --description "API Gateway Pet Store demo function" --timeout 15 --memory-size 512

* * *
