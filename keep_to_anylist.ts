const AnyList = require('anylist');


const { readFileSync } = require('fs');
const config = JSON.parse(readFileSync('./config.json'))
const any = new AnyList({email: config.anylist_email, password: config.anylist_pass})

const { spawn } = require('child_process');
const pyProcess = spawn('pipenv', ['run', 'python', 'keep_to_anylist.py']);
const DEBUG = false;

pyProcess.stdin.setEncoding('utf-8');

pyProcess.stderr.on('data', function(data) {
  console.log(`received stderr: ${data.toString()}`)
});

pyProcess.stdout.on('data', function (data) {
  if(DEBUG) {
    console.log('Pipe data from python script ...');
    console.log(data.toString());
  }

  if (data == 'scriptdone\n') {
    console.log('donezo')
  }

  let items = data.toString().split("\n");

  if(DEBUG) {
    console.log('Connecting to Anylist')
  }

  any.login().then(async () => {
    await any.getLists();
    const testlist = any.getListByName('Shopping List');

    if(DEBUG) {
      console.log('have the shopping list. Time to start writing.')
    }

    items.forEach(item => {
      if(item) {
        if(DEBUG){
          console.log(`adding ${item}`);
        }
        let anyItem = any.createItem({name: item});
        testlist.addItem(anyItem);
        pyProcess.stdin.write(`${item}\n`);
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
  console.log(`Python script closed with code ${code}`)
  process.exit(0)
});
