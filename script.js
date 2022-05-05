'use strict';
/////////////////////////////////////////////////
// BUDGET APP

/////////////////////////////////////////////////
// Data

const account = {
  owner: 'Patrick Borgella',
  movements: [],
  savings: [],
  movementsDates: [],
  pin: 1111,

  currency: 'USD',
  locale: 'en-US',
};

/////////////////////////////////////////////////
// Elements
const labelWelcome = document.querySelector('.welcome');
const labelDate = document.querySelector('.date');
const labelBalance = document.querySelector('.balance__value');
const labelSavings = document.querySelector('.balance__value--savings');
const labelSumIn = document.querySelector('.summary__value--in');
const labelSumOut = document.querySelector('.summary__value--out');
const labelSumSavings = document.querySelector('.summary__value--savings');
const labelTimer = document.querySelector('.timer');

const containerApp = document.querySelector('.app');
const containerMovements = document.querySelector('.movements');

const btnOpenAccount = document.querySelector('.open-acc-btn');
const btnLogin = document.querySelector('.login__btn');
const btnWithdrawal = document.querySelector('.form__btn--withdrawal');
const btnDeposit = document.querySelector('.form__btn--loan');
const btnSavings = document.querySelector('.form__btn--savings');
const btnLogout = document.querySelector('.logout-btn');
const btnSort = document.querySelector('.btn--sort');

const inputLoginUsername = document.querySelector('.login__input--user');
const inputLoginPin = document.querySelector('.login__input--pin');
const inputTransferTo = document.querySelector('.form__input--to');
const inputTransferAmount = document.querySelector('.form__input--amount');
const inputLoanAmount = document.querySelector('.form__input--loan-amount');
const inputCloseUsername = document.querySelector('.form__input--user');
const inputClosePin = document.querySelector('.form__input--pin');
const inputSavingsAmount = document.querySelector('.form__input--savings');

///////////////////////////////////////

/////////////////////////////////////////////////
// Functions

const load = function (acc) {
  let deposits;
  let dates;
  let savings;
  if (localStorage.getItem('deposit') !== null) {
    deposits = JSON.parse(localStorage.getItem('deposit'));
    console.log(deposits);
    acc.movements = deposits;
  } else return;
  if (localStorage.getItem('date') !== null) {
    dates = JSON.parse(localStorage.getItem('date'));
    acc.movementsDates = dates;
  } else return;
  if (localStorage.getItem('savings') !== null) {
    savings = JSON.parse(localStorage.getItem('savings'));
    acc.savings = savings;
  } else return;
};

const formatMovementDate = function (date, locale) {
  const calcDaysPassed = (date1, date2) =>
    Math.round(Math.abs(date2 - date1) / (1000 * 60 * 60 * 24));

  const daysPassed = calcDaysPassed(new Date(), date);

  if (daysPassed === 0) return `Today`;
  if (daysPassed === 1) return `Yesterday`;
  if (daysPassed <= 7) return `${daysPassed} days ago`;
  else {
    return new Intl.DateTimeFormat(locale).format(date);
  }
};

const formatCur = function (value, locale, currency) {
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency: currency,
  }).format(value);
};

const displayMovements = function (acc, sort = false) {
  let i = 0;
  containerMovements.innerHTML = '';

  const movs = sort
    ? acc.movements.slice().sort((a, b) => a - b)
    : acc.movements;

  movs.forEach(function (mov, i) {
    const type = mov > 0 ? 'deposit' : 'withdrawal';

    const date = new Date(acc.movementsDates[i]);
    const displayDate = formatMovementDate(date, acc.locale);

    const formattedMov = formatCur(mov, acc.locale, acc.currency);

    const html = `
    <div class="movements__row">
      <div class="movements__type movements__type--${type}">${
      i + 1
    } ${type}</div>
      <div class="movements__date">${displayDate}</div>
      <div class="movements__value">${formattedMov}</div>
    </div>
    `;

    containerMovements.insertAdjacentHTML('afterbegin', html);
  });

  const savings = acc.savings.slice();

  savings.forEach(function (mov, i) {
    const date = new Date(acc.movementsDates[i]);
    const displayDate = formatMovementDate(date, acc.locale);

    const formattedMov = formatCur(mov, acc.locale, acc.currency);

    const savingsHtml = `
    <div class="movements__row">
    <div class="movements__type movements__type--savings">${i + 1} savings</div>
    <div class="movements__date">${displayDate}</div>
    <div class="movements__value">${formattedMov}</div>
    </div>
    `;

    containerMovements.insertAdjacentHTML('afterbegin', savingsHtml);
  });
};

const calcDisplayBalanceWithSavings = function (acc) {
  acc.balance = acc.savings.reduce((acc, mov) => acc + mov, 0);
  labelSavings.innerHTML = `<span>Savings:</span> ${formatCur(
    acc.balance,
    acc.locale,
    acc.currency
  )}`;
};

const calcDisplayBalance = function (acc) {
  acc.balance = acc.movements.reduce((acc, mov) => acc + mov, 0);
  labelBalance.innerHTML = `<span>Checkings:</span> ${formatCur(
    acc.balance,
    acc.locale,
    acc.currency
  )}`;
};

const calcDisplaySummary = function (acc) {
  const incomes = acc.movements
    .filter(mov => mov > 0)
    .reduce((acc, mov) => acc + mov, 0);
  labelSumIn.textContent = formatCur(incomes, acc.locale, acc.currency);

  const out = acc.movements
    .filter(mov => mov < 0)
    .reduce((acc, mov) => acc + mov, 0);
  labelSumOut.textContent = formatCur(Math.abs(out), acc.locale, acc.currency);

  const savings = acc.savings
    // .filter(mov => mov > 0)
    .reduce((acc, mov) => acc + mov, 0);
  labelSumSavings.textContent = formatCur(savings, acc.locale, acc.currency);
};

const createUsername = function (acc) {
  acc.username = acc.owner
    .toLowerCase()
    .split(' ')
    .map(name => name[0])
    .join('');
};

createUsername(account);

const updateUI = function (acc) {
  //Display savings
  calcDisplayBalanceWithSavings(acc);

  //Display movements
  displayMovements(acc);

  //Display balance
  calcDisplayBalance(acc);

  // Display summary
  calcDisplaySummary(acc);
};

///////////////////////////////////////
// Event handlers
let currentAccount, timer;

function init() {
  // Create current date and time
  const now = new Date();
  const options = {
    hour: 'numeric',
    minute: 'numeric',
    day: 'numeric',
    month: 'numeric',
    year: 'numeric',
  };

  labelDate.textContent = new Intl.DateTimeFormat(
    account.locale,
    options
  ).format(now);

  // Update UI
  load(account);
  updateUI(account);
}
init();
btnWithdrawal.addEventListener('click', function (e) {
  e.preventDefault();
  const amount = +inputTransferAmount.value;

  inputTransferAmount.value = '';

  if (amount > 0 && account.balance >= amount) {
    // Doing the transfer
    account.movements.push(-amount);
    let depositJson = JSON.stringify(account.movements);
    localStorage.setItem('deposit', depositJson);

    //Add transfer date
    account.movementsDates.push(new Date().toISOString());

    // Update UI
    updateUI(account);
  }
  let datesJson = JSON.stringify(account.movementsDates);
  localStorage.setItem('date', datesJson);
  console.log(account.movementsDates);
});

btnDeposit.addEventListener('click', function (e) {
  e.preventDefault();

  const amount = Math.floor(inputLoanAmount.value);

  const deposit = function () {
    // Add movement
    if (amount !== 0 && amount > 0) {
      account.movements.push(amount);
      let depositJson = JSON.stringify(account.movements);
      localStorage.setItem('deposit', depositJson);

      // Add deposit date
      account.movementsDates.push(new Date().toISOString());

      // Update UI
      updateUI(account);
    }
    let datesJson = JSON.stringify(account.movementsDates);
    localStorage.setItem('date', datesJson);
    console.log(datesJson);
  };

  deposit();
  inputLoanAmount.value = '';
});

btnSavings.addEventListener('click', function (e) {
  e.preventDefault();
  const amount = Math.floor(inputSavingsAmount.value);
  const savings = account.savings.reduce((acc, mov) => acc + mov, 0);

  const isNegativeSavings = savings + amount;

  const deposit = function () {
    if (amount !== 0) {
      if (isNegativeSavings < 0) return;
      account.savings.push(amount);
      let savingsJson = JSON.stringify(account.savings);
      localStorage.setItem('savings', savingsJson);

      // Add deposit date
      account.movementsDates.push(new Date().toISOString());
      let datesJson = JSON.stringify(account.movementsDates);
      localStorage.setItem('date', datesJson);

      // Update UI
      updateUI(account);
    }
  };

  deposit();
  inputSavingsAmount.value = '';
});

let sorted = false;

btnSort.addEventListener('click', function (e) {
  e.preventDefault();
  displayMovements(currentAccount, !sorted);
  sorted = !sorted;
});
