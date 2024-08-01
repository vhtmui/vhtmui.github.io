function generatePrimes(quota) {
    function isPrime(n) {
      for (let c = 2; c <= Math.sqrt(n); ++c) {
        if (n % c === 0) {
          return false;
        }
      }
      return true;
    }
    const primes = [];
    const maximum = 1000000;
    while (primes.length < quota) {
      const candidate = Math.floor(Math.random() * (maximum + 1));
      if (isPrime(candidate)) {
        primes.push(candidate);
      }
    }
    return primes;
  }
  document.querySelector("#generate").addEventListener("click", () => {
    const quota = document.querySelector("#quota").value;
    const primes = generatePrimes(quota);
    document.querySelector("#output").textContent =
      `完成！已生成素数${quota}个。`;
  });
  document.querySelector("#reload").addEventListener("click", () => {
    document.location.reload();
  });
  