const AnyList = require('anylist');


const { readFileSync } = require('fs');
const config = JSON.parse(readFileSync('./config.json'))
const any = new AnyList({email: config.anylist_email, password: config.anylist_pass})

const { spawn } = require('child_process');
const pyProcess = spawn('pipenv', ['run', 'python', 'keep_to_anylist.py']);
const DEBUG = false;

pyProcess.stdin.setEncoding('utf-8');

// used to log python output
pyProcess.stderr.on('data', function(data) {
  console.log(`${data.toString()}`)
});

pyProcess.stdout.on('data', function (data) {
  if(DEBUG) {
    console.log('ts: Pipe data from python script ...');
    console.log(data.toString());
  }

  if (data == 'scriptdone\n') {
    console.log('ts: scriptdone')
  }

  let items = data.toString().split("\n");

  if(DEBUG) {
    console.log('ts: Connecting to Anylist')
  }

  any.login().then(async () => {
    await any.getLists();
    const shoppinglist = any.getListByName('Shopping List');
    const seanslist = any.getListByName('Sean\'s List');

    if(DEBUG) {
      console.log('ts: have the shopping list. Time to start writing.')
    }

    items.forEach(item => {
      if(item) {
        
        // Split the item on the colon
        const [prefix, ...itemParts] = item.split(':');
        // Join the remaining parts in case the item name itself contains colons
        const itemName = itemParts.join(':').trim();
        
        if (itemName) {
          let targetList;
          if (prefix === 'Shopping') {
            targetList = shoppinglist;
          } else if (prefix === "Sean's") {
            targetList = seanslist;
          }
          
          if (targetList) {
            if(DEBUG){
              console.log(`ts: writing ${item} to ${targetList.name}`);
            }
            let anyItem = any.createItem({name: itemName});
            targetList.addItem(anyItem);
            if(DEBUG) {
              console.log(`ts: asking to delete ${item}`);
            }
            pyProcess.stdin.write(`${item}\n`);
          }
        }
      }
    });
    pyProcess.stdin.write('donezo\n')
    if(DEBUG){
      console.log('tearing down anylist');
    }
    any.teardown();
  });
});

pyProcess.on('close', (code) => {
  if(code){
    console.log(`Python script closed with code ${code}`)
  } else {
    console.log('Update succeeded')
  }
  process.exit(0)
});
