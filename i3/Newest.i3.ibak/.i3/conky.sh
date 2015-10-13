#!/bin/sh
echo "{ \"version\": 1, \"stop_signal\": 10, \"cont_signal\": 12, \"click_events\": true }"
echo "[[] ,"
conky -c ~/.i3/conkyrc
IFS="}"
while read;do
IFS=" "
STR=`echo $REPLY | sed -e s/[{}]//g -e "s/ \"/\"/g" | awk '{n=split($0,a,","); for (i=1; i<=n; i++) {m=split(a[i],b,":"); if (b[1] == "\"name\"") {NAME=b[2]} if (b[1] =="\"x\"") {X=b[2]} if (b[1] =="\"y\"") {Y=b[2]} } print NAME " " X " " Y}'`
read NAME X Y <<< $STR
X=$(($X-50))
case "${NAME}" in
\"updates\")
yad --button gtk-apply:0 --text-info --geometry=200x200+$X+20 --class "YADWIN" --margins=10 --filename=<(pacman -Sup --print-format="%n %v" | grep -v "^::")
if [[ $? -eq 0 ]];then
urxvtc -e "/home/jwflol/.i3/conkexec.sh sudo pacmatic -Syu" -T "Menu Update"
fi
;;
\"date\")
yad --no-buttons --geometry=+$X+20 --class "YADWIN" --calendar
;;
\"temp\")
yad --no-buttons --text-info --geometry=500x260+$X+20 --class "YADWIN" --margins=10 --filename=<(acpi -V)
;;
\"bright\")
LEVEL=`/home/jwflol/.i3/blevel.sh`
OUT=`yad --text="Brightness" --scale --value $LEVEL --button gtk-ok:0 --geometry=x200+$X+20 --class "YADWIN" --vertical --text-align center`
if [[ $? -eq 0 ]];then
Q=`/home/jwflol/.i3/conkexec.sh sudo light $OUT`
fi
;;
\"volume\")
VOL=`/home/jwflol/.i3/pacvol.sh display | sed "s/[^1-9]//" | sed "s/%//"`
OUT=`yad --text="Volume" --scale --value $VOL --button gtk-ok:0 --geometry=x200+$X+20 --class "YADWIN" --vertical --text-align center`
if [[ $? -eq 0 ]];then
TARGET="$((655*$OUT))"
/home/jwflol/.i3/conkexec.sh pacmd set-sink-volume 0 $TARGET
fi
;;
*)
;;
esac
IFS="}"
done
