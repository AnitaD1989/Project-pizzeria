import { settings, select } from '../settings.js'
class AmountWidget{
  constructor(element){
    const thisWidget = this;

    thisWidget.getElements(element);
    thisWidget.setValue(thisWidget.input.value || settings.amountWidget.defaultValue);
    thisWidget.initActions();

    console.log('AmountWidget:', thisWidget);
    console.log('constructor arguments:', element);
  }

  getElements(element){
    const thisWidget = this;
  
    thisWidget.element = element;
    thisWidget.input = thisWidget.element.querySelector(select.widgets.amount.input);
    thisWidget.linkDecrease = thisWidget.element.querySelector(select.widgets.amount.linkDecrease);
    thisWidget.linkIncrease = thisWidget.element.querySelector(select.widgets.amount.linkIncrease);
    
  }

  setValue(value){
    const thisWidget = this;
    
    // convert value to integer
    const newValue = parseInt(value);
    
     
    // check if value getting into the function differs from actual thisWidget.value and has no null
    if (thisWidget.value !== newValue && !isNaN(newValue) && value <= settings.amountWidget.defaultMax && value >= settings.amountWidget.defaultMin){
      thisWidget.value = newValue;
      thisWidget.announce();
    }

    thisWidget.input.value = thisWidget.value;
  }

  initActions(){
    const thisWidget = this;
    
    // add "change" eventListner
    thisWidget.input.addEventListener('change', function(){
      thisWidget.setValue(thisWidget.input.value);
    });
    
    //add "click" EventListner 
    thisWidget.linkDecrease.addEventListener('click', function(event){

      // stop domyslna akcje 
      event.preventDefault();

      // use method setValue with argument thisWidget.value and decrease it with 1
      thisWidget.setValue(thisWidget.value - 1);
    });
    
    thisWidget.linkIncrease.addEventListener('click', function(event){
      event.preventDefault();

      // use method setValue with argument thisWidget.value and icrease it with 1
      thisWidget.setValue(thisWidget.value + 1);
    });

  }

  announce(){
    const thisWidget = this;

    const event = new CustomEvent('updated',{
      bubbles: true
    });
    
    thisWidget.element.dispatchEvent(event);
  }
}
export default AmountWidget;