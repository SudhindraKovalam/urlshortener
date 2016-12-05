# URL Shortener

## Overview

This is a simple node js app (written in Typescript) to generate short urls for input URLs, a POC for a site like bit.ly. The shortened URLS are hashed and stored in a redis server and requests (for shortening and expanding urls) are logged to an azure table storage table.

## Running the app in your local environment

Please ensure that you have the latest node.js version installed.
	
```text

$>git clone https://github.com/SudhindraKovalam/urlshortener.git
$>npm install 

```

Once all the dependencies are installed, you need to set some environment variables for the app to connect to the appropriate azure storage account and REDIS server for data storage.
This app uses a npm package called dotenv https://www.npmjs.com/package/dotenv  
to load environment variables for development purposes.
To set the required environment variables, create a .env file in the root of the project dir.
Add the following environment variables to this file.
 * AZURE_STORAGE_ACCOUNT
 * AZURE_STORAGE_ACCESS_KEY
 * REDISCACHE_SERVER_DNS_NAME
 * REDISCACHE_KEY
 * REQUEST_LOG_TABLE_NAME
 * SERVICE_DNS_NAME
 * PORT=3000
 * NODE_ENV

A sample .env file for reference:
```text
.env

# azure env variables
AZURE_STORAGE_ACCOUNT=<XYZ>  // Storage account name
AZURE_STORAGE_ACCESS_KEY=XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX

REDISCACHE_SERVER_DNS_NAME=<ABC>.redis.cache.windows.net // Redis Server DNS name
REDISCACHE_KEY=XXXXXXXXXXXXXXXXXXXXXXXX

# app settings
REQUEST_LOG_TABLE_NAME=requestlogs
SERVICE_DNS_NAME=http://localhost:3000

# Node Environment
NODE_ENV=development
PORT=3000
```
Once the .env file is created, go ahead and launch the app by running the following commands

```text

$>gulp scripts
$>npm start 

```

## Unit Testing

A few unit tests have been defined for testing the most common code paths for running all tests, please run the command 

```text
$>npm test 

```


## Hosting

The application is hosted in a azure web app http://urlshortenlinux.azurewebsites.net/ 

### Continuous Deployment
This git repository is linked to the azure web app's, Continuous delivery plugin and commits to master branch result in a deployment


