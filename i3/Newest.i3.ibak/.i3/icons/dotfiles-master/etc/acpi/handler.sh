#!/usr/bin/env bash

case "$1" in
	button/volumedown)
		case $2 in
			VOLDN)
				logger "ACPI button/volumedown"
				amixer set Master 5-
			;;

			*)
				logger "ACPI action undefined: $2"
			;;
		esac
	;;

	button/volumeup)
		case $2 in
			VOLUP)
				logger "ACPI button/volumeup"
				amixer set Master 5+
			;;

			*)
				logger "ACPI action undefined: $2"
			;;
		esac
	;;


#	{{{ i3wm-config

	button/mute)
		case "$2" in
			MUTE)
				logger "ACPI button/mute"
#				amixer set Master toggle
			;;

			*)
				logger "ACPI action undefined: $2"
			;;
		esac
	;;

	video/brightnessdown)
		case "$2" in
			BRTDN)
				logger "ACPI video/brightnessdown"
#				bl_dev=/sys/class/backlight/intel_backlight
#				step=100
#				echo $(($(< $bl_dev/brightness) - $step)) >$bl_dev/brightness
			;;

			*)
				logger "ACPI action undefined: $2"
			;;
		esac
	;;

	video/brightnessup)
		case "$2" in
			BRTUP)
				logger "ACPI video/brightnessup"
#				bl_dev=/sys/class/backlight/intel_backlight
#				step=100
#				echo $(($(< $bl_dev/brightness) + $step)) >$bl_dev/brightness
			;;

			*)
				logger "ACPI action undefined: $2"
			;;
		esac
	;;

#	}}}

#	{{{	systemd

#	button/power)
#		case "$2" in
#			PBTN)
#				logger 'power/button PBTN'
#				sudo poweroff
#			;;
#
#			*)
#				logger "power/button $2"
#			;;
#		esac
#	;;
#
#	button/lid)
#		case "$3" in
#			close)
#				logger 'LID closed'
#				sudo pm-suspend
#			;;
#
#			open)
#				logger 'LID opened'
#			;;
#
#			*)
#				logger "ACPI action undefined: $3"
#			;;
#		esac
#	;;
#
#	button/sleep)
#		case "$2" in
#			SBTN)
#				logger "ACPI button/sleep"
#				echo -n mem | sudo tee /sys/power/state > /dev/null
#			;;
#
#			PNP0C0E:00)
#				logger "ACPI button/sleep PNP0C0E:00"
#			;;
#
#			*)
#				logger "ACPI action undefined: $2"
#			;;
#		esac
#	;;

#	}}}

	*)
		logger "ACPI group/action undefined: $1 / $2"
	;;
esac
