function pid() {
  if (typeof process !== "undefined") {
    return process.pid;
  }
  return null;
}

const uuid = () => {
  let uuid = "";
  for (let i = 0; i < 32; i += 1) {
    if (i === 8 || i === 12 || i === 16 || i === 20) {
      uuid += "-";
    }
    let n;
    if (i === 12) {
      n = 4;
    } else {
      const random = (Math.random() * 16) | 0;
      if (i === 16) {
        n = (random & 3) | 0;
      } else {
        n = random;
      }
    }
    uuid += n.toString(16);
  }
  return uuid;
};

export { pid, uuid };
