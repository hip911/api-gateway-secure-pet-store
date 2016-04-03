/*
 * Copyright 2015 Amazon.com, Inc. or its affiliates. All Rights Reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License"). You may not use this file except in compliance
 * with the License. A copy of the License is located at
 *
 * http://aws.amazon.com/apache2.0/
 *
 * or in the "license" file accompanying this file. This file is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES
 * OR CONDITIONS OF ANY KIND, either express or implied. See the License for the specific language governing permissions
 * and limitations under the License.
 */
package com.amazonaws.apigatewaydemo.configuration;

import com.amazonaws.regions.Regions;

/**
 * Configuration parameters for the Cognito credentials provider
 */
public class CognitoConfiguration {
    // TODO: Specify the identity pool id
    public static final String IDENTITY_POOL_ID = "eu-west-1:xxxxx-xxx-xxx-xxx-xxxxxxxxx";

    // Specify the custom provider name used by the identity pool
    public static final String CUSTOM_PROVIDER_NAME = "PetStoreProvider";

    // set the region to be EU (Ireland)
    public static final Regions REGION = Regions.EU_WEST_1;

    // This should not be changed, it is a default value for Cognito.
    public static final String COGNITO_PROVIDER_NAME = "cognito-identity.amazonaws.com";
}
