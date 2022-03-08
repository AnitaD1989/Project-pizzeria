import {settings, select, classNames, templates} from '../settings.js';
import AmountWidget from './AmountWidget.js';
import DatePicker from './DatePicker.js';
import HourPicker from './HourPicker.js';
import utils from '../utils.js';

class Booking {
  constructor(element){
    const thisBooking = this;

    thisBooking.selectedTable = [];

    thisBooking.render(element);
    thisBooking.initWidgets();
    thisBooking.getData();
  }

  getData(){
    const thisBooking =this;

    const startDateParam = settings.db.dateStartParamKey + '=' + utils.dateToStr(thisBooking.datePickerWidget.minDate);
    const endDateParam = settings.db.dateEndParamKey + '=' + utils.dateToStr(thisBooking.datePickerWidget.maxDate);

    const params = {
      
      booking: [
        startDateParam,
        endDateParam,
      ],
      
      eventsCurrent:[
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
      
      eventsCurrent: settings.db.url + '/' + settings.db.event   + '?' + params.eventsCurrent.join('&'),
      
      eventsRepeat:   settings.db.url + '/' + settings.db.event   + '?' + params.eventsRepeat.join('&'),
    
    };

    //console.log('getData urls', urls);
    Promise.all([
    fetch(urls.booking),
    fetch(urls.eventsCurrent),
    fetch(urls.eventsRepeat),
    ])
      .then(function(allResponses){
        const bookingsResponse = allResponses[0];
        const eventsCurrentResponse = allResponses[1];
        const eventsRepeatResponse = allResponses[2];

        return Promise.all([
          bookingsResponse.json(),
          eventsCurrentResponse.json(),
          eventsRepeatResponse.json(),

        ]);
      })
     
      .then(function([bookings, eventsCurrent, eventsRepeat]){
        //console.log(bookings);
        //console.log(evenetsCurrent);
        //console.log(eventsRepeat);

      });
  }

  parseData(bookings, eventsCurrent, eventsRepeat){
    const thisBooking = this;

    thisBooking.booked = {};

    for(let item of bookings){
      thisBooking.makeBooked(item.date, item.hour, item.duration, item.table);
    }

    for(let item of eventsCurrent){
      thisBooking.makeBooked(item.date, item.hour, item.duration, item.table);

    const minDate = thisBooking.datePicker.minDate;
    const maxDate = thisBooking.datePicker.maxDate;
      

    for(let item of eventsRepeat){
      if(item.repeat == 'daily'){
        for(let loopDate = minDate;loopDate <= maxDate; loopDate = utils.addDays(loopDate, 1)){
          thisBooking.makeBooked(utils.dateToStr(loopDate),item.hour, item.duration, item.table);
          }
        }
      }
    }
    //console.log('thisBooking.booked', thisBooking.booked);
    
    thisBooking.updateDOM();
  
  }

  makeBooked(date, hour, duration, table){
    const thisBooking = this;

    if(typeof thisBooking.booked[date] == 'undefined'){
      thisBooking.booked[date] = {};
    }

    const startHour = utils.hourToNumber(hour);

    for (let hourBlock = startHour; hourBlock < startHour + duration; hourBlock += 0.5){
      //console.log('loop',index);

    if(typeof thisBooking.booked[date][hourBlock] == 'undefined'){
      thisBooking.booked[date][hourBlock] = [];
    }

    thisBooking.booked[date][hourBlock].push(table);
   }
  }

  updateDOM(){
    const thisBooking = this;

    thisBooking.date = thisBooking.datePickerWidget.value;
    thisBooking.hour = utils.hourToNumber(thisBooking.hourPickerWidget.value);

    let allAvailable = false;

    if(
      typeof thisBooking.booked[thisBooking.date] == 'undefined'
      ||
      typeof thisBooking.booked[thisBooking.date][thisBooking.hour] == 'undefined'
    ){
    
    allAvailable = true;
    }

    for(let table of thisBooking.dom.tables){
      let tableId = table.getAttribute(settings.booking.tableIdAttribute);
      if(!NaN(tableId)){
        tableId = parseInt(tableId);
      }

      if(
        !allAvailable
         &&
        thisBooking.booked[thisBooking.date][thisBooking.hour].includes(tableId) > -1
      ){
      
        table.classList.add(classNames.booking.tableBooked);
      } else {
        table.classList.remove(classNames.booking.tableBooked);
      }
    }
  }

  initTables(event) {
    const thisBooking = this;
    const clickedElm = event.target;

    const clickedTable = clickedElm.classList.contains(classNames.booking.table);
    const clickedTableBooked = clickedElm.classList.contains(classNames.booking.tableBooked);
    const idTable = clickedElm.getAttribute(settings.booking.tableIdAttribute);

    if (clickedTable){
      if(!clickedTableBooked){
        for(let table of thisBooking.dom.tables){
          table.classList.remove(classNames.booking.tableSelecetd);

          thisBooking.selectedTable =[];
        }
        
        clickedElm.classList.add(classNames.booking.tableSelecetd);
        thisBooking.selectedTable.push(idTable);
        
        } else {
          alert('This table is not available, please choose another one!')
        }
      }
    }

  
    render(element){
    const thisBooking = this;

    const generatedHTML = templates.bookingWidget();

    /* generate HTML */
    thisBooking.dom = {};
    thisBooking.dom.wrapper = element;

    thisBooking.dom.wrapper.innerHTML = generatedHTML;
    
    /* create empty thisBooking.dom */

    thisBooking.dom.peopleAmount = element.querySelector(select.booking.peopleAmount);
    thisBooking.dom.hoursAmount = element.querySelector(select.booking.hoursAmount);
    
    thisBooking.dom.datePicker = element.querySelector(select.widgets.datePicker.wrapper);
    thisBooking.dom.hourPicker = element.querySelector(select.widgets.hourPicker.wrapper);

    thisBooking.dom.tables = thisBooking.dom.wrapper.querySelectorAll(select.booking.tables);
    thisBooking.dom.tablesWrapper = thisBooking.dom.wrapper.querySelector(select.containerOf.tables);



  }

  initWidgets(){
    const thisBooking = this;
   
    thisBooking.peopleAmountWidget = new AmountWidget(thisBooking.dom.peopleAmount);
    thisBooking.hoursAmountWidget = new AmountWidget(thisBooking.dom.hoursAmount);
    
    /*thisBooking.dom.peopleAmount.addEventListener('updated', function(event){
      event.preventDefault();
    });
    thisBooking.dom.hoursAmount.addEventListener('updated', function(event){
      event.preventDefault();
    });*/

    thisBooking.datePickerWidget = new DatePicker(thisBooking.dom.datePicker);
    thisBooking.hourPickerWidget = new HourPicker(thisBooking.dom.hourPicker);

    /*thisBooking.dom.datePicker.addEventListener('updated', function(event){
      event.preventDefault();
    });

    thisBooking.dom.hourPicker.addEventListener('updated', function(event){
      event.preventDefault();
    });*/

    thisBooking.dom.wrapper.addEventListener('updated', function(){
      thisBooking.updatedDOM();
    });

    thisBooking.dom.tablesWrapper.addEventListener('click', function(event){
      thisBooking.initTables(event);
    });

  }

  sendBooking(){
    const thisBooking = this;

    const url = settings.db.url + '/' + settings.db.booking;
    
    const payload = {
      "date": thisBooking.datePickerWidget.value,
      "hour": thisBooking.hourPickerWidget.value,
      "table": (!thisBooking.tableSelecetd == 0), // numer wybranego stolika (lub null jeśli nic nie wybrano), nie wiem co dalej
      "duration": thisBooking.hoursAmountWidget.value,
      "ppl": thisBooking.peopleAmountWidget.value,
      "starters": [],
      "phone": thisBooking.phone.value,
      "address": thisBooking.address.value,
      };

    for(let prod of thisCart.products) {
      payload.products.push(prod.getData());
    }
    
    const options = {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    };
  }
    
}

export default Booking;