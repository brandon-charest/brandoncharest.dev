+++
title = "Copy Current Path"
date = "2025-12-30T11:09:33.172Z"
description = "Simple alias command to copy current working path to clipboard."

[taxonomies]
tags = [ "terminal", "bash", "zsh" ]

[extra]
type = "snippet"
growth = "evergreen"
+++


Create this alias into your `.aliases/.zshrc/.bashrc` or where ever you store aliases for easier use later.

```bash
alias cpwd="pwd | tr -d '\n' | pbcopy && echo 'pwd copied to clipboard'"
```

See blog post for more details.

[Copy Current Path](/blog/copy-current-path)
