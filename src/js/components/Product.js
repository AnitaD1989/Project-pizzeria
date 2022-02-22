class Product {
  constructor(id, data){
    const thisProduct = this;

    thisProduct.id =id;
    thisProduct.data= data;

    thisProduct.renderInMenu();
    thisProduct.getElements();
    thisProduct.initAccordion();
    thisProduct.initAmountWidget();
    thisProduct.processOrder();
    thisProduct.initActions();
    
    console.log('new Product:', thisProduct);
  }

  renderInMenu(){
    const thisProduct = this;

    /* generate HTML based on template */
    const generatedHTML = templates.menuProduct(thisProduct.data);

    /* create element using utilis.createElementFromHTML */
    thisProduct.element = utils.createDOMFromHTML(generatedHTML);

    /* find menu container */
    const menuContainer = document.querySelector(select.containerOf.menu);

    /* add menu */
    menuContainer.appendChild(thisProduct.element);
  }

  getElements(){
    const thisProduct = this;
  
    thisProduct.accordionTrigger = thisProduct.element.querySelector(select.menuProduct.clickable);
    thisProduct.form = thisProduct.element.querySelector(select.menuProduct.form);
    thisProduct.formInputs = thisProduct.form.querySelectorAll(select.all.formInputs);
    thisProduct.cartButton = thisProduct.element.querySelector(select.menuProduct.cartButton);
    thisProduct.priceElem = thisProduct.element.querySelector(select.menuProduct.priceElem);
    thisProduct.imageWrapper = thisProduct.element.querySelector(select.menuProduct.imageWrapper);
    thisProduct.amountWidgetElem = thisProduct.element.querySelector(select.menuProduct.amountWidget);
  }

  initAccordion(){
    const thisProduct = this;

    /* START: add event listener to clickable trigger on event click */
    //clickableTrigger.addEventListener('click', function(event)
    thisProduct.accordionTrigger.addEventListener('click', function(event)  {
      
      /* prevent default action for event */
      event.preventDefault();

      /* find active product (product that has active class) */
      const activeProduct = document.querySelector('.product.active');

      /* if there is active product and it's not thisProduct.element, remove class active from it */
      if (activeProduct && thisProduct.element !== activeProduct) {
        activeProduct.classList.remove(classNames.menuProduct.wrapperActive);
      }
      
      /* toggle active class on thisProduct.element */
      thisProduct.element.classList.toggle(classNames.menuProduct.wrapperActive);

    });
  }
      
  initOrderForm(){
    const thisProduct = this;
    console.log('new form:',thisProduct );

    thisProduct.form.addEventListener('submit', function(event){
      event.preventDefault();
      thisProduct.processOrder();
    });
    
    for(let input of thisProduct.formInputs){
      input.addEventListener('change', function(){
        thisProduct.processOrder();
      });
    }

    thisProduct.cartButton.addEventListener('click', function(event){
      event.preventDefault();
      thisProduct.addToCart();
      thisProduct.processOrder();
    });
  }
  
  
  processOrder() {
    const thisProduct = this;
    console.log('order:',thisProduct);
    
    // covert form to object structure e.g. { sauce: ['tomato'], toppings: ['olives', 'redPeppers']}
    const formData = utils.serializeFormToObject(thisProduct.form);
    console.log('formData', formData);


    // set price to default price
    let price = thisProduct.data.price;

    // for every category (param)...
    for(let paramId in thisProduct.data.params) {
    // determine param value, e.g. paramId = 'toppings', param = { label: 'Toppings', type: 'checkboxes'... }
      const param = thisProduct.data.params[paramId];
      console.log(paramId, param);

      // for every option in this category
      for(let optionId in param.options) {
        // determine option value, e.g. optionId = 'olives', option = { label: 'Olives', price: 2, default: true }
        const option = param.options[optionId];
        console.log(optionId, option);

        // check if there is param with a name of paramId in formData and if it includes optionId
        // if(formData[paramId] && formData[paramId].includes(optionId)) {
         
        const selectedOption = formData[paramId] && formData[paramId].includes(optionId);
        if (selectedOption){
        // check if the option is not default
          if(!option.default == true) {
            // add option price to price variable
            option.price += price;
          }
        }  else {
        // check if the option is default
          if(option.default == true){
            // reduce price variable
            price -= option.price;  
          }
        }
        
        // find image with the class .paramId-optionId
        const optionImage = thisProduct.imageWrapper.querySelector('.' + paramId + '-' + optionId);
        console.log('optionImage:', optionImage);

        // check if the image is active and add visible when selected or remove imageVisible when not selected
        if (optionImage) {
          if (selectedOption){
            optionImage.classList.add(classNames.menuProduct.imageVisible);
          } else {
            optionImage.classList.remove(classNames.menuProduct.imageVisible);
          }
        }
      }
    }

    thisProduct.priceSingle = price;

    // multiply price by amount
    price *= thisProduct.amountWidget.value;
    thisProduct.price = price;
    
    // update calculated price in the HTML
    thisProduct.priceElem.innerHTML = price;
  }
   
  // SWITCH initActions
  initActions() {
    const thisProduct = this;
    thisProduct.form.addEventListener('click', function() {
      thisProduct.processOrder();
    });

    thisProduct.cartButton.addEventListener('click', function() {
      thisProduct.addToCart();
    });
  }



  initAmountWidget(){
    const thisProduct = this;

    thisProduct.amountWidget = new AmountWidget(thisProduct.amountWidgetElem);
    thisProduct.amountWidgetElem.addEventListener('updated', function(){
      thisProduct.processOrder();
    });

  }

  addToCart() {
    const thisProduct = this;

    thisProduct.name = thisProduct.data.name;
    thisProduct.amount = thisProduct.amountWidget.value;
    
    //app.cart.add(thisProduct.prepareCartProduct());
    const event = new CustomEvent('add-to-cart', {
      bubbles = true,
      detail: {
        product: thisProduct,
      },
    });

    thisProduct.element.dispatchEvent(event);
  }

  prepareCartProduct(){
    const thisProduct = this;

    const productSummary = {};
    productSummary.id = thisProduct.id;
    productSummary.name = thisProduct.data.name;
    productSummary.amount = thisProduct.amountWidget.value;
    productSummary.priceSingle = thisProduct.priceSingle;
    productSummary.price = thisProduct.priceSingle * thisProduct.amountWidget.value;
    productSummary.params = thisProduct.prepareCartProductParams();

    return productSummary;

  }

  prepareCartProductParams(){
    const thisProduct = this;
    console.log('order:',thisProduct);
    
    // covert form to object structure e.g. { sauce: ['tomato'], toppings: ['olives', 'redPeppers']}
    const formData = utils.serializeFormToObject(thisProduct.form);
    console.log('formData', formData);

    const params = {};


    // for every category (param)...
    for(let paramId in thisProduct.data.params) {
      const param = thisProduct.data.params[paramId];

      // create category param in params const eg. params = { ingredients: { name: 'Ingredients', options: {}}}
      params[paramId] = {
        label: param.label,
        options: {}
      };
      // for every option in this category
      for(let optionId in param.options) {
        // determine option value, e.g. optionId = 'olives', option = { label: 'Olives', price: 2, default: true }
        const option = param.options[optionId];
        console.log(optionId, option);
        const selectedOption = formData[paramId] && formData[paramId].includes(optionId);
        
        if (selectedOption) {
          // option is selected!
          params[paramId].options[optionId] = option.label;
          
        }
      }
    }

    return params;
    
  
  }
}

export default Product;