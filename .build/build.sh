#!/bin/bash

# Run docker image to build the themes.
docker run -e PATTERN=atom -v $PWD/output/:/src/output daylerees/rainglow:latest

# Kill old themes.
rm -rf ../themes/*

# Move themes to the root.
cp -R output/atom/* ../themes/

# Delete temp themes.
rm -rf output