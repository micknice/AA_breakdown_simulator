const express = require('express');
const http = require('http');
const socketIO = require('socket.io');
const Simulation = require('../simulation/runSimulation');

const app = express();
const server = http.createServer(app);
const io = socketIO(server, { cors: { origin: "*" } });

let simulation;
let intervalId; 

app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', 'http://localhost:3000'); 
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
  next();
});

io.on('connection', (socket) => {
  console.log('connected');

  socket.on('sim', async (patrolCount, startStop) => {
    console.log('simulation var pre instance', simulation);
    if (!simulation) {
      simulation = new Simulation();
    }
    console.log('simulation var post instance', simulation);
    simulation.patrolCount = patrolCount;
    console.log('START SIM TRIGGERED');
    simulation.initializePatrols();
    
    
    simulation.startSimulation();

    intervalId = setInterval(() => {
      io.emit('patrolData', simulation.getPatrolDataForGUI());
      io.emit('iterationSummary', simulation.getIterationSummary());
      io.emit('activeJobLocs', simulation.getJobLocs());
    }, 5000);
  });

  socket.on('stopSim', () => {
    simulation.stopSimulation();
    console.log('stop sim received');
    clearInterval(intervalId);
  });
});

const port = 7071;
server.listen(port, () => {
  console.log(`Server listening on port ${port}`);
});
