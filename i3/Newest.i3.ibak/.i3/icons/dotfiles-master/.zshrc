##
## kalterfive's zsh rc-config-file
##

## Solarized Dark ##
if [[ -t 2 ]]; then
	if [[ "$TERM" == linux ]]; then
		cat <<-"EOF"
			]P8073642
			]P1dc322f
			]P2859900
			]P3b58900
			]P4268bd2
			]P5d33682
			]P62aa198
			]P7eee8d5
			]P0002b36
			]P9cb4b16
			]PA586e75
			]PB657b83
			]PC839496
			]PD6c71c4
			]PE93a1a1
			]PFfdf6e3
			[H[J
		EOF
	fi
fi

## vi-like ##
bindkey -v

## Highlight ##
source /usr/share/zsh/plugins/zsh-syntax-highlighting/zsh-syntax-highlighting.zsh
ZSH_HIGHLIGHT_HIGHLIGHTERS=(main brackets)
 
## Completion ##
autoload -U compinit
compinit
setopt CORRECT_ALL
setopt autocd
zstyle ':completion:*' menu select=long-list select=0

## ls > $LS\d ##
function lsn() {
    while read num name; do
        echo "$num $name"
        declare -g "LS$num=$name"
    done <<< `ls -A1 "$@" | cat -n`
}

## History ##
HISTFILE=~/.zshistory
HISTSIZE=1000
SAVEHIST=1000

## Change title ##
function precmd() {
	print -Pn "\e]0;%n@%m: %~\a"
}

function preexec() {
	print -Pn "\e]0;%n@%m: $1\a"
}

## Aliases ##
alias ed='vim'

# grep
alias grep='grep --color=auto'
alias grp='grep'

# ls
alias ls='ls --color=auto'
alias l='ls'
alias ll='ls -l'
alias llsh='ls -lsh'
alias la='ls -a'
alias lal='ls -la'
alias lddi='ls -l /dev/disk/by-id'
alias lsh='ls -sh'

# pacman
alias pm='sudo pacman'
alias pa='pacaur'

# pacman: makepkg
alias mps='makepkg -s'
alias pmu='yes Y | pm -U *.pkg.tar.xz'
alias mpspmu='mps && pmu'

# Mount whith user-permissions
alias mnt='sudo mount -o gid=users,fmask=113,dmask=002'
alias umnt='sudo umount'

# Get top 10 shell commands
alias top10='print -l ${(o)history%% *} | uniq -c | sort -nr | head -n 10'

# Other
alias sndtgl='amixer set Master toggle'
alias q='exit'
alias rd='rm -rf'
alias s='sudo '
alias si='s -i'
alias rg='ranger'
alias C='cat'

# Global
alias -g BG='&& exit'
alias -g L='|wc -l'
alias -g H='|head'
alias -g G='|grep'
alias -g A='|awk'
alias -g P='|perl -pe'
alias -g S='|sed'
alias -g N='&>/dev/null'
alias -g V='|vim -'

## Hash's ##
hash -d cpkg=/var/cache/pacman/pkg
hash -d clog=/var/log
hash -d cess=/etc/systemd/system
hash -d cesu=/etc/systemd/user

## Simple prompt ##
## TODO: add exit code information
##       add git integration
export PROMPT="%c $> "

## Configure various PATHes ##
PATH="$PATH:$HOME/bin"
