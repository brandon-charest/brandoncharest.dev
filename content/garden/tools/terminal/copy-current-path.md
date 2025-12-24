+++
title = "Terminal: Copy Current Path"
date = "2025-12-18T14:40:23.172Z"
description = "Simple alias command to copy current working path to clipboard."

[taxonomies]
tags = [ "terminal", "bash", "zsh" ]

[extra]
status = "stable"
+++
## TLDR: 
Create this alias into your `.aliases/.zshrc/.bashrc` or where ever you store aliases for easier use later.
```bash
alias cpwd="pwd | tr -d '\n' | pbcopy && echo 'pwd copied to clipboard'"
```

Recently I have been spending a little more time using the terminal for work and have had a few instances where I needed to copy the current directory I am in. Now in most cases you could just use the mouse to highlight and copy the directory you need, but I am ~~pretty lazy~~ motivated to try and make this a little easier as I suppose there could be a time where using a mouse is not an option.

## Parts Breakdown
### pwd: print working directory
```bash
$ pwd
/User/(username)
```
Prints the current directory path you are in.

---
### tr: translate characters
```bash
tr -d '\n'
```
This will copy standard input to the standard output with substation or deletion of selected characters.

The pwd command above will produce the working directory string but it will have a line return character `\n` appended to it.

We use the `-d` command to signal that we want to delete a character off the string and `\n` to signal which character we wish to delete.

---
### Copying to system clipboard
Depending on if you are on OSX or Windows the copy command could be different

_Windows_
- **clip**

_OSX_
- **pbcopy**

this will copy text to the system clipboard (by default).

---
### echo: Writes to the standard output.
```bash
echo 'pwd copied to clipboard'
```
This part is not needed I just personally like to have something in my commands that will tell me that the command was at least executed.

---
## Pipe it all together
All of these above commands are used with a pipe `|` which will feed the 'output' of one command to the next.

So the flow will be the following.

1. pwd prints out the working directory
2. That output is now fed to our **tr** argument which will remove the trailing newline character
3. finally that entire string will be placed into our clipboard for use with the help of pbcopy/clip.
4. Then an echo at the very end will just print to the screen that the command has been executed

## Final

Now this is far from the only way to do this, I believe a popular way would be to just use **xclip** but that may take an install and I tried to find a way to use only what is available by default.

I hope that someone may find his useful. What are some of the things you have learned in the terminal that has saved you time/made things easier? Let me know! 😃