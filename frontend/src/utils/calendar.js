// Ethiopian & Gregorian Calendar Engine
export function convertToEthiopianDate(date) {
  const year = date.getFullYear();
  const month = date.getMonth() + 1;
  const day = date.getDate();

  const ethMonths = [
    "Meskerem", "Tikimt", "Hidar", "Tahsas", "Tir", "Yakatit",
    "Magabit", "Miyazya", "Ginbot", "Sene", "Hamle", "Nehasse", "Pagume"
  ];

  let ethYear = year - 8;
  const isLeapYear = (year % 4 === 0 && year % 100 !== 0) || (year % 400 === 0);
  const newYearDay = isLeapYear ? 12 : 11;

  if (month > 9 || (month === 9 && day >= newYearDay)) {
    ethYear = year - 7;
  }

  let ethMonthIndex = (month + 3) % 12;
  let ethDay = day - 10;

  if (ethDay <= 0) {
    ethDay += 30;
    ethMonthIndex = (ethMonthIndex - 1 + 12) % 12;
  }

  return `${ethDay} ${ethMonths[ethMonthIndex]} ${ethYear}`;
}

export function getCalendarStrings() {
  const now = new Date();
  const gcOptions = { day: 'numeric', month: 'short', year: 'numeric' };
  const gcString = now.toLocaleDateString('en-GB', gcOptions);
  const ecString = convertToEthiopianDate(now);
  return { gcString, ecString };
}
