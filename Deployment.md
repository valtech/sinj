# Deployment #

You will need to add two files to your Sitecore solution:

To the bin folder add:
  * Sinj.dll

Under the Sitecore folder add:
  * PushHandler.ashx

## Security ##

For security make sure that PushHandler.ashx is locked down so that it is only accessible from trusted internet addresses.