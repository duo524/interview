// 去除字符串中出现次数最少的字符，不改变原字符串的顺序

// function removeLeastFrequentChars(str: string) {
//   // 创建一个对象用于统计字符出现次数
//   let charCount: Record<string, any> = {};

//   // 遍历字符串，统计每个字符出现的次数
//   for (let char of str) {
//     charCount[char] = (charCount[char] || 0) + 1;
//   }

//   // 找到出现次数最少的字符的出现次数
//   let minCount = Math.min(...Object.values(charCount));

//   // 从字符串中移除出现次数最少的字符
//   let result = "";
//   for (let char of str) {
//     if (charCount[char] !== minCount) {
//       result += char;
//     }
//   }

//   return result;
// }

// // 测试例子
// let example1 = "ababac";
// let example2 = "aaabbbcceeff";

// console.log(removeLeastFrequentChars(example1)); // 输出 "ababa"
// console.log(removeLeastFrequentChars(example2)); // 输出 "

function arrayToTree(arr: any[]) {
  const map: Record<string, any> = {}; // 用于快速查找节点的映射表

  // 首先将数组中的每个元素存储到映射表中
  arr.forEach((item) => {
    map[item.id] = { ...item, children: [] };
  });

  // 遍历数组，将每个节点添加到其父节点的children数组中
  const tree: any[] = [];
  arr.forEach((item) => {
    if (item.parentId !== 0) {
      const parent = map[item.parentId];
      if (parent) {
        parent.children.push(map[item.id]);
      }
    } else {
      tree.push(map[item.id]);
    }
  });

  return tree;
}

// 测试
const arr1 = [
  {
    id: 2,
    name: "部门B",
    parentId: 0,
  },
  {
    id: 3,
    name: "部门C",
    parentId: 1,
  },
  {
    id: 1,
    name: "部门A",
    parentId: 2,
  },
  {
    id: 4,
    name: "部门D",
    parentId: 1,
  },
  {
    id: 5,
    name: "部门E",
    parentId: 2,
  },
  {
    id: 6,
    name: "部门F",
    parentId: 3,
  },
  {
    id: 7,
    name: "部门G",
    parentId: 2,
  },
  {
    id: 8,
    name: "部门H",
    parentId: 4,
  },
];

const tree = arrayToTree(arr1);
console.log(tree);
