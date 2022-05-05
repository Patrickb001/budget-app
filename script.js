'use strict';
/////////////////////////////////////////////////
// BUDGET APP

/////////////////////////////////////////////////
// Data

const account1 = {
  owner: 'Patrick Borgella',
  movements: [],
  savings: [],
  movementsDates: [],
  pin: 1111,

  currency: 'USD',
  locale: 'en-US',
};

const account2 = {
  owner: 'Makayla Malveaux',
  movements: [],
  savings: [],
  pin: 1111,

  movementsDates: [],
  currency: 'USD',
  locale: 'en-US',
};

const accounts = [account1, account2];

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

const createUsername = function (accs) {
  accs.forEach(function (acc) {
    acc.username = acc.owner
      .toLowerCase()
      .split(' ')
      .map(name => name[0])
      .join('');
  });
};

createUsername(accounts);

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

const startLogOutTimer = function () {
  const tick = function () {
    const min = String(Math.trunc(time / 60)).padStart(2, 0);
    const sec = String(time % 60).padStart(2, 0);

    // In each call, print the remainting time to the UI
    labelTimer.textContent = `${min}:${sec}`;

    // When 0 seconds, stop timer and log out user
    if (time === 0) {
      clearInterval(timer);
      labelWelcome.textContent = `Log on to get started`;
      containerApp.style.opacity = 0;
    }

    // Decrease 1s
    time--;
  };

  //Set time to 5 minutes
  let time = 300;

  // Call the timer every second
  tick();
  const timer = setInterval(tick, 1000);

  return timer;
};

///////////////////////////////////////
// Event handlers
let currentAccount, timer;

btnLogin.addEventListener('click', function (e) {
  e.preventDefault();

  currentAccount = accounts.find(
    acc => acc.username === inputLoginUsername.value
  );

  if (currentAccount?.pin === +inputLoginPin.value) {
    //Display UI and message
    labelWelcome.textContent = `Welcome back, ${
      currentAccount.owner.split(' ')[0]
    }`;
    containerApp.style.opacity = 100;

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
      currentAccount.locale,
      options
    ).format(now);

    // Clear input fields
    inputLoginUsername.value = inputLoginPin.value = '';
    inputLoginPin.blur();

    // timer
    if (timer) clearInterval(timer);
    timer = startLogOutTimer();

    // Update UI
    load(currentAccount);
    updateUI(currentAccount);
  }
});

btnWithdrawal.addEventListener('click', function (e) {
  e.preventDefault();
  const amount = +inputTransferAmount.value;

  inputTransferAmount.value = '';

  if (amount > 0 && currentAccount.balance >= amount) {
    // Doing the transfer
    currentAccount.movements.push(-amount);
    let depositJson = JSON.stringify(currentAccount.movements);
    localStorage.setItem('deposit', depositJson);

    //Add transfer date
    currentAccount.movementsDates.push(new Date().toISOString());

    // Update UI
    updateUI(currentAccount);

    // Reset timer
    clearInterval(timer);
    timer = startLogOutTimer();
  }
  let datesJson = JSON.stringify(currentAccount.movementsDates);
  localStorage.setItem('date', datesJson);
  console.log(currentAccount.movementsDates);
});

btnDeposit.addEventListener('click', function (e) {
  e.preventDefault();

  const amount = Math.floor(inputLoanAmount.value);

  const deposit = function () {
    // Add movement
    if (amount !== 0 && amount > 0) {
      currentAccount.movements.push(amount);
      let depositJson = JSON.stringify(currentAccount.movements);
      localStorage.setItem('deposit', depositJson);

      // Add deposit date
      currentAccount.movementsDates.push(new Date().toISOString());

      // Update UI
      updateUI(currentAccount);

      // Reset timer
      clearInterval(timer);
      timer = startLogOutTimer();
    }
    let datesJson = JSON.stringify(currentAccount.movementsDates);
    localStorage.setItem('date', datesJson);
    console.log(datesJson);
  };

  deposit();
  inputLoanAmount.value = '';
});

btnSavings.addEventListener('click', function (e) {
  e.preventDefault();
  const amount = Math.floor(inputSavingsAmount.value);
  const savings = currentAccount.savings.reduce((acc, mov) => acc + mov, 0);

  const isNegativeSavings = savings + amount;

  const deposit = function () {
    if (amount !== 0) {
      if (isNegativeSavings < 0) return;
      currentAccount.savings.push(amount);
      let savingsJson = JSON.stringify(currentAccount.savings);
      localStorage.setItem('savings', savingsJson);

      // Add deposit date
      currentAccount.movementsDates.push(new Date().toISOString());
      let datesJson = JSON.stringify(currentAccount.movementsDates);
      localStorage.setItem('date', datesJson);

      // Update UI
      updateUI(currentAccount);

      // Reset timer
      clearInterval(timer);
      timer = startLogOutTimer();
    }
  };

  deposit();
  inputSavingsAmount.value = '';
});

btnLogout.addEventListener('click', function (e) {
  e.preventDefault();

  //Hide UI
  containerApp.style.opacity = 0;

  //Change welcome message
  labelWelcome.textContent = 'Log in to get started';
});

let sorted = false;

btnSort.addEventListener('click', function (e) {
  e.preventDefault();
  displayMovements(currentAccount, !sorted);
  sorted = !sorted;
});
