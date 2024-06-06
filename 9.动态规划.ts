function uniquePaths(m: number, n: number): number {
  //只能向下只能向右  m x n
  const dp = new Array(m);
  for (let i = 0; i < dp.length; i++) {
    dp[i] = new Array(n).fill(1);
  }
  //状态定义：dp[i][j] 代表到达矩阵[i,j]位置总共具有多少条路径
  //第0行和第0列都赋值为1，(我是偷懒先全部赋值了)，然后从[1,1]开始遍历二维dp数组直至[m-1,n-1]
  for (let i = 1; i < m; i++) {
    for (let j = 1; j < n; j++) {
      dp[i][j] = dp[i - 1][j] + dp[i][j - 1]; //状态转移方程
    }
  }
  return dp[m - 1][n - 1];
}
