type EventCallback = (...args: any[]) => void;

class EventEmitter {
  private events: { [key: string]: EventCallback[] };

  constructor() {
    this.events = {};
  }

  on(type: string, cb: EventCallback) {
    if (!this.events[type]) {
      this.events[type] = [cb];
    } else {
      this.events[type].push(cb);
    }
  }

  once(type: string, cb: EventCallback) {
    const fn: EventCallback = (...args: any[]) => {
      cb(...args);
      this.off(type, fn);
    };
    this.on(type, fn);
  }

  emit(type: string, ...args: any[]) {
    if (!this.events[type]) {
      return;
    } else {
      this.events[type].forEach((cb) => {
        cb(...args);
      });
    }
  }

  off(type: string, cb: EventCallback) {
    if (!this.events[type]) {
      return;
    } else {
      this.events[type] = this.events[type].filter((item) => item !== cb);
    }
  }
}

// 优点：

// 解耦性 ：发布订阅模式可以有效地解耦发布者和订阅者之间的关系。发布者和订阅者之间不需要直接引用彼此，它们通过事件进行通信，从而降低了对象之间的依赖性。
// 灵活性 ：发布订阅模式提供了一种灵活的机制，使得可以轻松地添加新的发布者和订阅者，或者移除现有的发布者和订阅者，而不会影响到其他部分的代码。
// 异步通信 ：发布-订阅模式支持异步通信，发布者和订阅者可以在不同的时间、不同的线程或者不同的进程中进行通信。

// 缺点：

// 增加消耗 ：创建结构和缓存订阅者这两个过程需要消耗计算和内存资源，即使订阅后始终没有触发，订阅者也会始终存在于内存。
// 增加复杂度 ：订阅者被缓存在一起，如果多个订阅者和发布者层层嵌套，那么程序将变得难以追踪和调试。
