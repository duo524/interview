// function render(vnode: any) {
//   if (typeof vnode === "string") {
//     // 如果节点是文本节点，则直接创建文本节点并返回
//     return document.createTextNode(vnode);
//   }

//   // 创建节点
//   const node = document.createElement(vnode.tag);
//   console.log(Object.entries(vnode.attrs || {}));
//   // 设置节点属性
//   for (const [key, value] of Object.entries(vnode.attrs || {})) {
//     node.setAttribute(key, value);
//   }

//   // 递归处理子节点
//   for (const childVNode of vnode.children || []) {
//     const childNode = render(childVNode);
//     node.appendChild(childNode);
//   }

//   return node;
// }
// const vnode = {
//   tag: "DIV",
//   attrs: {
//     id: "app",
//   },
//   children: [
//     {
//       tag: "SPAN",
//       children: [
//         {
//           tag: "A",
//           children: [],
//         },
//       ],
//     },
//     {
//       tag: "SPAN",
//       children: [
//         {
//           tag: "A",
//           children: [],
//         },
//         {
//           tag: "A",
//           children: [],
//         },
//       ],
//     },
//   ],
// };

// // 测试
// const realDOM = render(vnode);
// console.log(realDOM);

// const url = "https://www.baidu.com/abc?a=1&b=2&c#hash";
// console.log(Object.fromEntries(new URL(url).searchParams.entries()));
