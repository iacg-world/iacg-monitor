export const getCommandValue = (command) => {
  const arrIndex = process.argv.findIndex(item => item === `--${command}`)
  return arrIndex === -1 || !process.argv[arrIndex + 1] ? false : process.argv[arrIndex + 1]
}