const curry = (fn: any, ...args: any) => {
    if (args.length < fn.length) {
        // 未接受完参数，拼上参数
        return (..._args: any) => curry(fn, ...args, ..._args)
    } else {
        // 接受完所有参数，直接执行
        return fn(...args)
    }
}

const add = (a: any, b: any, c: any) => {
    return a + b + c
}

const curried = curry(add)

console.log(curried(1)(2)(3)) // 输出 6 
console.log(curried(1, 2)(3)) // 输出 6 
console.log(curried(1)(2, 3)) // 输出 6
console.log(curried(1, 2, 3)) // 输出 6









