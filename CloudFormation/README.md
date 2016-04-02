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
*   **Xcode**  
    To run the example mobile application you need to have Xcode installed which relies on you having a Mac OSX laptop. To install Xcode follow the instructions outlined here: https://developer.apple.com/xcode/download/
## Overview
This workshop has a couple of exercises

aws lambda create-function --function-name PetStoreFunction --zip-file fileb://target/api-gateway-secure-pet-store-1.0-SNAPSHOT.jar --role arn:aws:iam::934676248949:role/PetStoreDemo-PetStoreLambdaRole-18653PNMW2NV7 --runtime java8 --handler "com.amazonaws.apigatewaydemo.RequestRouter::lambdaHandler" --description "API Gateway Pet Store demo function" --timeout 15 --memory-size 512

* * *
