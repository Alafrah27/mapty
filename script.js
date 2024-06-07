'use strict';

// prettier-ignore
const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

const form = document.querySelector('.form');
const containerWorkouts = document.querySelector('.workouts');
const inputType = document.querySelector('.form__input--type');
const inputDistance = document.querySelector('.form__input--distance');
const inputDuration = document.querySelector('.form__input--duration');
const inputCadence = document.querySelector('.form__input--cadence');
const inputElevation = document.querySelector('.form__input--elevation');
// let map, mapEvent;

class WorkOut {
  date = new Date();
  id = (Date.now() + '').slice(-10);
  constructor(coords, distance, duration) {
    this.coords = coords;
    this.distance = distance;
    this.duration = duration;
  }
  _setDescription() {
    // prettier-ignore
    const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

    this.description = `${this.type[0].toUpperCase()}${this.type.slice(1)} on ${
      months[this.date.getMonth()]
    } ${this.date.getDate()}`;
  }
}

class Runing extends WorkOut {
  type = 'running';
  constructor(coords, distance, duration, cadence) {
    super(coords, distance, duration);
    this.cadence = cadence;
    this.calPace();
    this._setDescription();
  }
  calPace() {
    this.pace = this.duration / this.distance;
    return this.pace;
  }
}

class Cycling extends WorkOut {
  type = 'cycling';
  constructor(coords, distance, duration, elavationGain) {
    super(coords, distance, duration);
    this.elavationGain = elavationGain;
    this.calcSpeed();
    this._setDescription();
  }
  calcSpeed() {
    // this.speed = this.distance / (this.duration / 60);
    this.speed = this.distance / (this.duration / 60);
    return this.speed;
  }
}

// const run1 = new Runing([34, -11], 5.3, 100);
// const cycling1 = new Cycling([34, -11], 2.3, 1090);

// console.log(run1, cycling1);
///////////////////////////////////////////////////////////
//APPLICATION ARTITACTURE

class App {
  #mapEvent;
  #map;
  #workouts = [];
  #mapZoomLevel = 13;
  click = 0;

  constructor() {
    this._getPosition;
    this._getLocalStorge();
  }

  _getPosition() {
    if (navigator.geolocation)
      navigator.geolocation.getCurrentPosition(
        this._loadMap.bind(this),
        function () {
          alert('could not get your location');
        }
      );

    form.addEventListener('submit', this._newWorkout.bind(this));

    inputType.addEventListener('change', this._toggleElevationField);
    containerWorkouts.addEventListener('click', this._moveToPopup.bind(this));
  }

  _loadMap(position) {
    console.log(position);
    const { latitude } = position.coords;
    const { longitude } = position.coords;
    console.log(latitude, longitude);
    const coords = [latitude, longitude];
    this.#map = L.map('map').setView(coords, this.#mapZoomLevel);

    L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution:
        '&copy; <a href="https://www.openstreetmap.fr/hot/copyright">OpenStreetMap</a> contributors',
    }).addTo(this.#map);

    this.#map.on(
      'click',
      this._showForm.bind(this)
      // const { lat, lng } = mapEvent.latlng;
      // L.marker([lat, lng]).addTo(map).bindPopup(L.popup({
      //     maxWidth: 250,
      //     minWidth: 100,
      //     autoClose: false,
      //     closeOnClick: false,
      //     className: 'running-popup'
      // }))
      //  .setPopupContent('workup')
      // .openPopup();
    );

    this.#workouts.forEach(work => {
      this._RenderWorkoutMaker(work)
   })
  }

  _showForm(mapE) {
    this.#mapEvent = mapE;
    console.log(this.#mapEvent);
    form.classList.remove('hidden');
    inputDistance.focus();
  }
  _hideForm() {
    inputDistance.value = '';
    inputDuration.value = '';
    inputCadence.value = '';
    inputElevation.value = '';
    form.style.display = 'none';
    form.classList.add('hidden');
    setTimeout(() => (form.style.display = 'grid'), 1000);
  }

  _toggleElevationField() {
    inputElevation.closest('.form__row').classList.toggle('form__row--hidden');
    inputCadence.closest('.form__row').classList.toggle('form__row--hidden');
  }

  _newWorkout(e) {
    const inputValid = (...input) =>
      input.every(inputs => Number.isFinite(inputs));
    const allPositive = (...inputs) => inputs.every(inp => inp > 0);
    e.preventDefault();
    const { lat, lng } = this.#mapEvent.latlng;
    const type = inputType.value;
    const distance = +inputDistance.value;
    const duration = +inputDuration.value;
    let workout;

    if (type === 'running') {
      const cadence = +inputCadence.value;
      if (
        // !Number.isFinite(distance) ||
        // !Number.isFinite(duration) ||
        // !Number.isFinite(cadence)

        !inputValid(distance, duration, cadence) ||
        !allPositive(distance, duration, cadence)
      )
        return alert('the input must be positive number');
      workout = new Runing([lat, lng], distance, duration, cadence);
    }

    if (type === 'cycling') {
      const elevation = +inputElevation.value;
      if (
        // !Number.isFinite(distance) ||
        // !Number.isFinite(duration) ||
        // !Number.isFinite(cadence)

        !inputValid(distance, duration, elevation) ||
        !allPositive(distance, duration)
      )
        return alert('the input must be positive number');
      workout = new Cycling([lat, lng], distance, duration, elevation);
    }
    console.log(workout);
    this.#workouts.push(workout);

    this._RenderWorkoutMaker(workout);
    this._renderWorkout(workout);
    this._hideForm();
    this._setLocalStorge();
  }

  _RenderWorkoutMaker(workout) {
    L.marker(workout.coords)
      .addTo(this.#map)
      .bindPopup(
        L.popup({
          maxWidth: 250,
          minWidth: 100,
          autoClose: false,
          closeOnClick: false,
          className: `${workout.type}-popup`,
        })
      )
      .setPopupContent(
        `${workout.type === 'running' ? '🏃‍♂️' : '🚴‍♀️'} ${workout.description}`
      )
      .openPopup();
  }
  Click() {
    click++;
  }
  _renderWorkout(workout) {
    let html = `
      <li class="workout workout--${workout.type}" data-id="${workout.id}">
        <h2 class="workout__title">${workout.description}</h2>
        <div class="workout__details">
          <span class="workout__icon">${
            workout.type === 'running' ? '🏃‍♂️' : '🚴‍♀️'
          }</span>
          <span class="workout__value">${workout.distance}</span>
          <span class="workout__unit">km</span>
        </div>
        <div class="workout__details">
          <span class="workout__icon">⏱</span>
          <span class="workout__value">${workout.duration}</span>
          <span class="workout__unit">min</span>
        </div>
    `;

    if (workout.type === 'running')
      html += `
        <div class="workout__details">
          <span class="workout__icon">⚡️</span>
          <span class="workout__value">${workout.pace.toFixed(1)}</span>
          <span class="workout__unit">min/km</span>
        </div>
        <div class="workout__details">
          <span class="workout__icon">🦶🏼</span>
          <span class="workout__value">${workout.cadence}</span>
          <span class="workout__unit">spm</span>
        </div>
      </li>
      `;

    if (workout.type === 'cycling')
      html += `
        <div class="workout__details">
          <span class="workout__icon">⚡️</span>
          <span class="workout__value">${workout.speed.toFixed(1)}</span>
          <span class="workout__unit">km/h</span>
        </div>
        <div class="workout__details">
          <span class="workout__icon">⛰</span>
          <span class="workout__value">${workout.elevationGain}</span>
          <span class="workout__unit">m</span>
        </div>
      </li>
      `;

    form.insertAdjacentHTML('afterend', html);
  }

  _moveToPopup(e) {
    const workoutEl = e.target.closest('.workout');
    if (!workoutEl) return;
    const workout = this.#workouts.find(
      work => work.id === workoutEl.dataset.id
    );
    this.#map.setView(workout.coords, this.#mapZoomLevel, {
      animate: true,
      pan: {
        duration: 1,
      },
    });
    // workout.Click(this);
  }

  _setLocalStorge() {
    localStorage.setItem('workouts', JSON.stringify(this.#workouts));
  }
  _getLocalStorge() {
    const data = JSON.parse(localStorage.getItem('workouts'));

    if (!data) return;

    this.#workouts = data;
    this.#workouts.forEach(work => {
       this._renderWorkout(work)
    })
  }
  _rest(){
     localStorage.removeItem('workouts')
     location.reload()
  }
}

const app = new App();
app._getPosition();

// if (navigator.geolocation)
//   navigator.geolocation.getCurrentPosition(
//     function (position) {
//       console.log(position);
//       const { latitude } = position.coords;
//       const { longitude } = position.coords;
//       console.log(latitude, longitude);
//       const coords = [latitude, longitude];
//       map = L.map('map').setView(coords, 13);

//       L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
//         attribution:
//           '&copy; <a href="https://www.openstreetmap.fr/hot/copyright">OpenStreetMap</a> contributors',
//       }).addTo(map);

//       map.on('click', function (mapE) {
//         mapEvent = mapE;
//         console.log(mapEvent);
//         form.classList.remove('hidden');
//         inputDistance.focus();
//         // const { lat, lng } = mapEvent.latlng;
//         // L.marker([lat, lng]).addTo(map).bindPopup(L.popup({
//         //     maxWidth: 250,
//         //     minWidth: 100,
//         //     autoClose: false,
//         //     closeOnClick: false,
//         //     className: 'running-popup'
//         // }))
//         //  .setPopupContent('workup')
//         // .openPopup();
//       });
//     },
//     function () {
//       alert('could not get your location');
//     }
//   );

//submit form

// select option
