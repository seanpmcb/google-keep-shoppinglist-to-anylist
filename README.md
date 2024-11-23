# google-keep-shoppinglist-to-anylist
Because Google is a jerk and I want Google Assistant to add items to my shopping list, but I don't want to use Keep or the Google Shoppinglist webapp. Instead we use Anylist. This will sync items from keep to anylist.

After adding the correct passwords and email addresses, run via `/usr/bin/node keep_to_anylist.ts` assuming all the backgound config (not entirely outlined here) is established.

## Config

It is strongly recommended that you create an application password to allow access to google keep.

Create a `config.json` file containing the following...
```
{
    "keep_email": "your google keep email",
    "keep_token": "your google keep token obtained via https://gkeepapi.readthedocs.io/en/latest/#obtaining-a-master-token",
    "anylist_email": "your anylist email",
    "anylist_pass": "your anylist password"
}
```

## Tech notes

This is a narly node process spawning a python process to use some libraries that I didn't want to write myself.

Notes:
* Requires a python build using openssl-1.1.1, which may or may not also require downgrading requests and/or urllib3. I did all of the three using a pyenv install of python 3.10.0
* pipenv needed over poetry due to install errors with gpsoauth
