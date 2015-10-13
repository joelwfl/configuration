#!/usr/bin/env bash

##
## Autostart-script
##

function getWorkspace() {
	echo `cat "$HOME/.config/i3/config"\
		| grep "set"\
		| grep "WS$1"\
		| perl -pe 's/^.+\$WS\d +(\d:)/\1/g'`
}

i3-msg "workspace `getWorkspace 1`"

# Set brightness
# 2343,5 == 30%
#brightness='/sys/class/backlight/intel_backlight/brightness'
#echo 2344 | sudo tee "$brightness" > /dev/null

# Keyboard daemon
kbdd

# X-resources
xrdb -merge $HOME/.config/xres

# Switch keyboard
setxkbmap "us,ru" ",winkeys" "grp:caps_toggle"

# Composer
compton --config $HOME/.config/compton.conf &

# Set background image
feh --no-fehbg --bg-fill $HOME/.config/i3/wall.jpg

# Music player daemon
mpd .config/mpd/mpd.conf

# Point-To-Point daemon
$HOME/bin/diald -1 &

# Notifications
$HOME/bin/dunst &

# Per Application Transparency
devilspie -a &

# New tmux session
tmux -L "session-$XDG_SESSION_ID" new-session -s "$USER-$XDG_SESSION_ID" -d
