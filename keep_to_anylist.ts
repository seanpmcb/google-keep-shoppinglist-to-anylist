const AnyList = require('anylist');
const any = new AnyList({email: 'seanpmcb@gmail.com', password: 'your password'});
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

  any.login().then(async () => {
    await any.getLists();
    const testlist = any.getListByName('Shopping List');

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
