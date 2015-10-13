#!/usr/bin/env bash

# Toggle sound
# This script is called from ~/.config/.i3/config

amixer set Master toggle

state=`amixer get Master\
		| grep Mono:\
		| sed 's/.*\[//g;s/\].*//g'\
		| tr a-z A-Z`

notify-send "Sound: $state"
