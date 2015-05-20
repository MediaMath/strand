#!/bin/sh

if [[ "$OSTYPE" == "linux-gnu" ]]; then

	echo "linux setup..."
	npm install -g grunt-cli
	npm install -g grunt-init
	npm install -g bower
	npm install -g web-component-tester

elif [[ "$OSTYPE" == "darwin"* ]]; then

	echo "OSX Setup..."
	sudo npm install -g grunt-cli
	sudo npm install -g grunt-init
	sudo npm install -g bower
	sudo npm install -g web-component-tester

fi

npm install
bower install
mkdir -p ~/.grunt-init/
ln -s `pwd`/build/grunt-init ~/.grunt-init/ui
cp build/aws.json .