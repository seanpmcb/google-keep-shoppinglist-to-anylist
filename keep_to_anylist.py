import json
from sys import stdin, stdout, stderr

import gkeepapi

DEBUG = False
config = {}
with open('config.json', 'r') as config_file:
    config = json.load(config_file)

keep = gkeepapi.Keep()
success = keep.authenticate(config['keep_email'], config['keep_token'])

# notes = keep.find('Shopping')
shoppinglist = None
seanslist = None
notes = keep.all()
items_to_move = []
for note in notes:
    if note.title == 'Shopping':
        shoppinglist = note
    if note.title == "Sean's":
        seanslist = note
    if shoppinglist and seanslist:
        break

for child in shoppinglist.children:
    if not child.checked:
        items_to_move.append("Shopping:" + child.text.strip())

for child in seanslist.children:
    if not child.checked:
        items_to_move.append("Sean's:" + child.text.strip())

if not items_to_move:
    exit()

if DEBUG:
    print('py: sending items from python', items_to_move, file=stderr)

for item in items_to_move:
    stdout.write(item)
    stdout.write('\n')
stdout.flush()

if DEBUG:
    print('py: waiting for items to delete', file=stderr)
for line in stdin:
    if DEBUG:
        print('py:read', line, file=stderr)
    item_to_delete = line.strip()
    if item_to_delete == 'donezo':
        exit()
    if item_to_delete in items_to_move:
        if DEBUG:
            print('py: valid item to delete', item_to_delete, file=stderr)
        prefix, item_name = item_to_delete.split(':')
        if prefix == 'Shopping':
            target_list = shoppinglist
        elif prefix == 'Sean\'s':
            target_list = seanslist
        else:
            print('py: unknown prefix', file=stderr)
            continue
        for child in target_list.children:
            if child.text.strip() == item_name:
                if DEBUG:
                    print('py: found and deleteing', file=stderr)
                else:
                    print('py: could not find and delete', item_name, file=stderr)
                child.checked = True
                keep.sync()
    else:
        print('py: invalid item to delete', item_to_delete, 'not found in', items_to_move, file=stderr)
