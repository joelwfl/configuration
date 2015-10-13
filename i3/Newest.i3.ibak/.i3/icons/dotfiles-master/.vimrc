" syntax and color scheme
sy on
if $TERM == "linux"
	colorscheme industry
else
	colorscheme ron
endif

" numbers of lines
set number
 
" ignore register in the search
set ic
 
" highlight text in the search
set hls
 
" 1 tab = x space
set ts=4
 
" word wrap
set linebreak
set dy=lastline
 
" show tabs
set showtabline=2
 
" previous tab
imap <F5> <Esc> :tabprev <CR>i
map <F5> :tabprev <CR>
 
" next tab
imap <F6> <Esc> :tabnext <CR>i
map <F6> :tabnext <CR>
 
" new tab
imap <F4> <Esc>:browse tabnew<CR>
map <F4> <Esc>:browse tabnew<CR>
