#!/bin/bash

AB=`cat /sys/class/backlight/radeon_bl0/brightness`
MB=`cat /sys/class/backlight/radeon_bl0/max_brightness`
echo "$AB*100/$MB" | bc -l | xargs printf "%1.0f"

