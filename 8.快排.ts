function quickSort(arr: number[]): number[] {
  if (arr.length <= 1) {
    return arr;
  }

  const pivotIndex = Math.floor(arr.length / 2);
  const pivot = arr.splice(pivotIndex, 1)[0];
  const left: number[] = [];
  const right: number[] = [];

  for (const num of arr) {
    if (num < pivot) {
      left.push(num);
    } else {
      right.push(num);
    }
  }

  return [...quickSort(left), pivot, ...quickSort(right)];
}

console.log(quickSort([1, 2, 3, 5, 66, 6, 6, 6, 6, 429, 53, 5, 2, 7, 9]));
