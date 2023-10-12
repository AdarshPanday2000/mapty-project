//'use strict';

// prettier-ignore
const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];


class Workout {
  date = new Date();
  id = (Date.now() + '').slice(-10);

  constructor(coords,distance,duration){
    this.coords = coords;
    this.distance = distance; //in km
    this.duration = duration;  // in mis
  }
}

class Running extends Workout{
  constructor(coords,distance,duration,cadence){
    super(coords, distance, duration);
    this.cadence = cadence;
    this.calcPace();
  }

  calcPace(){
    //min/km
    this.pace = this.duration/this.distance;
    return this.pace
  }
}

class Cycling extends Workout{
  constructor(coords,distance,duration,elevationGain){
    super(coords, distance, duration);
    this.elevationGain = elevationGain;
    this.calcSpeed();
  }

  calcSpeed(){
    //km/hr
    this.speed = this.distance/(this.duration/60);
    return this.speed;
  }
}


///////////////////////////////////////////////////////////////////////////
// APPLICATION ARCHITECTURE

const form = document.querySelector('.form');
const containerWorkouts = document.querySelector('.workouts');
const inputType = document.querySelector('.form__input--type');
const inputDistance = document.querySelector('.form__input--distance');
const inputDuration = document.querySelector('.form__input--duration');
const inputCadence = document.querySelector('.form__input--cadence');
const inputElevation = document.querySelector('.form__input--elevation');


class App {
  #map;            //private instances properties
  #mapEvent;      
  #workouts = [];

  constructor(){
    this._getPosition();

    
    form.addEventListener('submit', this._newWorkout.bind(this));

    inputType.addEventListener('change', this._toggleElevationField)
    
 }; 


  _getPosition(){
    if(navigator.geolocation){
      navigator.geolocation.getCurrentPosition(this._loadMap.bind(this), function(){
              alert(`Could not get your position`);
          });
      };
  }


  _loadMap(position){
      const {latitude} = position.coords;
      const {longitude} = position.coords;
      console.log(latitude,longitude);

      const coords = [latitude,longitude]

      this.#map = L.map('map').setView(coords, 13); //leaflet library code

      L.tileLayer('https://tile.openstreetmap.fr/hot/{z}/{x}/{y}.png', {
        attribution: 
        '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
      }).addTo(this.#map);

      //handling clicks on map
        this.#map.on('click', this._showForm.bind(this));   //inherited from leaflet object prototype
     };
  };

 _showForm(mapE){
    this.#mapEvent = mapE;
    form.classList.remove('hidden');
    inputDistance.focus();
  };

  _toggleElevationField() {
    inputElevation.closest('.form__row').classList.toggle('form__row--hidden')
    .closest('.form__row').classList.toggle('form__row--hidden');
  }



  _newWorkout(e){
    const validInputs = (...inputs) => inputs.every(inp => Number.isFinite(inp));

    const allPositive = (...inputs) => inputs.every(inp => inp > 0);

    e.preventDefault();

    //get data from form
    const type = inputType.value;
    const distance = +inputDistance;
    const duration = +inputDuration;
    const{ lat, lng} = this.#mapEvent.latlng;
    let workout;

    
    //if workout running, create running object
    if(type === 'running'){
      const cadence = +inputCadence.value;
      //check if data is valid
      if(
          !validInputs(distance,duration,cadence) || 
          !allPositive(distance, duration, cadence)
      ) 
      return alert('Inputs have to be positive numbers!');
      
     workout = new Running([lat, lng], distance, duration, cadence);
    }


    //if workout cycling ,create cycling object
    if(type === 'cycling'){
      const elevation = +inputElevation.value;

      if(
        !validInputs(distance, duration, elevation) ||
        !allPositive(distance, duration)
      ) 
        return alert ('Inputs have to be positive numbers!');

        workout = new Cycling([lat, lng], distance, duration, elevation);
    }


    //add new object to workout array
    this.#workouts.push(workout)


    //render workout on map as marker
    this._renderWorkoutMarker(workout);
  


    //render workout on  list 
    this._newWorkout(workout);

    //hide form + clear input fields


    //clear input fields
    inputDistance.value = inputCadence.value = inputDuration.value = inputElevation.value = '';

  _renderWorkoutMarker(workout){ 
    L.marker(workout.coords)  //used for diffrent markers on different clicks
    .addTo(this.#map)
    .bindPopup(L.popup({      //editing from leafleat documentation
      maxWidth : 250,
      minWidth: 100,
      autoClose: false,
      closeOnClick: false,
      className: `${type}-popup`, 
    }))
      .setPopupContent('workout.distance')
      .openPopup();
    }
    _newWorkout
  }     

const app = new App();
app._getPosition();

