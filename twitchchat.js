const tmi = require('tmi.js');
const fs = require('fs');
var player = require('play-sound')(opts = {player: "mplayer64/mplayer.exe"})
var command;
var queue;
var delay = 0;
var perm = false;

function jsonReader(filePath, cb) { //https://medium.com/@osiolabs/read-write-json-files-with-node-js-92d03cc82824
    fs.readFile(filePath, (err, fileData) => {
        if (err) {
            return cb && cb(err)
        }
        try {
            const object = JSON.parse(fileData)
            return cb && cb(null, object)
        } catch(err) {
            return cb && cb(err)
        }
    })
}
jsonReader('./commands.json', (err, com) => {
    if (err) {
        console.log(err)
        return
    }
    command = com;
})

jsonReader('./queue.json', (err, que) => {
    if (err) {
        console.log(err)
        return
    }
    queue = que;
})

// Define configuration options
const options = {
  identity: {
    username: [insert username],
    password: [insert password]
  },
  channels: [
    [insert channel]
  ]
};

// Create a client with our options
const client = new tmi.client(options);

// Register our event handlers (defined below)
client.on('message', onMessageHandler);
client.on('connected', onConnectedHandler);

// Connect to Twitch:
client.connect();

// Called every time a message comes in
function onMessageHandler (target, context, msg, self) {
  if (self) { return; } // Ignore messages from the bot

  // Remove whitespace from chat message
  const commandName = msg.trim();

  // If the command is known, let's execute it
  if (commandName.substring(0, 8) === '!addcom ' && (context.mod == true || context.username == 'username')) {
      var com = commandName.slice(8);
      var i;
      var keycom;
      var resultcom;
      for (i = 0; i < com.length; i++)
      {
        if (com[i] == ' ')
        {
          keycom = com.slice(0, i);
          resultcom = com.slice(i+1, com.length);
          break;
        }
      }
      command.commands.push({
        key: keycom,
        result: resultcom
      })

      var jsonString = JSON.stringify(command)
      fs.writeFile ('./commands.json', jsonString, function(err) {
          if (err) throw err;
          console.log('complete');
          }
      );

      console.log(jsonString)
  }

  if (commandName.substring(0, 9) === '!editcom ' && (context.badges.broadcaster == '1' || context.badges.moderator == '1')) {
      var com = commandName.slice(9);
      var i;
      var keycom;
      var resultcom;
      for (i = 0; i < com.length; i++)
      {
        if (com[i] == ' ')
        {
          keycom = com.slice(0, i);
          resultcom = com.slice(i+1, com.length);
          break;
        }
      }
      var j;
      for(j = 0; j < command.commands.length; j++)
      {
        if (command.commands[j].key == keycom)
        {
          command.commands[j].result = resultcom
          break;
        }
      }

      var jsonString = JSON.stringify(command)
      fs.writeFile ('./commands.json', jsonString, function(err) {
          if (err) throw err;
          console.log('complete');
          }
      );

      console.log(jsonString)
  }

  if (commandName.substring(0, 8) === '!delcom '  && (context.badges.broadcaster == '1' || context.badges.moderator == '1')) {
      var com = commandName.slice(8);
      console.log(com);
      var i;
      var keycom;
      var resultcom;
      for (i = 0; i < com.length; i++)
      {
        if (com[i] == ' ')
        {
          keycom = com.slice(0, i);
          break;
        }
      }
      var j;
      console.log(com, " ")
      for(j = 0; j < command.commands.length; j++)
      {
        if (command.commands[j].key == com)
        {
          console.log(com, " ", command.commands[j].key)
          command.commands.splice(j,1);

          break;
        }
      }
      var jsonString = JSON.stringify(command)
      fs.writeFile ('./commands.json', jsonString, function(err) {
          if (err) throw err;
          console.log('complete');

          }
      );

      console.log(jsonString)

  }

  if(commandName == '!queue'){
    var qString = "1: ";
    if(queue.users.length != 0)
    {
      for (i = 0; i < queue.users.length; i++)
      {
        qString = qString + queue.users[i].person;
        if(i+1 != queue.users.length)
        {
          qString = qString + ", " + (i+2) + ": ";
        }
      }
    }
    else {
      qString = "The queue is empty!";
    }
    client.say(target, qString);
    console.log(`* Executed ${commandName} command`);
  }

  if(commandName == '!next' && (context.badges.broadcaster == '1' || context.badges.moderator == '1')){
    if(queue.users.length > 1)
    {
      console.log(queue.users[0].person)
      queue.users.splice(0,1);
      qString = "The next user is: " + queue.users[0].person
      console.log(queue.users[0].person)

    }
    else {
      qString = "The queue is empty!";
      if(queue.users.length == 1)
      {
          queue.users.splice(0,1);
      }

    }

    var jsonString = JSON.stringify(queue)
    fs.writeFile ('./queue.json', jsonString, function(err) {
        if (err) throw err;
        console.log('complete');
}
);

    client.say(target, qString);
    console.log(`* Executed ${commandName} command`);
  }

  if(commandName == '!join'){
    var i;
    if(queue.users.length == 0)
    {
      queue.users.push({
      person: context.username
      })
      qString = context.username + " has joined the queue in position: 1";
    }



    if(queue.users.length != 0)
    {
      for(i = 0; i < queue.users.length; i++)
      {
        console.log(queue.users[i].person + "..." + context.username)
        if (queue.users[i].person != context.username)
        {

          queue.users.push({
          person: context.username
          })
          qString = context.username + " has joined the queue in position: " + queue.users.length;
        }

      }
    }
    else
    {
      qString = "You are already in the queue!"
    }

    var jsonString = JSON.stringify(queue)
    fs.writeFile ('./queue.json', jsonString, function(err) {
        if (err) throw err;
        console.log('complete');
        }
      );

    client.say(target, qString);
    console.log(`* Executed ${commandName} command`);
  }

  if (commandName === '!commands') {
    var i;
    var comString = "!commands, ";
    for (i = 0; i < command.commands.length; i++)
    {
      comString = comString + "!" + command.commands[i].key;
      if(i+1 != command.commands.length)
      {
        comString = comString + ", ";
      }
    }
    client.say(target, comString);
    console.log(`* Executed ${commandName} command`);
  }

  else {
      try {
        var comValues = readCommand(commandName);
        var comReturn = comValues[0];
        var soundReturn = comValues[1];
        var permReturn = comValues[2];

        if(permReturn != null)
        {
          if(context.badges.subscriber == '3')
          {
            if(permReturn == '1' || permReturn == '2' || permReturn == '3')
            {
              perm = true;
            }
          }
          else if(context.badges.subscriber == '2')
          {
            if(permReturn == '1' || permReturn == '2')
            {
              perm = true;
            }
          }
          else if(context.badges.subscriber == '1')
          {
            if(permReturn == '1')
            {
              perm = true;
            }
          }
          else
          {
            perm = false;
          }
        }
        else
          {
            perm = true;
          }

        if(delay == 0 && soundReturn != null && perm == true)
        {
          try {

            soundString = 'sounds/' + soundReturn;
            player.play(soundString, function(err){
            if (err) throw err
            })
            init();
          }
          catch(e)
          {
            console.log("No sound file")
          }
        }
        else if(delay == 1) {
            comReturn = "Sorry, the sound alerts are on cooldown..."
        }
        else if(perm = false)
        {
            comReturn = "Sorry, you must be a tier" + permReturn + " subscriber to use that command."
            return;
        }

        if((comReturn == "falsecommand")){
          console.log("Command not found");
          return;
        }

        client.say(target, comReturn);
        console.log(`* Executed ${commandName} command`);
      }
      catch(err){
        console.log("command read error: ", err);
      }

    }
}

async function init(){
   console.log("sound delay start")
   delay = 1
   await sleep(15000)
   console.log("sound delay stop")
   delay = 0;
}

function sleep(ms){
    return new Promise(resolve=>{
        setTimeout(resolve,ms)
    })
}

function readCommand (com) {
  var i;
  if(com[0] != '!')
  {
    return ["falsecommand"];
  }
  var fixCom = com.split('!').join('')
  for(i = 0; i < command.commands.length; i++)
  {
    if (command.commands[i].key == fixCom)
    {
      return [command.commands[i].result, command.commands[i].soundfile, command.commands[i].permission];
    }
  }
  return ["falsecommand"]
}

// Called every time the bot connects to Twitch chat
function onConnectedHandler (addr, port) {
  console.log(`* Connected to ${addr}:${port}`);
}
