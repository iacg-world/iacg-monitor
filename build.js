const { spawn } = require('child_process')

console.log(process.argv)

const projectName = process.argv[2] || 'web'

const child_process = spawn(
  'vite.cmd',
  ['build', '--', , '--mode ', 'lib', '--projectName', `${projectName}`],
  {
    stdio: 'inherit',
  },
)

child_process.on('error', err => {
  console.log(err)
})

child_process.on('close', code => {
  console.log(`vite 进程退出，退出码 ${code}`)
})
