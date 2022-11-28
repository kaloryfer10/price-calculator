const equals = (arrayA: any[], arrayB: any[]): boolean =>
  arrayA.length === arrayB.length && arrayA.every((v, i) => v === arrayB[i]);

const arrayService = {
  equals,
};

export default arrayService;
