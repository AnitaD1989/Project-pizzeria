/* global utils, dataSource */ // eslint-disable-line no-unused-vars

{
  'use strict';

  const select = {
    templateOf: {
      menuProduct: '#template-menu-product',
      cartProduct: '#template-cart-product', // CODE ADDED
    },
    containerOf: {
      menu: '#product-list',
      cart: '#cart',
    },
    all: {
      menuProducts: '#product-list > .product',
      menuProductsActive: '#product-list > .product.active',
      formInputs: 'input, select',
    },
    menuProduct: {
      clickable: '.product__header',
      form: '.product__order',
      priceElem: '.product__total-price .price',
      imageWrapper: '.product__images',
      amountWidget: '.widget-amount',
      cartButton: '[href="#add-to-cart"]',
    },
    widgets: {
      amount: {
        input: 'input.amount', // CODE CHANGED
        linkDecrease: 'a[href="#less"]',
        linkIncrease: 'a[href="#more"]',
      },
    },

    // CODE ADDED START
    cart: {
      productList: '.cart__order-summary',
      toggleTrigger: '.cart__summary',
      totalNumber: `.cart__total-number`,
      totalPrice: '.cart__total-price strong, .cart__order-total .cart__order-price-sum strong',
      subtotalPrice: '.cart__order-subtotal .cart__order-price-sum strong',
      deliveryFee: '.cart__order-delivery .cart__order-price-sum strong',
      form: '.cart__order',
      formSubmit: '.cart__order [type="submit"]',
      phone: '[name="phone"]',
      address: '[name="address"]',
    },
    cartProduct: {
      amountWidget: '.widget-amount',
      price: '.cart__product-price',
      edit: '[href="#edit"]',
      remove: '[href="#remove"]',
    },
    // CODE ADDED END
  };


  const classNames = {
    menuProduct: {
      wrapperActive: 'active',
      imageVisible: 'active',
    },
    // CODE ADDED START
    cart: {
      wrapperActive: 'active',
    },
  // CODE ADDED END
  };

  const settings = {
    amountWidget: {
      defaultValue: 1,
      defaultMin: 1,
      defaultMax: 9,
    }, // CODE CHANGED
    
    // CODE ADDED START
    cart: {
      defaultDeliveryFee: 20,
    },

    db: {
      url: '//localhost:3131',
      products: 'products',
      orders: 'orders',
    },
    // CODE ADDED END
  };

  const templates = {
    menuProduct: Handlebars.compile(document.querySelector(select.templateOf.menuProduct).innerHTML),
    
    // CODE ADDED START
    cartProduct: Handlebars.compile(document.querySelector(select.templateOf.cartProduct).innerHTML),
    // CODE ADDED END
  };

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
      app.cart.add(thisProduct.prepareCartProduct());
  
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
    
  class Cart {
    constructor(element){
      const thisCart = this;

      thisCart.products = [];
      thisCart.getElements(element);
      thisCart.initActions();

      console.log('new Cart:', thisCart);
    }

    getElements(element) {
      const thisCart = this;

      thisCart.dom = {};

      thisCart.dom.wrapper = element;
      thisCart.dom.toggleTrigger = thisCart.dom.wrapper.querySelector(select.cart.toggleTrigger);
      thisCart.dom.productList = thisCart.dom.wrapper.querySelector(select.cart.productList);
      thisCart.dom.deliveryFee = thisCart.dom.wrapper.querySelector(select.cart.deliveryFee);
      thisCart.dom.subtotalPrice = thisCart.dom.wrapper.querySelector(select.cart.subtotalPrice);
      thisCart.dom.totalPrice = thisCart.dom.wrapper.querySelectorAll(select.cart.totalPrice);
      thisCart.dom.totalNumber = thisCart.dom.wrapper.querySelector(select.cart.totalNumber);
      thisCart.dom.form = thisCart.dom.wrapper.querySelector(select.cart.form);
      thisCart.dom.phone = thisCart.dom.wrapper.querySelector(select.cart.phone);
      thisCart.dom.address = thisCart.dom.wrapper.querySelector(select.cart.address);
    }

    initActions(){
      const thisCart = this;
  
      thisCart.dom.toggleTrigger.addEventListener('click', function(){
        thisCart.dom.wrapper.classList.toggle(classNames.cart.wrapperActive);
      });
      
      thisCart.dom.productList.addEventListener('updated', function(){
        thisCart.update();
      });

      thisCart.dom.productList.addEventListener('remove', function() {
        thisCart.remove(event.detail.cartProduct);
      });

      thisCart.dom.form.addEventListener('submit', function(event){
        event.preventDefault();
        thisCart.sendOrder();
      });
    }


    add(menuProduct){
      
      const thisCart = this;
      
      const generatedHTML = templates.cartProduct(menuProduct);//thisCart.data);
      const generatedDOM = utils.createDOMFromHTML(generatedHTML);
      thisCart.dom.productList.appendChild(generatedDOM);
      thisCart.products.push(new CartProduct(menuProduct, generatedDOM));
      thisCart.update();
    }

    update(){
      const thisCart = this;

      thisCart.deliveryFee = settings.cart.defaultDeliveryFee;
      thisCart.totalNumber = 0;
      thisCart.subtotalPrice = 0;

      for (let cartProduct of thisCart.products) {
        thisCart.totalNumber += cartProduct.amount;
        thisCart.subtotalPrice += cartProduct.price;
      }

      if (thisCart.totalNumber == 0){
        thisCart.totalPrice = 0;
      } else {
        thisCart.totalPrice = thisCart.subtotalPrice + thisCart.deliveryFee;
      }
        
      // aktualizowanie html koszyka
      for (let totalPriceCart of thisCart.dom.totalPrice){
        totalPriceCart.innerHTML = thisCart.totalPrice;
      }
        
      thisCart.dom.totalNumber.innerHTML = thisCart.totalNumber;
      thisCart.dom.subtotalPrice.innerHTML = thisCart.subtotalPrice;
      thisCart.dom.deliveryFee.innerHTML = thisCart.deliveryFee;
    }
    
    remove(cartProduct){
      const thisCart = this;
      
      const indexOfProducts = thisCart.products.indexOf(cartProduct);
      thisCart.products.splice(indexOfProducts, 1);
      cartProduct.dom.wrapper.remove();

      thisCart.update();
      
    }

    sendOrder(){
      const thisCart = this;

      const url = settings.db.url + '/' + settings.db.orders;
      const payload = {
        address: thisCart.address.value,
        phone: thisCart.phone.value,
        totalPrice: thisCart.totalPrice,
        subtotalPrice: thisCart.subtotalPrice,
        totalNumber: thisCart.totalPrice,
        deliveryFee: thisCart.deliveryFee,
        products: [],
      }

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
      
      fetch(url, options);

      

    }


  }

  class CartProduct {
    constructor(menuProduct, element){
      const thisCartProduct = this;

      thisCartProduct.menuProduct = menuProduct;
      thisCartProduct.element = element;

      thisCartProduct.id = menuProduct.id;
      thisCartProduct.name = menuProduct.name;
      thisCartProduct.amount = menuProduct.amount;
      thisCartProduct.priceSingle = menuProduct.priceSingle;
      thisCartProduct.price = menuProduct.price;
      thisCartProduct.params = menuProduct.params;
      thisCartProduct.getElements(element);   
      thisCartProduct.initAmountWidget();
      thisCartProduct.initActions();

      thisCartProduct.getElements(element);
      console.log('thisCartProduct:', thisCartProduct);
    }

    getElements(element) {
      const thisCartProduct = this;
        
      thisCartProduct.dom= {};
      thisCartProduct.dom.wrapper = element;
      thisCartProduct.dom.amountWidget = thisCartProduct.dom.wrapper.querySelector(select.cartProduct.amountWidget);
      thisCartProduct.dom.price = thisCartProduct.dom.wrapper.querySelector(select.cartProduct.price);
      thisCartProduct.dom.edit = thisCartProduct.dom.wrapper.querySelector(select.cartProduct.edit);
      thisCartProduct.dom.remove = thisCartProduct.dom.wrapper.querySelector(select.cartProduct.remove);
      
    }

    getData(){
      const thisCartProduct = this;

      const newObject = {
        id: thisCartProduct.id,
        amount: thisCartProduct.amount,
        price: thisCartProduct.price,
        priceSingle: thisCartProduct.priceSingle,
        name: thisCartProduct.name,
        params: thisCartProduct.params
      };

      return newObject;
    }

    initAmountWidget(){
      const thisCartProduct = this;

      thisCartProduct.amountWidget = new AmountWidget(thisCartProduct.dom.amountWidget);
      thisCartProduct.dom.amountWidget.addEventListener('updated', function(){
        thisCartProduct.amount = thisCartProduct.amountWidget.value;
        thisCartProduct.price = thisCartProduct.priceSingle * thisCartProduct.amountWidget.value;
        thisCartProduct.dom.price.innerHTML = thisCartProduct.price;
      });

    }

    remove(){
      const thisCartProduct = this;

      const event = new CustomEvent('remove',{
        bubbles: true,
        detail: {
          cartProduct: thisCartProduct,
        },
      });
      thisCartProduct.dom.wrapper.dispatchEvent(event);
    }

    initActions(){
      const thisCartProduct= this;

      thisCartProduct.dom.edit.addEventListener('click', function(event){
        event.preventDefault();
      });
      
      thisCartProduct.dom.remove.addEventListener('click', function(event){
        event.preventDefault();
        thisCartProduct.remove();
      });

    }
  }
      
  const app = {
    initMenu: function(){
      const thisApp = this;
      console.log('thisApp.data:', thisApp.data);

      for( let productData in thisApp.data.products){
        new Product(thisApp.data.products[productData].id, thisApp.data.products[productData]);
      }
    },

    initData: function(){
      const thisApp = this;

      thisApp.data = {};
      const url = settings.db.url + '/' + settings.db.products;

      fetch(url)
        .then(function(rawResponse){
          return rawResponse.json();
        })
        .then(function(parsedResponse){
          console.log('parsedResponse', parsedResponse);

          // save parsedResponse as thisApp.data.products
          parsedResponse = thisApp.data.products;

          // execute initMenu method
          thisApp.initMenu();
        });



        console.log('thisApp.data', JSON.stringify(thisApp.data));
    },

    initCart: function(){
      const thisApp = this;
      const cartElem = document.querySelector(select.containerOf.cart);
      thisApp.cart = new Cart(cartElem);
    },
    
    init: function(){
      const thisApp = this;
      console.log('*** App starting ***');
      console.log('thisApp:', thisApp);
      console.log('classNames:', classNames);
      console.log('settings:', settings);
      console.log('templates:', templates);
      thisApp.initData();
      thisApp.initCart();
    },

  };

  app.init();
}