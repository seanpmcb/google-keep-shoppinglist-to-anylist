import json
from sys import stdin, stdout, stderr

import gkeepapi

DEBUG = False
config = {}
with open('config.json', 'r') as config_file:
    config = json.load(config_file)

keep = gkeepapi.Keep()
success = keep.authenticate(config['keep_email'], config['keep_token'])

notes = keep.find('Shopping')
shoppinglist = None

items_to_move = []
for note in notes:
    if note.title == 'Shopping':
        shoppinglist = note
        break

for child in shoppinglist.children:
    if not child.checked:
        items_to_move.append(child.text)

if not items_to_move:
    exit()

if DEBUG:
    print('sending items from python', file=stderr)

for item in items_to_move:
    stdout.write(item)
    stdout.write('\n')
stdout.flush()

if DEBUG:
    print('waiting for items to delete', file=stderr)
for line in stdin:
    if DEBUG:
        print('read something', file=stderr)
    item_to_delete = line.strip()
    if item_to_delete == 'donezo':
        exit()
    if item_to_delete in items_to_move:
        if DEBUG:
            print('valid item to delete', file=stderr)
        for child in shoppinglist.children:
            if child.text == item_to_delete:
                if DEBUG:
                    print('found and deleteing', file=stderr)
                if not DEBUG:
                    child.checked = True
                keep.sync()
