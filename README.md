Calendar
========

The Calendar app, built with Enyo2, for webOS Ports.

Building
--------

A makefile is including for easing the building processes. The makefile assumes you have Node installed, as well as the Palm/HP webOS command-line tools.

# make build

Runs the standard Enyo2 minification and deployment process

# make run

First, runs `build`, then installs and launches the application on a connected device using palm-install and palm-launch.

# make debug

Doesn't exist yet, but will start logging.