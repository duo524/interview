// 最接近的三数之和

const fn = function (nums: any[], target: any) {
    const length = nums.length
    nums.sort((a, b) => a - b)
    let res = Number.MAX_SAFE_INTEGER
    for (let i = 0; i < length; i++) {
        let left = i + 1
        let right = length - 1
        while (left < right) {
            let sum = nums[i] + nums[left] + nums[right]
            if (Math.abs(sum - target) < Math.abs(res - target)) {
                res = sum
            }

            if (sum < target) {
                left++
            } else if (sum > target) {
                right--
            } else {
                return sum
            }
        }
    }
    return res
}

const arr = [-1, 2, 1, 4]
console.log(fn(arr, 1))




