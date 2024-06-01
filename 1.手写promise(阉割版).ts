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


function lengthOfLIS(nums: number[]): number {
    const tails: number[] = [];

    for (const num of nums) {
        let left = 0, right = tails.length;

        while (left < right) {
            const mid = Math.floor((left + right) / 2);
            if (tails[mid] < num) {
                left = mid + 1;
            } else {
                right = mid;
            }
        }

        if (left === tails.length) {
            tails.push(num);
        } else {
            tails[left] = num;
        }
    }

    return tails.length;
}

// 使用示例
const nums = [10, 9, 2, 5, 3, 7, 101, 18];
const lisLength = lengthOfLIS(nums);
console.log(lisLength); // 输出 4，最长递增子序列是 [2, 3, 7, 101]
