// 扩展 Function 接口
interface Function {
    myBind(this: Function, context: any, ...args: any[]): (...newArgs: any[]) => any;
}

// 实现 myBind 方法
Function.prototype.myBind = function (this: Function, context: any, ...args: any[]): (...newArgs: any[]) => any {
    // 保存当前函数的引用
    const fn = this;

    // 返回一个新的函数
    return function (...newArgs: any[]) {
        // 使用 apply 调用原始函数，并传入合并后的参数
        return fn.apply(context, args.concat(newArgs));
    };
};
function greet(this: any, greeting: string, punctuation: string) {
    console.log(greeting + ', ' + this.name + punctuation);
}
const person = { name: 'John' };

const greetPerson = greet.myBind(person, 'Hello');

greetPerson('!');
