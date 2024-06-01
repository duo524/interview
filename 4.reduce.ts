function reduce<T, U>(
    array: T[],
    callback: (accumulator: U, currentValue: T, index: number, array: T[]) => U,
    initialValue: U
): U {
    let accumulator = initialValue;
    for (let i = 0; i < array.length; i++) {
        accumulator = callback(accumulator, array[i], i, array)
    }
    return accumulator
}

const array = [1, 2, 3, 4]
const sum = reduce(array, (acc, curr) => acc + curr, 0)
console.log(sum)