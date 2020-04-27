# posecore-web-client

This is a body sensor webclient to the PoseCore server.

It uses the camera on the device you are using to capture the position of all body parts and send these to PoseCore clients over a PoseCore server.

This module can only be used together with the PoseCore server, found here: https://github.com/miman/posecore-srv-electron

# Using the library

## Run the project

**npx parcel index.html** will start the server at http://localhost:1234

## Build a deployment package

Run **npx parcel build index.html**

This will create a distribution under the dist folder.
