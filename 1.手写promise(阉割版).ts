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
}

// 测试
const p = new MyPromise((resolve: any, reject: any) => {
    resolve(1)
})
p.then((res) => {
    return new MyPromise((r: any) => {
        r(2)
    })
}).then((res: any) => {
    console.log(res)
})

const p2 = new MyPromise((resolve: any, reject: any) => {
    reject(2)
})
p2.catch((err) => {
    console.log(err, 'err')
})

