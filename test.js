function levelThree() {
  const data = null;
  return data.length; // Crashes here
}

function levelTwo() {
  levelThree();
}

function levelOne() {
  levelTwo();
}

levelOne();
