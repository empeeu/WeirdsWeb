#Weirds Web
Website for family card game. 

Built on meteor.

## Add-on packages
*These were added using meteor add `<package_name>`*

1. underscore
2. iron:router
#3. mrt:bootstrap-3
4. less
5. nemo64:bootstrap
6. Clone stylesheet boiler plate
   cd client
   git clone https://github.com/DerMambo/stylesheets.git
   # Delete the .git files in that filder
   # Make modifications to client/vendor/custom.bootstrap.json


## A few notes

* Files in /lib are loaded before anything else
* Any main.* file is loaded *after* anything else
* Everything else loads in alphabetical order based on file name
* Code in /server only runs on the server
* Code in /client only runs on the client

## Reading

* Continue from pg 75

