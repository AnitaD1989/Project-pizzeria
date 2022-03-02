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