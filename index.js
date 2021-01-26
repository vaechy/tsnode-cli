#!/usr/bin/env node
const fs = require('fs')
//使用commander解析命令行参数
const program = require('commander')
//使用download-git-repo下载git模版
const download = require('download-git-repo')
//使用ora增加download loading效果
const ora = require('ora')
//监听命令行用户输入
const inquirer = require('inquirer')
//handlebars使用模板引擎把用户输入的数据解析到 package.json 文件中
const handlebars = require('handlebars')
//使用chalk和log-symbols增加文本样式
const chalk = require('chalk')
const logSymbols = require('log-symbols')
//模板
// const templates = require('./templates')

program
  .version('0.1.0') // -v 或者 --version 的时候会输出该版本号

program
  // .command('init <template-name> [project-name]')
  .command('init <project-name>')
  .description('Initialize the project template')
  // .action((templateName, projectName) => {
    .action((projectName) => {
    console.log(projectName)
    // loading 提示
    const spinner = ora('Downloading the template...').start()

    // download
    //    第一个参数：仓库地址
    //    第二个参数：下载路径
    // const { downloadUrl } = templates[templateName]
    download(`http://github.com:vaechy/ts-node#master`, projectName, { clone: true }, (err) => {
      if (err) {
        spinner.fail()
        console.log(logSymbols.error, chalk.red(err))
        return
      }

      spinner.succeed()

      // 使用向导的方式采集用户输入的值
      inquirer.prompt([{
        type: 'input',
        name: 'name',
        message: 'Please enter a project name',
        default: projectName
      }, {
        type: 'input',
        name: 'description',
        message: 'Please enter project description'
      }, {
        type: 'input',
        name: 'author',
        message: 'Please enter author name'
      }]).then((answers) => {
        // 把项目下的 package.json 文件读取出来
        const packagePath = `${projectName}/package.json`
        const packageContent = fs.readFileSync(packagePath, 'utf8')

        // 使用模板引擎把用户输入的数据解析到 package.json 文件中
        const packageResult = handlebars.compile(packageContent)(answers)

        // 解析完毕，把解析之后的结果重新写入 package.json 文件中
        fs.writeFileSync(packagePath, packageResult)

        console.log(logSymbols.success, chalk.yellow('Successfully initialized the template'))
      })
    })
  })

// program
//   .command('list')
//   .description('查看所有可用模板')
//   .action(() => {
//     for (let key in templates) {
//       console.log(`
// ${key}  ${templates[key].description}`)
//     }
//   })

// 没有任何命令的时候输出使用帮助
if (!process.argv.slice(2).length) {
  program.outputHelp()
}

program.parse(process.argv)
