const { fork}  = require("child_process");
const path = require("path");

// console.log(process.argv)

const child_process = fork(
  'vite',
  {
    cwd: path.resolve(__dirname, "../node_modules/.bin"),
    stdio: ['pipe', 'pipe', 'pipe', 'ipc'],
  },
)

child_process.on('error', (err) => {
  console.log(err);
})