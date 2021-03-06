#
# Executes commands at login post-zshrc.
#
# Authors:
#   Sorin Ionescu <sorin.ionescu@gmail.com>
#

# Execute code that does not affect the current session in the background.
{
  # Compile the completion dump to increase startup speed.
  zcompdump="${ZDOTDIR:-$HOME}/.zcompdump"
  if [[ -s "$zcompdump" && (! -s "${zcompdump}.zwc" || "$zcompdump" -nt "${zcompdump}.zwc") ]]; then
    zcompile "$zcompdump"
  fi
} &!

# Print a random, hopefully interesting, adage.
if (( $+commands[fortune] )); then
  if [[ -t 0 || -t 1 ]]; then
    fortune -a
    print
  fi
fi

tmux run-shell "tmux bind-key -r $(printf '\303') display 'c3 prefix binding hack' \; \
     bind-key -r $(printf '\266') split-window -v"
tmux run-shell "tmux bind-key -r $(printf '\303') display 'c3 prefix binding hack' \; \
     bind-key -r $(printf '\245') split-window -h" 


