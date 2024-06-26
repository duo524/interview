enum PromiseStatus {
    PENDING = 'pending',
    FULFILLED = 'fulfilled',
    REJECTED = 'rejected'
}

type Fulfilled = (res: unknown) => unknown
type Rejected = (err: unknown) => unknown

function isFunc(fn: (value: unknown) => unknown) {
    return typeof fn === 'function'
}
//判断一个值是不是可迭代对象
function isIterator(val: any) {
    return typeof val[Symbol.iterator] === 'function'
}

const resolvePromise = (promise: any, data: any, resolve: Fulfilled, reject: Rejected) => {
    if (data === promise) {
        return reject(new TypeError('禁止循环引用'));
    }
    let called = false
    if (((Object.prototype.toString.call(data) === '[object Object]' && data !== null) || isFunc(data))) {
        try {
            const then = data.then
            if (isFunc(then)) {
                then.call(data, (value: unknown) => {
                    if (called) {
                        return
                    }
                    called = true
                    // 递归执行，避免value是一个PromiseLike,Promise.resolve中的嵌套thenable在这里解决。
                    resolvePromise(promise, value, resolve, reject)
                }, (reason: unknown) => {
                    if (called) {
                        return
                    }
                    called = true
                    reject(reason)
                })
            } else {
                resolve(data)
            }
        } catch (e: unknown) {
            if (called) {
                return
            }
            called = true
            reject(e)
        }
    } else {
        // data是null,undefined,普通引用值等
        resolve(data)
    }
}

class MyPromise {
    status: PromiseStatus
    value: unknown
    reason: unknown
    onFulfilledCallBacks: Array<(value: unknown) => void>
    onRejectedCallBacks: Array<(value: unknown) => void>

    constructor(executor: unknown) {
        this.status = PromiseStatus.PENDING
        this.onFulfilledCallBacks = []
        this.onRejectedCallBacks = []
        if (typeof executor !== 'function') {
            throw TypeError('executor 必须是函数')
        }

        const resolve: Fulfilled = (value: unknown) => {
            if (this.status === PromiseStatus.PENDING) {
                this.status = PromiseStatus.FULFILLED
                this.value = value
                this.onFulfilledCallBacks.forEach(cb => isFunc(cb) && cb(value))
            }
        }

        const reject: Rejected = (reason: unknown) => {
            if (this.status === PromiseStatus.PENDING) {
                this.status = PromiseStatus.REJECTED
                this.reason = reason
                this.onRejectedCallBacks.forEach(cb => isFunc(cb) && cb(reason))
            }
        }

        try {
            executor(resolve, reject)
        } catch (e) {
            reject(e)
        }
    }

    then(onFulfilled: Fulfilled = () => { }, onRejected: Rejected = () => { }): MyPromise {
        onFulfilled = isFunc(onFulfilled) ? onFulfilled : (value) => value
        onRejected = isFunc(onRejected) ? onRejected : (err) => { throw err }

        const promise = new MyPromise((resolve: Fulfilled, reject: Rejected) => {
            const fulfilledCallBack = (value: unknown) => {
                queueMicrotask(() => {
                    try {
                        const result = onFulfilled(value)
                        resolvePromise(promise, result, resolve, reject)
                    } catch (e) {
                        reject(e)
                    }
                })
            }
            const rejectedCallBack = (reason: unknown) => {
                queueMicrotask(() => {
                    try {
                        const result = onRejected(reason)
                        resolvePromise(promise, result, resolve, reject)
                    } catch (e) {
                        reject(e)
                    }
                })
            }
            switch (this.status) {
                case PromiseStatus.FULFILLED:
                    fulfilledCallBack(this.value)
                    break
                case PromiseStatus.REJECTED:
                    rejectedCallBack(this.reason)
                    break
                case PromiseStatus.PENDING:
                    this.onFulfilledCallBacks.push(fulfilledCallBack)
                    this.onRejectedCallBacks.push(rejectedCallBack)
                    break
            }
        })

        return promise
    }

    catch(onRejected: Rejected): MyPromise {
        return this.then(undefined, onRejected)
    }

    static resolve(value: unknown) {
        if (value instanceof MyPromise) {
            return value
        }
        return new MyPromise((resolve: Fulfilled) => {
            resolve(value)
        })
    }

    static reject(reason: unknown) {
        return new MyPromise((resolve: Fulfilled, reject: Rejected) => {
            reject(reason)
        })
    }

    static all(values: any) {
        if (!isIterator(values)) {
            throw new TypeError('values must be an iterable object.')
        }
        return new MyPromise((resolve: Fulfilled, reject: Rejected) => {
            debugger
            //返回结果，all,values
            const results: any = [];
            //fulfilled 计数器
            let count = 0;
            //遍历顺序
            let index = 0;
            for (const value of values) {
                //避免闭包问题
                let resultIndex = index;
                const p = MyPromise.resolve(value).then(value => {
                    debugger
                    //!在此保证最终返回的promise,在fulfilled时，所有的兑现值均按参数传递时的顺序
                    results[resultIndex] = value;
                    //fulfilled中统计次数，一旦count和传入的promises长度相等，就说明所有的promise均fulfilled了。
                    count++
                    if (count === index) {
                        resolve(results)
                    }
                }, (reason) => {
                    reject(reason)
                });
            }
            if (index === 0) {
                //表示没有遍历，遍历对象为空
                resolve(results)
            }
        })
    }
}

// 测试
// const p = new MyPromise((resolve: any, reject: any) => {
//     resolve(1)
// })
// p.then((res) => {
//     return new MyPromise((r: any) => {
//         r(2)
//     })
// }).then((res: any) => {
//     console.log(res)
// })

// const p2 = new MyPromise((resolve: any, reject: any) => {
//     reject(2)
// })
// p2.catch((err) => {
//     console.log(err, 'err')
// })

// MyPromise.resolve(3).then((res) => {
//     console.log(res, 'res')
// })

// MyPromise.reject(4).catch((err) => {
//     console.log(err, 'err')
// })
const a = MyPromise.resolve(3)

const b = MyPromise.resolve(4)

const c = MyPromise.resolve(5)

const pArr = [a, b, c]

MyPromise.all(pArr).then((res) => {
    console.log(res, 'res')
})




// 实现promise首先需要传进来一个函数 这个函数接收两个参数一个relove 和 reject，然后需要准备五个变量，分别是promise的状态
// relove的值和reject的值，和记录成功失败的回调函数的数组，然后将relove 和 reject当做参数传递给传进来的函数，
// 在relove函数中将状态设置为成功将value设置成relove函数传进来的值，
// 在reject函数中将状态设置为失败将reason设置成reject函数传进来的值，
// 然后执行onFulfilledCallBacks和onRejectedCallBacks里的回调函数并把value和reason传递到函数中

// 实现then方法首先返回一个promise，判断状态如果成功执行成功的函数，失败执行失败函数，如果是pending，将回调函数添加到
// onFulfilledCallBacks和onRejectedCallBacks数组中

// 在成功的函数中使用queueMicrotask将onFulfilled执行，并将value传递给onFulfilled，然后使用relove方法将结果传递出去，失败函数同理
// 最后将这个promise返回

