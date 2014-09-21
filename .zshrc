
# Path to your oh-my-zsh installation.
export ZSH=$HOME/.oh-my-zsh
export TERMINAL=uxterm
# Set name of the theme to load.
# Look in ~/.oh-my-zsh/themes/
# Optionally, if you set this to "random", it'll load a random theme each
# time that oh-my-zsh is loaded.
ZSH_THEME="kphoen"

# Uncomment the following line to use case-sensitive completion.
# CASE_SENSITIVE="true"

# Uncomment the following line to disable bi-weekly auto-update checks.
# DISABLE_AUTO_UPDATE="true"

# Uncomment the following line to change how often to auto-update (in days).
# export UPDATE_ZSH_DAYS=13

# Uncomment the following line to disable colors in ls.
# DISABLE_LS_COLORS="true"

# Uncomment the following line to disable auto-setting terminal title.
# DISABLE_AUTO_TITLE="true"

# Uncomment the following line to enable command auto-correction.
# ENABLE_CORRECTION="true"

# Uncomment the following line to display red dots whilst waiting for completion.
# COMPLETION_WAITING_DOTS="true"

# Uncomment the following line if you want to disable marking untracked files
# under VCS as dirty. This makes repository status check for large repositories
# much, much faster.
# DISABLE_UNTRACKED_FILES_DIRTY="true"

# Uncomment the following line if you want to change the command execution time
# stamp shown in the history command output.
# The optional three formats: "mm/dd/yyyy"|"dd.mm.yyyy"|"yyyy-mm-dd"
# HIST_STAMPS="mm/dd/yyyy"

# Would you like to use another custom folder than $ZSH/custom?
# ZSH_CUSTOM=/path/to/new-custom-folder

# Which plugins would you like to load? (plugins can be found in ~/.oh-my-zsh/plugins/*)
# Custom plugins may be added to ~/.oh-my-zsh/custom/plugins/
# Example format: plugins=(rails git textmate ruby lighthouse)
# Add wisely, as too many plugins slow down shell startup.
plugins=(git)

source $ZSH/oh-my-zsh.sh

# User configuration

export PATH="/home/joel/bin:/usr/local/sbin:/usr/local/bin:/usr/sbin:/usr/bin:/sbin:/bin:/usr/games"
# export MANPATH="/usr/local/man:$MANPATH"

# You may need to manually set your language environment
# export LANG=en_US.UTF-8

# Preferred editor for local and remote sessions
# if [[ -n $SSH_CONNECTION ]]; then
 export EDITOR='vim'
# else
#   export EDITOR='mvim'
# fi

# Compilation flags
# export ARCHFLAGS="-arch x86_64"

# ssh
# export SSH_KEY_PATH="~/.ssh/dsa_id"

# Set personal aliases, overriding those provided by oh-my-zsh libs,
# plugins, and themes. Aliases can be placed here, though oh-my-zsh
# users are encouraged to define aliases within the ZSH_CUSTOM folder.
# For a full list of active aliases, run `alias`.
#
# Example aliases
# alias zshconfig="mate ~/.zshrc"
# alias ohmyzsh="mate ~/.oh-my-zsh"
alias ls="ls -h --color=auto"
alias gresources="gedit /home/joel/.Xresources"
alias grc="gedit /home/joel/.config/openbox/rc.xml"
alias gmenu="gedit /home/joel/.config/ob-menu-generator/config.pl"
alias process="ps -eo pcpu,pid,user,args | sort -k 1 -r | head -10"
alias MAIL="/var/spool/mail/joel && export MAIL"
alias cal="gcalcli calw 2"
alias ncm="ncmpcpp -h 192.168.1.2 -p 1337"
alias rest=" xrdb /home/joel/.Xresources|kill $PPID|urxvt"
imgur() {
    for i in "$@"; do
        curl -# -F "image"=@"$i" -F "key"="4907fcd89e761c6b07eeb8292d5a9b2a" imgur.com/api/upload.xml|\
        grep -Eo '<[a-z_]+>http[^<]+'|sed 's/^<.\|_./\U&/g;s/_/ /;s/<\(.*\)>/\x1B[0;34m\1:\x1B[0m /'
    done
}
export PAGER=less


export PAGER=less


export PAGER=less


export PAGER=less


export P6AGER=less

unpack () {
    if [ -f $1 ] ; then      
      case $1 in
        *.tar.bz2)   tar xjf $1       -C $2   ;;
        *.tar.gz)    tar xzf $1      -C $2   ;;
        *.bz2)       bunzip2 $1     ;;
        *.rar)       unrar e $1     ;;
        *.gz)        gunzip $1      ;;
        *.tar)       tar xf $1    -C $2 ;;
        *.tbz2)      tar xjf $1    -C $2 ;;
        *.tgz)       tar xzf $1    -C $2 ;;
        *.zip)       unzip $1 -d $2      ;;
        *.Z)         uncompress $1  $2 ;;
        *.7z)        7z x $1  -O $2   ;;
        *)     echo "'$1' cannot be extracted via extract()" ;;
         esac
     else
         echo "'$1' is not a valid file"
     fi
}
alias apt-unlock=" sudo rm /var/lib/apt/lists/lock && sudo rm /var/cache/apt/archives/lock

"
#export -f unpack
whichprocess() {
    #do things with parameters like $1 such as
    ps axww | grep $1
}
alias which="whichprocess"

vilken() { ps axww | grep "$1"; }
alias kalender="/opt/extras.ubuntu.com/calendar-indicator/bin/calendar-indicator"
alias vimauto="vim /home/joel/.config/openbox/autostart.sh"
alias vimrc="vim /home/joel/.config/openbox/rc.xml"
alias vimschema="vim /home/joel/.config/obmenu-generator/schema.pl"
export PAGER="less"

alias gz="tar xzf"
alias chistory="strings .zsh_history >hist.txt;fc -R hist.txt;fc -W"   
alias extract="/bin/extract" 
