import {settings, select, classNames, templates} from '../settings.js';
import AmountWidget from './AmountWidget.js';
import DatePicker from './DatePicker.js';
import HourPicker from './HourPicker.js';
import utils from '../utils.js';

class Booking {
  constructor(element){
    const thisBooking = this;

    thisBooking.render(element);
    thisBooking.initWidgets();
    thisBooking.getData();
  }

  getData(){
    const thisBooking =this;

    const startDateParam = settings.db.dateStartParamKey + '=' + utils.dateToStr(thisBooking.datePicker.minDate);
    const endDateParam = settings.db.dateEndParamKey + '=' + utils.dateToStr(thisBooking.datePicker.maxdate);

    const params = {
      
      booking: [
        startDateParam,
        endDateParam,
      ],
      
      evenetsCurrent:[
        settings.db.notRepeatParam,
        startDateParam,
        endDateParam,
      ],
      
      eventsRepeat:[
        settings.db.repeatParam,
        endDateParam,
      ],
    };

    const urls = {
      booking:        settings.db.url + '/' + settings.db.booking + '?' + params.booking.join('&') ,
      
      evenetsCurrent: settings.db.url + '/' + settings.db.event   + '?' + params.evenetsCurrent.join('&'),
      
      eventsRepeat:   settings.db.url + '/' + settings.db.event   + '?' + params.eventsRepeat.join('&'),
    
    };

    //console.log('getData urls', urls);
    Promise.all([
    fetch(urls.booking),
    fetch(urls.evenetsCurrent),
    fetch(urls.eventsRepeat),
    ])
      .then(function(allResponses){
        const bookingsResponse = allResponses[0];
        const evenetsCurrentResponse = allResponses[1];
        const eventsRepeatResponse = allResponses[2];

        return Promise.all([
          bookingsResponse.json(),
          evenetsCurrentResponse.json(),
          eventsRepeatResponse.json(),

        ]);
      })
     
      .then(function([bookings, evenetsCurrent, eventsRepeat]){
        //console.log(bookings);
        //console.log(evenetsCurrent);
        //console.log(eventsRepeat);

      });
  }

  parseData(bookings, eventsCurrent, eventsRepeat){
    const thisBooking = this;

    thisBooking.booked = {};

    for(let item of eventsCurrent){
      thisBooking.makeBooked(item.date, item.hour, item.duration, item.table);
    }
  }

  makeBooked(date, hour, duration, table){
    const thisBooking = this;

    if(typeof thisBooking.booked.booked[date] == 'undefined'){
      thisBooking.booked[date] = {};
    }

    const startHour = utils.hourToNumber(hour);

    if(typeof thisBooking.booked[date][startHour] == 'undefined'){
      thisBooking.booked[date] = {};
    }

    thisBooking.booked[date][hour].push(table);

  }

  render(element){
    const thisBooking = this;
    
    /* generate HTML */
    const generatedHTML = templates.bookingWidget;
    
    /* create empty thisBooking.dom */
    thisBooking.dom = {};
    thisBooking.dom.peopleAmount = document.querySelector(select.booking.peopleAmount);
    thisBooking.dom.hoursAmount = document.querySelector(select.booking.hoursAmount);
    
    /* add wrapper and reference to thisBooking.dom  which is available in the argument in the method*/
    thisBooking.dom.wrapper = element;

    /* change the wrapper of innerHTML to generatedHTML */
    thisBooking.dom.wrapper.innerHTML = generatedHTML;

    thisBooking.dom.datePicker = thisBooking.dom.wrapper.querySelector(select.widgets.datePicker.wrapper);
    thisBooking.dom.hourPicker = thisBooking.dom.wrapper.querySelector(select.widgets.hourPicker.wrapper);

  }

  initWidgets(){
    const thisBooking = this;

    thisBooking.peopleAmountWidget = new AmountWidget(thisBooking.dom.peopleAmount);
    thisBooking.hoursAmountWidget = new AmountWidget(thisBooking.dom.hoursAmount);
    
    thisBooking.dom.peopleAmount.addEventListener('updated', function(event){
      event.preventDefault();
    });
    thisBooking.dom.hoursAmount.addEventListener('updated', function(event){
      event.preventDefault();
    });

    thisBooking.datePickerWidget = new datePicker(thisBooking.dom.datePicker);
    thisBooking.hourPickerWidget = new hourPicker(thisBooking.dom.hourPicker);

    thisBooking.dom.datePicker.addEventListener('updated', function(event){
      event.preventDefault();
    });

    thisBooking.dom.hourPicker.addEventListener('updated', function(event){
      event.preventDefault();
    });

  }
}

export default Booking;