// import { module } from '../webpack.config'
import './index.less'


class Animal {
  constructor(name) {
    this.name = name 
  }
  getName() {
    return this.name
  }
}

const dog = new Animal('dog')
console.log('aaa')
//测试webpack配置的providePlugin
console.log(_map)