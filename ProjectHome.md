# SINJ (Sitecore Ninja JavaScript) #

**THE content deployment framework for Sitecore by developers for developers...**

Features include:
  * Manage Sitecore content in source control
  * Avoid uses Sitecore  packages to deploy
  * Extremely light-weight
  * Precise control over content changes
  * Apply changes to master then web without publishing
  * Content changes are human readable and easy to merge in source control
  * Integrate content deployment into your build process
  * Deploy content in a matter of seconds across environments
  * Choose the content you want to manage
  * Field level changes can be deployed easily
  * Automate repetitive Sitecore content changes
  * Plus anything else you want - it's totally extendable :-)

## SINJ Overview (a.k.a. the Sitecore revolution) ##

In a nutshell: SINJ allows you to script Sitecore content changes using JavaScript.

Here's a super simple example:

```
var homeItem = scItem("{110D559F-DEA5-42EA-9C1C-8A5DF7E70EF9}");

var itemUpdates = [
	{
		item: homeItem,
		fields: {
			"Title": "hello world"
		}
	}
]

scUpdateItems(itemUpdates);
```

The SINJ command line tools allows you to run the JavaScript updates against Sitecore from your PC or as part of your build process:

```
sinj.commandline "updates1.js" "updates2.js" ...
```

The command line tools runs in a matter of seconds.