import { settings, select } from '../settings.js';
import BaseWidget from './BaseWidget.js';

class AmountWidget extends BaseWidget {
  constructor(element){
    
    super(element, settings.amountWidget.defaultValue);
    
    const thisWidget = this;

    thisWidget.getElements(element);
    //thisWidget.setValue(thisWidget.dom.input.value || settings.amountWidget.defaultValue);
    thisWidget.initActions();

    console.log('AmountWidget:', thisWidget);
    //console.log('constructor arguments:', element);
  }

  getElements(element){
    const thisWidget = this;
  
    thisWidget.dom.wrapper = element;
    thisWidget.dom.input = thisWidget.dom.wrapper.querySelector(select.widgets.amount.input);
    thisWidget.dom.linkDecrease = thisWidget.dom.wrapper.querySelector(select.widgets.amount.linkDecrease);
    thisWidget.dom.linkIncrease = thisWidget.dom.wrapper.querySelector(select.widgets.amount.linkIncrease);
    
  }

  setValue(value){
    const thisWidget = this;
    
    // convert value to integer
    const newValue = thisWidget.parseValue(value);
    
     
    // check if value getting into the function differs from actual thisWidget.value and has no null
    if (thisWidget.value !== newValue && thisWidget.isValid(newValue)){
      thisWidget.value = newValue;
      thisWidget.announce();
    }

    thisWidget.renderValue();
  }

  isValid(value){
    return !isNaN(value) 
    && value >= settings.amountWidget.defaultMin 
    && value <= settings.AmountWidget.defaultMax;
  }

  renderValue(){
    const thisWidget = this;

    thisWidget.dom.input.value =thisWidget.value;
  }

  initActions(){
    const thisWidget = this;
    
    // add "change" eventListner
    thisWidget.dom.input.addEventListener('change', function(){
      thisWidget.setValue(thisWidget.dom.input.value);
    });
    
    //add "click" EventListner 
    thisWidget.dom.linkDecrease.addEventListener('click', function(event){

      // stop domyslna akcje 
      event.preventDefault();

      // use method setValue with argument thisWidget.value and decrease it with 1
      thisWidget.setValue(thisWidget.value - 1);
    });
    
    thisWidget.dom.linkIncrease.addEventListener('click', function(event){
      event.preventDefault();

      // use method setValue with argument thisWidget.value and icrease it with 1
      thisWidget.setValue(thisWidget.value + 1);
    });

  }

}
export default AmountWidget;