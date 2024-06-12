
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